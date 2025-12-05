
export enum StatusProjeto {
  Planejado = 'Planejado',
  EmAndamento = 'Em Andamento',
  Concluido = 'Concluído',
  Cancelado = 'Cancelado',
}

export enum StatusTarefa {
  Backlog = 'Backlog',
  AFazer = 'A Fazer',
  EmAndamento = 'Em Andamento',
  Concluida = 'Concluída',
}

export enum StatusRisco {
    Aberto = 'Aberto',
    EmAndamento = 'Em Andamento',
    Mitigado = 'Mitigado',
    Fechado = 'Fechado',
}

export enum ImpactoRisco {
    Baixo = 'Baixo',
    Medio = 'Médio',
    Alto = 'Alto',
}

export enum ProbabilidadeRisco {
    Baixa = 'Baixa',
    Media = 'Média',
    Alta = 'Alta',
}

// --- AUTH TYPES ---
export enum UserRole {
  Admin = 'Administrador',
  Diretor = 'Diretor de PMO',
  Gerente = 'Gerente de Projetos',
  Membro = 'Membro de Equipe',
  Viewer = 'Visualizador (Stakeholder)',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
}
// ------------------

export interface Recurso {
  id: string;
  nome: string;
  funcao: string;
}

export interface Tarefa {
  id: string;
  nome: string;
  descricao: string;
  responsavelId: string;
  projetoId: string;
  status: StatusTarefa;
  dependencias: string[]; // array of task IDs
  dataCriacao: Date;
  dataInicio: Date;
  dataVencimento: Date;
  dataConclusao?: Date;
  progresso: number; // 0 to 100
}

export interface Risco {
    id: string;
    descricao: string;
    projetoId: string;
    impacto: ImpactoRisco;
    probabilidade: ProbabilidadeRisco;
    status: StatusRisco;
    responsavelId: string;
    planoMitigacao: string;
}


export interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  gerenteId: string;
  status: StatusProjeto;
  tarefaIds: string[];
  recursoIds: string[];
  riscoIds: string[];
  orcamento: number;
  gastoAtual: number;
  beneficioPrevisto: number;
  dataInicio: Date;
  dataFimPrevista: Date;
}

export enum NotificationType {
    Warning = 'Warning',
    Info = 'Info',
    Error = 'Error',
}

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    timestamp: Date;
    relatedId?: string; // e.g., task id
}

export interface Comentario {
  id: string;
  texto: string;
  autorId: string; // Recurso ID
  timestamp: Date;
  entidadeId: string; // Projeto ID or Tarefa ID
}