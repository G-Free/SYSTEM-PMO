import { useReducer, useCallback } from 'react';
import { Projeto, Recurso, Tarefa, StatusProjeto, StatusTarefa, Notification, NotificationType, Comentario, Risco, ImpactoRisco, ProbabilidadeRisco, StatusRisco } from '../types';

// MOCK DATA
const hoje = new Date();
const addDays = (date: Date, days: number): Date => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}

const initialRecursos: Recurso[] = [
  { id: 'rec1', nome: 'Ana Silva', funcao: 'Engenheira Civil' },
  { id: 'rec2', nome: 'Carlos Gomes', funcao: 'Arquiteto' },
  { id: 'rec3', nome: 'Beatriz Costa', funcao: 'Gerente de TI' },
  { id: 'rec4', nome: 'Diogo Martins', funcao: 'Eletricista' },
];

const initialTarefas: Tarefa[] = [
  // Projeto 1
  { id: 'tar1', nome: 'Levantamento Topográfico', descricao: 'Realizar levantamento da área da nova pista.', projetoId: 'proj1', responsavelId: 'rec1', status: StatusTarefa.Concluida, dependencias: [], dataCriacao: new Date('2023-01-10'), dataInicio: new Date('2024-06-01'), dataVencimento: new Date('2024-06-10'), dataConclusao: new Date('2023-01-20'), progresso: 100 },
  { id: 'tar2', nome: 'Desenho da Planta', descricao: 'Desenvolver a planta baixa do novo terminal.', projetoId: 'proj1', responsavelId: 'rec2', status: StatusTarefa.EmAndamento, dependencias: ['tar1'], dataCriacao: new Date('2023-01-21'), dataInicio: new Date('2024-06-11'), dataVencimento: new Date('2024-06-25'), progresso: 45 },
  { id: 'tar3', nome: 'Terraplanagem', descricao: 'Preparar o terreno para a construção.', projetoId: 'proj1', responsavelId: 'rec1', status: StatusTarefa.AFazer, dependencias: ['tar1'], dataCriacao: new Date('2023-02-01'), dataInicio: new Date('2024-06-26'), dataVencimento: new Date('2024-07-10'), progresso: 0 },
  // Projeto 2
  { id: 'tar4', nome: 'Instalação de Servidores', descricao: 'Configurar a infraestrutura de rede do novo sistema.', projetoId: 'proj2', responsavelId: 'rec3', status: StatusTarefa.EmAndamento, dependencias: [], dataCriacao: new Date('2023-03-05'), dataInicio: addDays(hoje, -10), dataVencimento: addDays(hoje, 5), progresso: 75 },
  { id: 'tar5', nome: 'Desenvolvimento do Software', descricao: 'Codificar o sistema de check-in.', projetoId: 'proj2', responsavelId: 'rec3', status: StatusTarefa.AFazer, dependencias: ['tar4'], dataCriacao: new Date('2023-03-20'), dataInicio: addDays(hoje, 6), dataVencimento: addDays(hoje, 30), progresso: 10 },
  { id: 'tar8', nome: 'Planejamento de Marketing', descricao: 'Definir estratégia de lançamento.', projetoId: 'proj2', responsavelId: 'rec3', status: StatusTarefa.Backlog, dependencias: [], dataCriacao: new Date('2023-03-21'), dataInicio: addDays(hoje, 31), dataVencimento: addDays(hoje, 40), progresso: 0 },

  // Projeto 3 (Concluído)
  { id: 'tar6', nome: 'Demolição', descricao: 'Demolir estruturas antigas.', projetoId: 'proj3', responsavelId: 'rec4', status: StatusTarefa.Concluida, dependencias: [], dataCriacao: new Date('2023-03-20'), dataInicio: new Date('2024-01-10'), dataVencimento: new Date('2024-01-20'), progresso: 100},
  { id: 'tar7', nome: 'Construção Estrutural', descricao: 'Nova estrutura do terminal.', projetoId: 'proj3', responsavelId: 'rec2', status: StatusTarefa.Concluida, dependencias: ['tar6'], dataCriacao: new Date('2023-03-20'), dataInicio: new Date('2024-01-21'), dataVencimento: new Date('2024-03-10'), progresso: 100},
];

const initialRiscos: Risco[] = [
    { id: 'risco1', descricao: 'Atraso na entrega de materiais pelo fornecedor', projetoId: 'proj1', impacto: ImpactoRisco.Alto, probabilidade: ProbabilidadeRisco.Media, status: StatusRisco.Aberto, responsavelId: 'rec1', planoMitigacao: 'Monitorar o fornecedor semanalmente e ter um fornecedor alternativo pré-aprovado.'},
    { id: 'risco2', descricao: 'Falha de segurança no novo sistema de software', projetoId: 'proj2', impacto: ImpactoRisco.Alto, probabilidade: ProbabilidadeRisco.Baixa, status: StatusRisco.EmAndamento, responsavelId: 'rec3', planoMitigacao: 'Realizar testes de penetração com empresa terceirizada.'},
    { id: 'risco3', descricao: 'Orçamento insuficiente para a fase final de acabamento', projetoId: 'proj3', impacto: ImpactoRisco.Medio, probabilidade: ProbabilidadeRisco.Media, status: StatusRisco.Mitigado, responsavelId: 'rec2', planoMitigacao: 'Revisar custos e renegociar com fornecedores. Apresentar pedido de orçamento suplementar.'}
];

const initialProjetos: Projeto[] = [
  { id: 'proj1', nome: 'Expansão da Pista 2', descricao: 'Construção de uma nova pista de pouso e decolagem para aumentar a capacidade do aeroporto.', gerenteId: 'rec1', status: StatusProjeto.EmAndamento, tarefaIds: ['tar1', 'tar2', 'tar3'], recursoIds: ['rec1', 'rec2'], riscoIds: ['risco1'], orcamento: 500000000, gastoAtual: 125000000, beneficioPrevisto: 750000000, dataInicio: new Date('2024-06-01'), dataFimPrevista: new Date('2024-09-30') },
  { id: 'proj2', nome: 'Sistema de Check-in Automatizado', descricao: 'Implementação de um novo sistema de TI para agilizar o processo de check-in.', gerenteId: 'rec3', status: StatusProjeto.Planejado, tarefaIds: ['tar4', 'tar5', 'tar8'], recursoIds: ['rec3'], riscoIds: ['risco2'], orcamento: 75000000, gastoAtual: 5000000, beneficioPrevisto: 120000000, dataInicio: addDays(hoje, -10), dataFimPrevista: addDays(hoje, 45) },
  { id: 'proj3', nome: 'Renovação do Terminal A', descricao: 'Modernização das instalações do terminal de passageiros A.', gerenteId: 'rec2', status: StatusProjeto.Concluido, tarefaIds: ['tar6', 'tar7'], recursoIds: ['rec2', 'rec4'], riscoIds: ['risco3'], orcamento: 120000000, gastoAtual: 115000000, beneficioPrevisto: 150000000, dataInicio: new Date('2024-01-10'), dataFimPrevista: new Date('2024-04-15') },
  { id: 'proj4', nome: 'Implementação de Energia Solar', descricao: 'Instalação de painéis solares para suprir 30% da energia do aeroporto.', gerenteId: 'rec1', status: StatusProjeto.Cancelado, tarefaIds: [], recursoIds: ['rec1', 'rec4'], riscoIds: [], orcamento: 250000000, gastoAtual: 10000000, beneficioPrevisto: 400000000, dataInicio: new Date('2024-02-01'), dataFimPrevista: new Date('2024-10-01') },
];

const initialComentarios: Comentario[] = [
    { id: 'com1', texto: 'A terraplanagem precisa de aprovação ambiental. Já foi solicitada?', autorId: 'rec1', timestamp: new Date('2023-02-02'), entidadeId: 'proj1' },
    { id: 'com2', texto: 'Sim, Ana. A licença deve sair na próxima semana.', autorId: 'rec2', timestamp: new Date('2023-02-03'), entidadeId: 'proj1' },
    { id: 'com3', texto: 'Atraso na entrega dos novos servidores. A previsão de chegada é para o final da semana.', autorId: 'rec3', timestamp: new Date(), entidadeId: 'tar4'},
];


type PmoState = {
  projetos: Projeto[];
  tarefas: Tarefa[];
  recursos: Recurso[];
  riscos: Risco[];
  notifications: Notification[];
  comentarios: Comentario[];
  recentProjectIds: string[];
  selectedProjectId: string | null;
};

type PmoAction =
  | { type: 'ADD_PROJETO'; payload: Projeto }
  | { type: 'UPDATE_PROJETO'; payload: Projeto }
  | { type: 'ADD_TAREFA'; payload: Tarefa }
  | { type: 'UPDATE_TAREFA'; payload: Tarefa }
  | { type: 'ADD_RECURSO'; payload: Recurso }
  | { type: 'UPDATE_RECURSO'; payload: Recurso }
  | { type: 'ADD_RISCO'; payload: Risco }
  | { type: 'UPDATE_RISCO'; payload: Risco }
  | { type: 'ASSIGN_RECURSO_PROJETO'; payload: { projetoId: string; recursoId: string } }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: { id: string } }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'ADD_COMENTARIO'; payload: Comentario }
  | { type: 'ADD_RECENT_PROJECT'; payload: string }
  | { type: 'SET_SELECTED_PROJECT'; payload: string | null };

const initialState: PmoState = {
  projetos: initialProjetos,
  tarefas: initialTarefas,
  recursos: initialRecursos,
  riscos: initialRiscos,
  notifications: [],
  comentarios: initialComentarios,
  recentProjectIds: [],
  selectedProjectId: null,
};

function pmoReducer(state: PmoState, action: PmoAction): PmoState {
  switch (action.type) {
    case 'ADD_PROJETO':
      return { ...state, projetos: [...state.projetos, action.payload] };
    case 'UPDATE_PROJETO':
      return {
        ...state,
        projetos: state.projetos.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case 'ADD_TAREFA': {
      const newState = { ...state, tarefas: [...state.tarefas, action.payload] };
      const projeto = newState.projetos.find(p => p.id === action.payload.projetoId);
      if (projeto && !projeto.tarefaIds.includes(action.payload.id)) {
          projeto.tarefaIds.push(action.payload.id);
      }
      return newState;
    }
    case 'UPDATE_TAREFA':
      return {
        ...state,
        tarefas: state.tarefas.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'ADD_RECURSO':
        return { ...state, recursos: [...state.recursos, action.payload] };
    case 'UPDATE_RECURSO':
        return {
            ...state,
            recursos: state.recursos.map(r => r.id === action.payload.id ? action.payload : r),
        };
     case 'ADD_RISCO': {
        const newState = { ...state, riscos: [...state.riscos, action.payload] };
        const projeto = newState.projetos.find(p => p.id === action.payload.projetoId);
        if (projeto && !projeto.riscoIds.includes(action.payload.id)) {
            projeto.riscoIds.push(action.payload.id);
        }
        return newState;
    }
    case 'UPDATE_RISCO':
        return {
            ...state,
            riscos: state.riscos.map(r => r.id === action.payload.id ? action.payload : r),
        };
    case 'ASSIGN_RECURSO_PROJETO': {
        const projeto = state.projetos.find(p => p.id === action.payload.projetoId);
        if (projeto && !projeto.recursoIds.includes(action.payload.recursoId)) {
            const updatedProjeto = { ...projeto, recursoIds: [...projeto.recursoIds, action.payload.recursoId] };
            return {
                ...state,
                projetos: state.projetos.map(p => p.id === updatedProjeto.id ? updatedProjeto : p),
            };
        }
        return state;
    }
    case 'ADD_NOTIFICATION': {
        if (action.payload.relatedId && state.notifications.some(n => n.relatedId === action.payload.relatedId)) {
            return state;
        }
        const newNotification: Notification = {
            ...action.payload,
            id: `notif${Date.now()}`,
            timestamp: new Date(),
        };
        return { ...state, notifications: [newNotification, ...state.notifications] };
    }
    case 'REMOVE_NOTIFICATION':
        return {
            ...state,
            notifications: state.notifications.filter(n => n.id !== action.payload.id),
        };
    case 'CLEAR_NOTIFICATIONS':
        return { ...state, notifications: [] };
    case 'ADD_COMENTARIO':
        return { ...state, comentarios: [action.payload, ...state.comentarios] };
    case 'ADD_RECENT_PROJECT':
        const currentRecents = state.recentProjectIds.filter(id => id !== action.payload);
        return { ...state, recentProjectIds: [action.payload, ...currentRecents].slice(0, 3) };
    case 'SET_SELECTED_PROJECT':
        return { ...state, selectedProjectId: action.payload };
    default:
      return state;
  }
}

export const usePmoStore = () => {
  const [state, dispatch] = useReducer(pmoReducer, initialState);

  const actions = {
    addProjeto: useCallback((projetoData: Omit<Projeto, 'id' | 'tarefaIds' | 'recursoIds' | 'riscoIds'>) => {
        const newProjeto: Projeto = { ...projetoData, id: `proj${Date.now()}`, tarefaIds: [], recursoIds: [], riscoIds: [] };
        dispatch({ type: 'ADD_PROJETO', payload: newProjeto });
    }, []),
    updateProjeto: useCallback((projeto: Projeto) => {
        dispatch({ type: 'UPDATE_PROJETO', payload: projeto });
    }, []),
    addTarefa: useCallback((tarefaData: Omit<Tarefa, 'id' | 'dataCriacao'>) => {
        const newTarefa: Tarefa = { ...tarefaData, id: `tar${Date.now()}`, dataCriacao: new Date(), progresso: tarefaData.progresso || 0 };
        dispatch({ type: 'ADD_TAREFA', payload: newTarefa });
    }, []),
    updateTarefa: useCallback((tarefa: Tarefa) => {
        dispatch({ type: 'UPDATE_TAREFA', payload: tarefa });
    }, []),
    addRecurso: useCallback((recursoData: Omit<Recurso, 'id'>) => {
        const newRecurso: Recurso = { ...recursoData, id: `rec${Date.now()}`};
        dispatch({ type: 'ADD_RECURSO', payload: newRecurso });
    }, []),
    updateRecurso: useCallback((recurso: Recurso) => {
        dispatch({ type: 'UPDATE_RECURSO', payload: recurso });
    }, []),
    addRisco: useCallback((riscoData: Omit<Risco, 'id'>) => {
        const newRisco: Risco = { ...riscoData, id: `risco${Date.now()}`};
        dispatch({ type: 'ADD_RISCO', payload: newRisco });
    }, []),
    updateRisco: useCallback((risco: Risco) => {
        dispatch({ type: 'UPDATE_RISCO', payload: risco });
    }, []),
    assignRecursoToProjeto: useCallback((projetoId: string, recursoId: string) => {
        dispatch({ type: 'ASSIGN_RECURSO_PROJETO', payload: { projetoId, recursoId } });
    }, []),
    removeNotification: useCallback((id: string) => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id } });
    }, []),
    clearNotifications: useCallback(() => {
        dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    }, []),
    checkNotifications: useCallback(() => {
        state.tarefas.forEach(tarefa => {
            if (tarefa.dataVencimento && new Date(tarefa.dataVencimento) < new Date() && tarefa.status !== StatusTarefa.Concluida) {
                dispatch({
                    type: 'ADD_NOTIFICATION',
                    payload: {
                        message: `A tarefa "${tarefa.nome}" está atrasada!`,
                        type: NotificationType.Warning,
                        relatedId: tarefa.id,
                    }
                });
            }
        });
    }, [state.tarefas]),
    addComentario: useCallback((comentarioData: Omit<Comentario, 'id' | 'timestamp'>) => {
        const newComentario: Comentario = {
            ...comentarioData,
            id: `com${Date.now()}`,
            timestamp: new Date(),
        };
        dispatch({ type: 'ADD_COMENTARIO', payload: newComentario });
    }, []),
    addRecentProject: useCallback((projectId: string) => {
        dispatch({ type: 'ADD_RECENT_PROJECT', payload: projectId });
    }, []),
    setSelectedProject: useCallback((projectId: string | null) => {
        dispatch({ type: 'SET_SELECTED_PROJECT', payload: projectId });
    }, []),
  };

  return { state, actions };
};