import { User, Role } from '../types';
import { db } from './db';
import {
  syncUserPinToSupabase,
  syncUserToSupabase,
  verifyOrSyncAdminPin,
  verifyOrSyncMemberPin,
} from './supabaseSync';

const AUTH_USER_KEY = 'vuew_current_user_id';
const AUTH_STATUS_KEY = 'vuew_is_authenticated';

export class AuthService {
  private currentUserId: string | null = null;

  constructor() {
    const saved = localStorage.getItem(AUTH_USER_KEY);
    // Sanitize any legacy demo ID
    if (!saved || saved === 'usr-5') {
      this.currentUserId = 'usr-admin';
      localStorage.setItem(AUTH_USER_KEY, 'usr-admin');
    } else {
      this.currentUserId = saved;
    }
    if (!localStorage.getItem(AUTH_STATUS_KEY)) {
      localStorage.setItem(AUTH_STATUS_KEY, 'true');
    }
  }

  public isAuthenticated(): boolean {
    return localStorage.getItem(AUTH_STATUS_KEY) === 'true';
  }

  public getCurrentUser(): User {
    const users = db.getUsers();
    if (this.currentUserId) {
      const found = users.find((u) => u.id === this.currentUserId);
      if (found) return found;
    }
    // Fallback to Admin or first user
    const admin = users.find((u) => u.role === 'ADMIN') || users[0];
    return admin;
  }

  public async adminLoginWithPin(pin: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const users = db.getUsers();
    const admin = users.find((u) => u.role === 'ADMIN');
    if (!admin) {
      return { success: false, error: 'No administrator account configured in workspace.' };
    }

    const cleanPin = pin.trim();
    if (admin.pin === cleanPin) {
      this.currentUserId = admin.id;
      localStorage.setItem(AUTH_USER_KEY, admin.id);
      localStorage.setItem(AUTH_STATUS_KEY, 'true');
      return { success: true, user: admin };
    }

    // Fallback check against Supabase in case admin updated PIN directly in Supabase
    const verifiedInSupabase = await verifyOrSyncAdminPin(cleanPin);
    if (verifiedInSupabase) {
      const refreshedUsers = db.getUsers();
      const refreshedAdmin = refreshedUsers.find((u) => u.role === 'ADMIN') || admin;
      this.currentUserId = refreshedAdmin.id;
      localStorage.setItem(AUTH_USER_KEY, refreshedAdmin.id);
      localStorage.setItem(AUTH_STATUS_KEY, 'true');
      return { success: true, user: refreshedAdmin };
    }

    return { success: false, error: 'Invalid Admin PIN. Please verify and try again.' };
  }

  public async memberLoginWithPin(userId: string, pin: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const users = db.getUsers();
    const member = users.find((u) => u.id === userId);
    if (!member) {
      return { success: false, error: 'Team member account not found.' };
    }

    const cleanPin = pin.trim();
    if (member.pin === cleanPin) {
      this.currentUserId = member.id;
      localStorage.setItem(AUTH_USER_KEY, member.id);
      localStorage.setItem(AUTH_STATUS_KEY, 'true');
      return { success: true, user: member };
    }

    // Fallback check against Supabase
    const verifiedInSupabase = await verifyOrSyncMemberPin(userId, cleanPin);
    if (verifiedInSupabase) {
      const refreshedUsers = db.getUsers();
      const refreshedMember = refreshedUsers.find((u) => u.id === userId) || member;
      this.currentUserId = refreshedMember.id;
      localStorage.setItem(AUTH_USER_KEY, refreshedMember.id);
      localStorage.setItem(AUTH_STATUS_KEY, 'true');
      return { success: true, user: refreshedMember };
    }

    return { success: false, error: 'Invalid PIN. Please check the PIN provided by your Admin.' };
  }

  public switchUser(userId: string): User | null {
    const user = db.getUserById(userId);
    if (user) {
      this.currentUserId = user.id;
      localStorage.setItem(AUTH_USER_KEY, user.id);
      localStorage.setItem(AUTH_STATUS_KEY, 'true');
      return user;
    }
    return null;
  }

  public setMemberPin(userId: string, newPin: string, adminUser: User): boolean {
    if (adminUser.role !== 'ADMIN') return false;
    const cleanPin = newPin.trim();
    const success = db.setUserPin(userId, cleanPin);
    if (success) {
      syncUserPinToSupabase(userId, cleanPin);
      const target = db.getUserById(userId);
      db.logActivity({
        userId: adminUser.id,
        userName: adminUser.name,
        userAvatar: adminUser.avatar,
        action: `updated access PIN for ${target?.name || 'team member'}`,
        objectType: 'USER',
        objectId: userId,
        objectTitle: target?.name || 'Team Member',
      });
    }
    return success;
  }

  public createTeamMember(data: {
    name: string;
    email: string;
    jobTitle: string;
    departmentId: string;
    pin: string;
  }, adminUser: User): { success: boolean; user?: User; error?: string } {
    if (adminUser.role !== 'ADMIN') {
      return { success: false, error: 'Only administrators can create team members.' };
    }

    const users = db.getUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newMember: User = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`,
      role: 'TEAM_MEMBER',
      departmentId: data.departmentId,
      jobTitle: data.jobTitle,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      pin: data.pin.trim() || '1234',
    };

    db.addUser(newMember);
    // Sync new member to Supabase immediately
    syncUserToSupabase(newMember);

    db.logActivity({
      userId: adminUser.id,
      userName: adminUser.name,
      userAvatar: adminUser.avatar,
      action: `added new team member ${newMember.name} and set access PIN`,
      objectType: 'USER',
      objectId: newMember.id,
      objectTitle: newMember.name,
    });

    return { success: true, user: newMember };
  }

  public logout(): void {
    localStorage.setItem(AUTH_STATUS_KEY, 'false');
  }

  // RBAC Permission Checkers
  public static canCreateTask(role: Role): boolean {
    return role === 'ADMIN';
  }

  public static canReviewTask(role: Role): boolean {
    return role === 'ADMIN';
  }

  public static canManageProjects(role: Role): boolean {
    return role === 'ADMIN';
  }

  public static canManageUsers(role: Role): boolean {
    return role === 'ADMIN';
  }

  public static canUpdateProgress(role: Role, taskAssigneeId: string, currentUserId: string): boolean {
    if (role === 'ADMIN') return true;
    return taskAssigneeId === currentUserId;
  }
}

export const auth = new AuthService();
