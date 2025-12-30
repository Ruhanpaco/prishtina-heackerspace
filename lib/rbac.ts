/**
 * ROLE-BASED ACCESS CONTROL (RBAC) SYSTEM
 * 
 * This file defines the roles, permissions, and logic for controlling access
 * to different parts of the application.
 */

export type Role = 'ADMIN' | 'STAFF' | 'MEMBER' | 'USER';

export enum Permission {
    // User Management
    USER_READ_ALL = 'user:read:all',
    USER_UPDATE_ALL = 'user:update:all',
    USER_DELETE_ALL = 'user:delete:all',

    // Space Presence
    SPACE_CHECKIN = 'space:checkin',
    SPACE_PRESENCE_VIEW = 'space:presence:view',

    // Finances
    PAYMENT_READ_ALL = 'payment:read:all',
    PAYMENT_MANAGE = 'payment:manage',
    PAYMENT_VERIFY = 'payment:verify',

    // Documents
    DOCUMENT_VERIFY = 'document:verify',
    DOCUMENT_READ_ALL = 'document:read:all',

    // Projects
    PROJECT_CREATE = 'project:create',
    PROJECT_UPDATE_ALL = 'project:update:all',

    // Audit Logging
    AUDIT_LOG_READ = 'audit:log:read'
}

/**
 * Role to Permissions mapping
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    ADMIN: Object.values(Permission), // Admins have all permissions
    STAFF: [
        Permission.USER_READ_ALL,
        Permission.USER_UPDATE_ALL,
        Permission.SPACE_CHECKIN,
        Permission.SPACE_PRESENCE_VIEW,
        Permission.PAYMENT_READ_ALL,
        Permission.DOCUMENT_VERIFY,
        Permission.DOCUMENT_READ_ALL,
        Permission.PROJECT_UPDATE_ALL,
        Permission.AUDIT_LOG_READ,
        Permission.PAYMENT_VERIFY
    ],
    MEMBER: [
        Permission.SPACE_PRESENCE_VIEW,
        Permission.PROJECT_CREATE
    ],
    USER: [
        Permission.SPACE_PRESENCE_VIEW
    ]
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
    const list = ROLE_PERMISSIONS[role];
    if (!list) return false;
    return list.includes(permission);
}

/**
 * Check if a role is equal to or higher than another role in hierarchy
 * Hierarchy: ADMIN (3) > STAFF (2) > MEMBER (1) > USER (0)
 */
const ROLE_LEVELS: Record<Role, number> = {
    ADMIN: 3,
    STAFF: 2,
    MEMBER: 1,
    USER: 0
};

export function isRoleAtLeast(currentRole: Role, requiredRole: Role): boolean {
    return ROLE_LEVELS[currentRole] >= ROLE_LEVELS[requiredRole];
}
