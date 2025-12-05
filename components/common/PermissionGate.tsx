
import React from 'react';
import { Permission, hasPermission } from '../../services/permissionService';
import { User } from '../../types';

interface PermissionGateProps {
  user: User | null;
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional content to show if permission is denied
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ user, permission, children, fallback = null }) => {
  if (hasPermission(user, permission)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
};
