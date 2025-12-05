
import React, { useState } from 'react';
import { Tarefa, StatusTarefa } from '../../types';
import { usePmoStore } from '../../services/pmoService';
import TarefaForm from './TarefaForm';
import TarefaDetail from './TarefaDetail';
import { PermissionGate } from '../common/PermissionGate';
import { Permission } from '../../services/permissionService';

interface KanbanBoardProps {
  store: ReturnType<typeof usePmoStore>;
}

const statusMap = {
  [StatusTarefa.Backlog]: 'Backlog',
  [StatusTarefa.AFazer]: 'A Fazer',
  [StatusTarefa.EmAndamento]: 'Em Andamento',
  [StatusTarefa.Concluida]: 'Concluída',
};

const statusColors = {
  [StatusTarefa.Backlog]: 'border-gray-500',
  [StatusTarefa.AFazer]: 'border-blue-500',
  [StatusTarefa.EmAndamento]: 'border-yellow-500',
  [StatusTarefa.Concluida]: 'border-green-500',
};

const statusOrder = [
    StatusTarefa.Backlog,
    StatusTarefa.AFazer,
    StatusTarefa.EmAndamento,
    StatusTarefa.Concluida
];

const KanbanColumn: React.FC<{
  title: string;
  status: StatusTarefa;
  tarefas: Tarefa[];
  store: ReturnType<typeof usePmoStore>;
  onCardClick: (tarefa: Tarefa) => void;
  // Drag and Drop props
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: StatusTarefa) => void;
  draggedTaskId: string | null;
}> = ({ title, status, tarefas, store, onCardClick, onDragStart, onDragOver, onDrop, draggedTaskId }) => {
  const { state, actions } = store;
  return (
    <div 
        className="bg-sga-dark-light rounded-lg p-4 flex-1 flex flex-col min-w-[280px]"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, status)}
    >
      <h3 className={`font-bold text-white mb-4 flex items-center border-b-2 pb-2 ${statusColors[status]}`}>
        {title} <span className="ml-2 bg-sga-dark text-sga-gray text-xs font-semibold px-2 py-0.5 rounded-full">{tarefas.length}</span>
      </h3>
      <div className="space-y-3 h-[calc(100vh-20rem)] overflow-y-auto pr-2 custom-scrollbar">
        {tarefas.map(tarefa => {
            const projeto = state.projetos.find(p => p.id === tarefa.projetoId);
            const responsavel = state.recursos.find(r => r.id === tarefa.responsavelId);
            const isDragging = draggedTaskId === tarefa.id;

            return (
              <div 
                key={tarefa.id} 
                onClick={() => onCardClick(tarefa)} 
                draggable
                onDragStart={(e) => onDragStart(e, tarefa.id)}
                className={`bg-sga-dark p-4 rounded-md shadow-md cursor-grab active:cursor-grabbing hover:bg-gray-700 hover:shadow-xl transform transition-all duration-200 ${
                    isDragging ? 'opacity-50 border-2 border-sga-blue rotate-2 scale-95' : 'hover:-translate-y-1'
                }`}
              >
                <div className="flex justify-between items-start">
                     <p className="font-semibold text-white text-sm">{tarefa.nome}</p>
                     <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tarefa.progresso === 100 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                         {tarefa.progresso || 0}%
                     </span>
                </div>
                <p className="text-xs text-sga-teal font-medium mt-1 mb-2">{projeto?.nome || 'Projeto não encontrado'}</p>
                
                {/* Manual Progress Update */}
                <div className="mb-2 group/progress">
                    <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${tarefa.progresso === 100 ? 'bg-green-500' : 'bg-sga-blue'}`} 
                            style={{ width: `${tarefa.progresso || 0}%` }}
                        ></div>
                        {/* Interactive Range Input Overlay */}
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="5"
                            value={tarefa.progresso || 0}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()} // Prevent drag start when using slider
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                actions.updateTarefa({ ...tarefa, progresso: val });
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                            title="Arraste para atualizar o progresso"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center mt-2 border-t border-gray-700 pt-2">
                    <span className="text-xs text-sga-gray flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center text-[8px] text-white">
                            {responsavel?.nome?.charAt(0) || '?'}
                        </span>
                        {responsavel?.nome || 'N/A'}
                    </span>
                    <span className={`text-xs ${new Date(tarefa.dataVencimento) < new Date() && tarefa.status !== StatusTarefa.Concluida ? 'text-red-400 font-bold' : 'text-sga-gray'}`}>
                        {new Date(tarefa.dataVencimento).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}
                    </span>
                </div>
              </div>
            )
        })}
      </div>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ store }) => {
  const { state, actions } = store;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTarefa, setSelectedTarefa] = useState<Tarefa | null>(null);
  
  // Estado para filtro de responsável
  const [filterResponsavel, setFilterResponsavel] = useState<string>('');

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleOpenDetail = (tarefa: Tarefa) => {
    setSelectedTarefa(tarefa);
    setIsDetailOpen(true);
  };

  const handleOpenForm = (tarefa?: Tarefa) => {
    setSelectedTarefa(tarefa || null);
    setIsFormOpen(true);
  };

  const tarefasPorStatus = (status: StatusTarefa) => {
    return state.tarefas.filter(t => {
        const statusMatch = t.status === status;
        const responsavelMatch = filterResponsavel === '' || t.responsavelId === filterResponsavel;
        return statusMatch && responsavelMatch;
    });
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
      setDraggedTaskId(taskId);
      // Optional: Add data to dataTransfer if needed for cross-window drag
      e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
      e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, newStatus: StatusTarefa) => {
      e.preventDefault();
      
      if (draggedTaskId) {
          const tarefa = state.tarefas.find(t => t.id === draggedTaskId);
          if (tarefa && tarefa.status !== newStatus) {
              actions.updateTarefa({
                  ...tarefa,
                  status: newStatus
              });
          }
      }
      setDraggedTaskId(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">Quadro de Tarefas (Kanban)</h1>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
            {/* Filtro de Responsável */}
            <div className="relative w-full md:w-64">
                <select
                    value={filterResponsavel}
                    onChange={(e) => setFilterResponsavel(e.target.value)}
                    className="w-full bg-sga-dark-light text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sga-blue appearance-none cursor-pointer text-sm"
                >
                    <option value="">Todos os Responsáveis</option>
                    {state.recursos.map(r => (
                        <option key={r.id} value={r.id}>{r.nome}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                     <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>

            <PermissionGate user={(window as any).currentUser} permission={Permission.MANAGE_TASKS}>
                <button
                onClick={() => handleOpenForm()}
                className="bg-sga-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition flex items-center space-x-2 whitespace-nowrap shadow-lg hover:shadow-sga-blue/50"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                <span className="hidden sm:inline">Nova Tarefa</span>
                <span className="sm:hidden">Nova</span>
                </button>
            </PermissionGate>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {statusOrder.map(status => (
          <KanbanColumn
            key={status}
            title={statusMap[status]}
            status={status}
            tarefas={tarefasPorStatus(status)}
            store={store}
            onCardClick={handleOpenDetail}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            draggedTaskId={draggedTaskId}
          />
        ))}
      </div>
      
      {isFormOpen && (
        <TarefaForm 
            store={store}
            tarefa={selectedTarefa}
            onClose={() => setIsFormOpen(false)}
        />
      )}

      {isDetailOpen && selectedTarefa && (
        <TarefaDetail
            tarefa={selectedTarefa}
            store={store}
            onEdit={handleOpenForm}
            onClose={() => setIsDetailOpen(false)}
        />
      )}
    </div>
  );
};

export default KanbanBoard;