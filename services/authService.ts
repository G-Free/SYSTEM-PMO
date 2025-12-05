
import { User, UserRole } from '../types';

// Mock Users for 5 Levels
const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Carlos Admin',
    email: 'admin@sga.ao',
    role: UserRole.Admin,
    avatarInitials: 'CA',
  },
  {
    id: 'u2',
    name: 'Sofia Diretora',
    email: 'diretor@sga.ao',
    role: UserRole.Diretor,
    avatarInitials: 'SD',
  },
  {
    id: 'u3',
    name: 'João Gerente',
    email: 'gerente@sga.ao',
    role: UserRole.Gerente,
    avatarInitials: 'JG',
  },
  {
    id: 'u4',
    name: 'Ana Membro',
    email: 'membro@sga.ao',
    role: UserRole.Membro,
    avatarInitials: 'AM',
  },
  {
    id: 'u5',
    name: 'Pedro Viewer',
    email: 'viewer@sga.ao',
    role: UserRole.Viewer,
    avatarInitials: 'PV',
  },
];

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulating API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (password !== 'sga2024') {
      throw new Error('Senha incorreta.');
    }

    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('Utilizador não encontrado. Tente admin@sga.ao');
    }

    return user;
  },

  getAvailableUsers: () => MOCK_USERS, // Helper to show hints on login screen
};
