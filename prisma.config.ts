import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Load environment variables from .env file
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});
