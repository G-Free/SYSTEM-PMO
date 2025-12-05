
import { User, UserRole } from '../types';

export enum Permission {
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_PROJECTS = 'view_projects',
  MANAGE_PROJECTS = 'manage_projects', // Create, Edit, Delete Projects
  VIEW_TASKS = 'view_tasks',
  MANAGE_TASKS = 'manage_tasks',
  VIEW_RESOURCES = 'view_resources',
  MANAGE_RESOURCES = 'manage_resources',
  VIEW_RISKS = 'view_risks',
  MANAGE_RISKS = 'manage_risks',
  VIEW_REPORTS = 'view_reports',
  VIEW_PORTFOLIO = 'view_portfolio',
  VIEW_ROADMAP = 'view_roadmap',
  VIEW_GANTT = 'view_gantt',
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.Admin]: Object.values(Permission), // Admin has all permissions
  [UserRole.Diretor]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PROJECTS,
    Permission.MANAGE_PROJECTS, // Can approve/edit
    Permission.VIEW_TASKS,
    Permission.VIEW_RESOURCES,
    Permission.VIEW_RISKS,
    Permission.MANAGE_RISKS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_PORTFOLIO,
    Permission.VIEW_ROADMAP,
    Permission.VIEW_GANTT,
  ],
  [UserRole.Gerente]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PROJECTS,
    Permission.MANAGE_PROJECTS,
    Permission.VIEW_TASKS,
    Permission.MANAGE_TASKS,
    Permission.VIEW_RESOURCES,
    Permission.MANAGE_RESOURCES, // Can assign resources
    Permission.VIEW_RISKS,
    Permission.MANAGE_RISKS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_PORTFOLIO,
    Permission.VIEW_ROADMAP,
    Permission.VIEW_GANTT,
  ],
  [UserRole.Membro]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PROJECTS,
    Permission.VIEW_TASKS,
    Permission.MANAGE_TASKS, // Can update own tasks
    Permission.VIEW_RESOURCES,
    Permission.VIEW_RISKS,
    Permission.MANAGE_RISKS, // Can report risks
    Permission.VIEW_GANTT,
  ],
  [UserRole.Viewer]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PROJECTS,
    Permission.VIEW_TASKS,
    Permission.VIEW_RESOURCES,
    Permission.VIEW_RISKS,
    Permission.VIEW_PORTFOLIO,
    Permission.VIEW_ROADMAP,
    Permission.VIEW_GANTT,
    // No edit/manage permissions
  ],
};

export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user) return false;
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
};
