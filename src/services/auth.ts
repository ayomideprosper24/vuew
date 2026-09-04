import { User, Role } from '../types';
import { db } from './db';

const AUTH_USER_KEY = 'vuew_current_user_id';
const AUTH_STATUS_KEY = 'vuew_is_authenticated';

export class AuthService {
  private currentUserId: string | null = null;

  constructor() {
    this.currentUserId = localStorage.getItem(AUTH_USER_KEY) || 'usr-5'; // Default to Alex Mercer (Admin)
    if (!localStorage.getItem(AUTH_STATUS_KEY)) {
      localStorage.setItem(AUTH_STATUS_KEY, 'true'); // Keep initially authenticated for seamless experience
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

  public adminLoginWithPin(pin: string): { success: boolean; user?: User; error?: string } {
    const users = db.getUsers();
    const admin = users.find((u) => u.role === 'ADMIN');
    if (!admin) {
      return { success: false, error: 'No administrator account configured in workspace.' };
    }

    if (admin.pin !== pin.trim()) {
      return { success: false, error: 'Invalid Admin PIN. Please verify and try again.' };
    }

    this.currentUserId = admin.id;
    localStorage.setItem(AUTH_USER_KEY, admin.id);
    localStorage.setItem(AUTH_STATUS_KEY, 'true');
    return { success: true, user: admin };
  }

  public memberLoginWithPin(userId: string, pin: string): { success: boolean; user?: User; error?: string } {
    const users = db.getUsers();
    const member = users.find((u) => u.id === userId);
    if (!member) {
      return { success: false, error: 'Team member account not found.' };
    }

    if (member.pin !== pin.trim()) {
      return { success: false, error: 'Invalid PIN. Please check the PIN provided by your Admin.' };
    }

    this.currentUserId = member.id;
    localStorage.setItem(AUTH_USER_KEY, member.id);
    localStorage.setItem(AUTH_STATUS_KEY, 'true');
    return { success: true, user: member };
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
    const success = db.setUserPin(userId, newPin.trim());
    if (success) {
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
