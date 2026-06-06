import { Client } from "@upstash/qstash";

// Initialize QStash client
// Ensure UPSTASH_API_KEY is available in the environment variables
export const qstashClient = new Client({
  token: process.env.UPSTASH_API_KEY || process.env.QSTASH_TOKEN || "",
});
