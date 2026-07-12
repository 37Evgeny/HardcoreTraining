import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Загружаем .env вручную (Prisma v7 не делает это автоматически)
config({ path: '.env' });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
});