import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { auth, AuthService } from '../services/auth';
import { db } from '../services/db';

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  isAuthenticated: boolean;
  switchUser: (userId: string) => void;
  adminLoginWithPin: (pin: string) => { success: boolean; error?: string };
  memberLoginWithPin: (userId: string, pin: string) => { success: boolean; error?: string };
  setMemberPin: (userId: string, newPin: string) => boolean;
  createTeamMember: (data: {
    name: string;
    email: string;
    jobTitle: string;
    departmentId: string;
    pin: string;
  }) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  refreshUsers: () => void;
  canCreateTask: boolean;
  canReviewTask: boolean;
  canManageProjects: boolean;
  canManageUsers: boolean;
  canUpdateProgress: (assigneeId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => auth.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => db.getUsers());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => auth.isAuthenticated());

  const refreshUsers = () => {
    const fresh = db.getUsers();
    setAllUsers(fresh);
    const me = fresh.find((u) => u.id === currentUser.id);
    if (me) setCurrentUser(me);
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const switchUser = (userId: string) => {
    const user = auth.switchUser(userId);
    if (user) {
      setCurrentUser({ ...user });
      setIsAuthenticated(true);
    }
  };

  const adminLoginWithPin = (pin: string) => {
    const res = auth.adminLoginWithPin(pin);
    if (res.success && res.user) {
      setCurrentUser({ ...res.user });
      setIsAuthenticated(true);
      refreshUsers();
      return { success: true };
    }
    return { success: false, error: res.error || 'Incorrect Admin PIN' };
  };

  const memberLoginWithPin = (userId: string, pin: string) => {
    const res = auth.memberLoginWithPin(userId, pin);
    if (res.success && res.user) {
      setCurrentUser({ ...res.user });
      setIsAuthenticated(true);
      refreshUsers();
      return { success: true };
    }
    return { success: false, error: res.error || 'Incorrect PIN' };
  };

  const setMemberPin = (userId: string, newPin: string) => {
    const success = auth.setMemberPin(userId, newPin, currentUser);
    if (success) {
      refreshUsers();
    }
    return success;
  };

  const createTeamMember = (data: {
    name: string;
    email: string;
    jobTitle: string;
    departmentId: string;
    pin: string;
  }) => {
    const res = auth.createTeamMember(data, currentUser);
    if (res.success) {
      refreshUsers();
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const logout = () => {
    auth.logout();
    setIsAuthenticated(false);
  };

  const updateProfile = (data: Partial<User>) => {
    const updated = { ...currentUser, ...data };
    db.updateUser(updated);
    setCurrentUser(updated);
    refreshUsers();
  };

  const canCreateTask = AuthService.canCreateTask(currentUser.role);
  const canReviewTask = AuthService.canReviewTask(currentUser.role);
  const canManageProjects = AuthService.canManageProjects(currentUser.role);
  const canManageUsers = AuthService.canManageUsers(currentUser.role);

  const canUpdateProgress = (assigneeId: string) => {
    return AuthService.canUpdateProgress(currentUser.role, assigneeId, currentUser.id);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        isAuthenticated,
        switchUser,
        adminLoginWithPin,
        memberLoginWithPin,
        setMemberPin,
        createTeamMember,
        logout,
        updateProfile,
        refreshUsers,
        canCreateTask,
        canReviewTask,
        canManageProjects,
        canManageUsers,
        canUpdateProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
