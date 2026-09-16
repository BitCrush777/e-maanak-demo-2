import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedUser {
  id: string;
  supabaseAuthId: string;
  email: string;
  fullName: string;
  role: Role;
  status: string;
}

/**
 * Find application user by Supabase Auth ID
 */
export async function findUserBySupabaseId(supabaseAuthId: string): Promise<AuthenticatedUser | null> {
  const user = await prisma.user.findUnique({
    where: { supabaseAuthId },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    supabaseAuthId: user.supabaseAuthId,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
  };
}

/**
 * Find application user by email
 */
export async function findUserByEmail(email: string): Promise<AuthenticatedUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    supabaseAuthId: user.supabaseAuthId,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
  };
}

/**
 * Create application user linked to Supabase Auth
 */
export async function createUser(
  supabaseAuthId: string,
  email: string,
  fullName: string,
  role: Role = 'OWNER',
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' = 'ACTIVE'
): Promise<AuthenticatedUser> {
  const user = await prisma.user.create({
    data: {
      supabaseAuthId,
      email,
      fullName,
      role,
      status,
    },
  });

  return {
    id: user.id,
    supabaseAuthId: user.supabaseAuthId,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
  };
}

/**
 * Update user status
 */
export async function updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<AuthenticatedUser | null> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  return {
    id: user.id,
    supabaseAuthId: user.supabaseAuthId,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
  };
}

/**
 * Get all users with pagination
 */
export async function getUsers(page: number = 1, pageSize: number = 20) {
  const skip = (page - 1) * pageSize;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
