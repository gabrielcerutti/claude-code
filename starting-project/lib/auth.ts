import { betterAuth } from "better-auth";
import { Database } from "bun:sqlite";
import { nextCookies } from "better-auth/next-js";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const DB_PATH = process.env.DB_PATH || "data/app.db";

mkdirSync(dirname(DB_PATH), { recursive: true });

export const auth = betterAuth({
  database: new Database(DB_PATH),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});
