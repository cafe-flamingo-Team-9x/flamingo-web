#!/usr/bin/env tsx

import "dotenv/config";
import { exit, stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { PrismaClient } from "@prisma/client";

validateEnv(process.env);
const prisma = new PrismaClient();

type SeedArgs = {
  email?: string;
  name?: string;
  syncUser?: boolean;
};

function parseArgs(argv: string[]): SeedArgs {
  const args: SeedArgs = {};

  for (const raw of argv) {
    const [key, value] = raw.split("=");
    if (!value) continue;

    switch (key) {
      case "--email":
        args.email = value;
        break;
      case "--name":
        args.name = value;
        break;
      case "--sync-user":
        args.syncUser = value !== "false";
        break;
      default:
        break;
    }
  }

  return args;
}

async function promptForMissing(
  args: SeedArgs,
): Promise<Required<Pick<SeedArgs, "email" | "name">>> {
  const rl = readline.createInterface({ input, output });

  try {
    const email = args.email ?? (await rl.question("Admin email address: ")).trim();
    if (!email) {
      throw new Error("Email is required.");
    }

    const name = args.name ?? (await rl.question("Admin display name (optional): ")).trim();

    return { email, name: name.length > 0 ? name : (args.name ?? "") };
  } finally {
    rl.close();
  }
}

async function main() {
  const cliArgs = parseArgs(process.argv.slice(2));
  const { email, name } = await promptForMissing(cliArgs);
  const normalizedEmail = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error(`Invalid email address: ${email}`);
  }

  const adminRecord = await prisma.admin.upsert({
    where: { email: normalizedEmail },
    update: {
      name: name.length > 0 ? name : undefined,
    },
    create: {
      email: normalizedEmail,
      name: name.length > 0 ? name : undefined,
    },
  });

  if (cliArgs.syncUser !== false) {
    await prisma.user.updateMany({
      where: { email: normalizedEmail },
      data: {
        isAdmin: true,
        name: adminRecord.name ?? undefined,
      },
    });
  }

  console.info("Admin allowlist updated:", adminRecord);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("Failed to seed admin:", error);
    await prisma.$disconnect();
    exit(1);
  });
