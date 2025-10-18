/**
 * Environment Variables Validation
 * Using @t3-oss/env-nextjs for type-safe environment variables
 */

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Server-side environment variables
   * Never exposed to the client
   */
  server: {
    DATABASE_URL: z.string().default('sqlserver://localhost:1433;database=SRTTimeTable;encrypt=false'),
    NEXTAUTH_SECRET: z.string().min(32).default('default-secret-please-change-in-production-min-32-chars'),
    NEXTAUTH_URL: z.string().url().optional(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },

  /**
   * Client-side environment variables
   * Must be prefixed with NEXT_PUBLIC_
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_APP_NAME: z.string().default('SRT Timetable'),
  },

  /**
   * Runtime environment variables
   * For Next.js
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },

  /**
   * Skip validation during build
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  
  /**
   * Emit error if validation fails
   */
  emptyStringAsUndefined: true,
});
