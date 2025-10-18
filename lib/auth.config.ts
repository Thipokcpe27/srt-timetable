/**
 * NextAuth Configuration
 * Authentication setup for admin panel
 */

import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { logger } from './logger';

export const authConfig: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          logger.warn('Login attempt with missing credentials', 'Auth');
          return null;
        }

        try {
          // Find admin user by username or email
          const adminUser = await prisma.adminUser.findFirst({
            where: {
              OR: [
                { username: credentials.username as string },
                { email: credentials.username as string },
              ],
              isActive: true,
            },
            include: {
              role: {
                select: {
                  id: true,
                  code: true,
                  nameTh: true,
                  nameEn: true,
                  permissions: true,
                },
              },
            },
          });

          if (!adminUser) {
            logger.warn(`Login failed: User not found - ${credentials.username}`, 'Auth');
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            adminUser.passwordHash
          );

          if (!isValidPassword) {
            logger.warn(`Login failed: Invalid password for ${adminUser.username}`, 'Auth');
            return null;
          }

          // Update last login
          await prisma.adminUser.update({
            where: { id: adminUser.id },
            data: {
              lastLoginAt: new Date(),
              lastLoginIp: 'N/A', // Will be set by middleware
            },
          });

          logger.info(`Admin user logged in: ${adminUser.username}`, 'Auth');

          // Return user object for session
          return {
            id: adminUser.id,
            username: adminUser.username,
            email: adminUser.email,
            fullName: adminUser.fullName,
            role: {
              id: adminUser.role.id,
              code: adminUser.role.code,
              name: adminUser.role.nameTh,
              permissions: adminUser.role.permissions,
            },
          };
        } catch (error) {
          logger.error('Login error', error as Error, 'Auth');
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.fullName = (user as any).fullName;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          username: token.username as string,
          email: token.email as string,
          fullName: token.fullName as string,
          role: token.role as any,
        };
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
