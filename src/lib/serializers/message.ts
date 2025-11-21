import type { Message } from '@prisma/client';

export function serializeMessage(message: Message) {
  return {
    ...message,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}
