import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:./sqlite.db", // 👈 this could also be a path to the local sqlite file
  },
} satisfies Config;
