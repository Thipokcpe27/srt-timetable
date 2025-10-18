/**
 * Authentication Helper Functions
 * Utilities for checking permissions and auth status
 */

import { getServerSession } from 'next-auth';
import { authConfig } from './auth.config';
import { NextRequest } from 'next/server';

export interface AdminSession {
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: {
      id: number;
      code: string;
      name: string;
      permissions: string;
    };
  };
}

/**
 * Get current admin session
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getServerSession(authConfig);
  return session as AdminSession | null;
}

/**
 * Check if user has specific permission
 */
export function hasPermission(
  permissions: string,
  requiredPermission: string
): boolean {
  try {
    const permissionsArray = JSON.parse(permissions);
    return Array.isArray(permissionsArray) && permissionsArray.includes(requiredPermission);
  } catch {
    return false;
  }
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  permissions: string,
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some((perm) => hasPermission(permissions, perm));
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(
  permissions: string,
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every((perm) => hasPermission(permissions, perm));
}

/**
 * Check if user is admin
 */
export function isAdmin(roleCode: string): boolean {
  return roleCode === 'admin' || roleCode === 'super_admin';
}

/**
 * Get session from API route
 */
export async function getSessionFromRequest(
  request: NextRequest
): Promise<AdminSession | null> {
  return await getAdminSession();
}

/**
 * Require authentication for API route
 * Throws error if not authenticated
 */
export async function requireAuth(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    throw new Error('Unauthorized: Authentication required');
  }

  return session;
}

/**
 * Require specific permission for API route
 * Throws error if user doesn't have permission
 */
export async function requirePermission(permission: string): Promise<AdminSession> {
  const session = await requireAuth();

  if (!hasPermission(session.user.role.permissions, permission)) {
    throw new Error(`Forbidden: Missing required permission: ${permission}`);
  }

  return session;
}

/**
 * Require admin role
 * Throws error if user is not admin
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await requireAuth();

  if (!isAdmin(session.user.role.code)) {
    throw new Error('Forbidden: Admin access required');
  }

  return session;
}

/**
 * Permission constants
 */
export const PERMISSIONS = {
  // Train management
  TRAINS_VIEW: 'trains:view',
  TRAINS_CREATE: 'trains:create',
  TRAINS_UPDATE: 'trains:update',
  TRAINS_DELETE: 'trains:delete',

  // Station management
  STATIONS_VIEW: 'stations:view',
  STATIONS_CREATE: 'stations:create',
  STATIONS_UPDATE: 'stations:update',
  STATIONS_DELETE: 'stations:delete',

  // Pricing management
  PRICING_VIEW: 'pricing:view',
  PRICING_CREATE: 'pricing:create',
  PRICING_UPDATE: 'pricing:update',
  PRICING_DELETE: 'pricing:delete',

  // Announcement management
  ANNOUNCEMENTS_VIEW: 'announcements:view',
  ANNOUNCEMENTS_CREATE: 'announcements:create',
  ANNOUNCEMENTS_UPDATE: 'announcements:update',
  ANNOUNCEMENTS_DELETE: 'announcements:delete',

  // User management
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',

  // System
  SYSTEM_ADMIN: 'system:admin',
} as const;
