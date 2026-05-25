import { createClient } from "redis";

type RedisPipeline = {
  xAdd: (key: string, id: string, data: Record<string, string>) => unknown;
  xAck: (key: string, group: string, id: string) => unknown;
  exec: () => Promise<unknown>;
};

export type RedisStreamClient = {
  isOpen: boolean;
  connect: () => Promise<unknown>;
  xAdd: (key: string, id: string, data: Record<string, string>) => Promise<unknown>;
  xGroupCreate: (
    key: string,
    group: string,
    id: string,
    options?: { MKSTREAM?: boolean },
  ) => Promise<unknown>;
  xReadGroup: (
    group: string,
    consumer: string,
    streams: { key: string; id: string },
    options?: { COUNT?: number; BLOCK?: number },
  ) => Promise<unknown>;
  multi: () => RedisPipeline;
};

export const client: RedisStreamClient = createClient().on("error", (err) =>
  console.error("Redis error:", err),
) as RedisStreamClient;

export async function connectRedis() {
  if (!client.isOpen) await client.connect();
}

export { pushWebsiteCheck, pushBulkWebsiteChecks } from "./producer.js";
export { createGroups, getWebsiteChecks, ackWebsiteChecks } from "./consumer.js";
