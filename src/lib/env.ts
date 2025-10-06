import "dotenv/config";
import { z } from "zod";

export const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z
      .string()
      .min(1, { message: "DATABASE_URL is required" })
      .regex(/^mongodb(\+srv)?:\/\//, {
        message: "DATABASE_URL must be a valid MongoDB connection string",
      }),
    NEXTAUTH_SECRET: z
      .string()
      .min(32, { message: "NEXTAUTH_SECRET must be at least 32 characters" }),
    NEXTAUTH_URL: z.string().url({ message: "NEXTAUTH_URL must be a valid URL" }).optional(),
    GOOGLE_CLIENT_ID: z.string().min(1, { message: "GOOGLE_CLIENT_ID is required" }),
    GOOGLE_CLIENT_SECRET: z.string().min(1, { message: "GOOGLE_CLIENT_SECRET is required" }),
    RESEND_API_KEY: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.NODE_ENV === "production" && !val.NEXTAUTH_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NEXTAUTH_URL"],
        message: "NEXTAUTH_URL is required in production",
      });
    }
  });

export type Env = z.infer<typeof EnvSchema>;

let cachedEnv: Env | null = null;

export function formatZodIssues(issues: z.ZodIssue[]): string {
  const lines = issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "<root>";
    return `- ${path}: ${issue.message}`;
  });
  return lines.join("\n");
}

export function validateEnv(raw: NodeJS.ProcessEnv): Env {
  const result = EnvSchema.safeParse({
    NODE_ENV: raw.NODE_ENV ?? "development",
    DATABASE_URL: raw.DATABASE_URL,
    NEXTAUTH_SECRET: raw.NEXTAUTH_SECRET,
    NEXTAUTH_URL: raw.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: raw.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: raw.GOOGLE_CLIENT_SECRET,
    RESEND_API_KEY: raw.RESEND_API_KEY,
  });

  if (!result.success) {
    const message = [
      "Environment configuration is invalid:",
      formatZodIssues(result.error.issues),
      "\nFix the variables above in your .env.local (or environment) and retry.",
    ].join("\n");
    throw new Error(message);
  }

  return result.data;
}

export function getServerEnv(): Env {
  if (cachedEnv) return cachedEnv;
  cachedEnv = validateEnv(process.env);
  return cachedEnv;
}
