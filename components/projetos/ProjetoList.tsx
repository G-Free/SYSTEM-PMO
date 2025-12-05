import React, { useState } from 'react';
import { Projeto, StatusProjeto } from '../../types';
import { usePmoStore } from '../../services/pmoService';
import ProjetoForm from './ProjetoForm';
import ProjetoDetail from './ProjetoDetail';
import { formatCurrency } from '../../utils/formatting';
import { PermissionGate } from '../common/PermissionGate';
import { Permission } from '../../services/permissionService';

interface ProjetoListProps {
  store: ReturnType<typeof usePmoStore>;
  filterStatus: StatusProjeto | 'Todos';
  setFilterStatus: (status: StatusProjeto | 'Todos') => void;
}

const ProjetoList: React.FC<ProjetoListProps> = ({ store, filterStatus, setFilterStatus }) => {
  const { state, actions } = store;
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Projeto | null>(null);

  // Use global state to determine if detail modal is open
  const selectedProjeto = state.selectedProjectId 
    ? state.projetos.find(p => p.id === state.selectedProjectId) || null 
    : null;
  const isDetailOpen = !!selectedProjeto;


  const handleOpenDetail = (projeto: Projeto) => {
    // Add to recent and select globally
    actions.addRecentProject(projeto.id);
    actions.setSelectedProject(projeto.id);
  };

  const handleCloseDetail = () => {
      actions.setSelectedProject(null);
  }
  
  const handleOpenForm = (projeto?: Projeto) => {
    setProjectToEdit(projeto || null);
    setIsFormOpen(true);
  }

  const filteredProjetos = state.projetos.filter(projeto => {
    if (filterStatus === 'Todos') return true;
    return projeto.status === filterStatus;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">Projetos</h1>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
            {/* Filtro Dropdown */}
            <div className="relative w-full md:w-64">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as StatusProjeto | 'Todos')}
                    className="w-full bg-sga-dark-light text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sga-blue appearance-none cursor-pointer"
                >
                    <option value="Todos">Todos os Status</option>
                    {Object.values(StatusProjeto).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>

            <PermissionGate user={(window as any).currentUser} permission={Permission.MANAGE_PROJECTS}>
                <button
                onClick={() => handleOpenForm()}
                className="bg-sga-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-lg hover:shadow-sga-blue/50 flex items-center space-x-2 whitespace-nowrap"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                <span className="hidden sm:inline">Novo Projeto</span>
                <span className="sm:hidden">Novo</span>
                </button>
            </PermissionGate>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjetos.length > 0 ? (
            filteredProjetos.map(projeto => {
                const orcamento = Number(projeto.orcamento) || 0;
                const beneficio = Number(projeto.beneficioPrevisto) || 0;
                const roi = orcamento > 0 ? ((beneficio - orcamento) / orcamento) * 100 : 0;

                return (
                <div key={projeto.id} className="bg-sga-dark-light p-6 rounded-lg shadow-lg flex flex-col justify-between transform hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                    <div>
                    <h2 className="text-xl font-bold text-white mb-2">{projeto.nome}</h2>
                    <span className={`text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full ${
                        projeto.status === 'Em Andamento' ? 'bg-yellow-900 text-yellow-300' : 
                        projeto.status === 'Concluído' ? 'bg-green-900 text-green-300' : 
                        projeto.status === 'Cancelado' ? 'bg-red-900 text-red-300' :
                        'bg-blue-900 text-blue-300'
                    }`}>{projeto.status}</span>
                    
                    <div className="mt-4 bg-sga-dark p-3 rounded border border-gray-700">
                        <div className="flex justify-between items-center text-sm mb-1">
                             <span className="text-sga-gray">Orçamento:</span>
                             <span className="text-white font-medium">{formatCurrency(orcamento)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                             <span className="text-sga-gray">ROI Estimado:</span>
                             <span className={`font-bold ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {roi.toFixed(1)}%
                             </span>
                        </div>
                    </div>

                    <p className="text-sga-gray mt-4 text-sm h-16 overflow-hidden line-clamp-3">{projeto.descricao}</p>
                    </div>
                    <div className="mt-6 flex space-x-2">
                    <button onClick={() => handleOpenDetail(projeto)} className="bg-sga-teal text-white px-3 py-1 rounded hover:bg-opacity-80 transition text-sm flex items-center space-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                        <span>Detalhes</span>
                    </button>
                    
                    <PermissionGate user={(window as any).currentUser} permission={Permission.MANAGE_PROJECTS}>
                        <button onClick={() => handleOpenForm(projeto)} className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-opacity-80 transition text-sm flex items-center space-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                            <span>Editar</span>
                        </button>
                    </PermissionGate>
                    </div>
                </div>
                );
            })
        ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10">
                <p className="text-sga-gray text-lg">Nenhum projeto encontrado com o status "{filterStatus}".</p>
            </div>
        )}
      </div>

      {isFormOpen && (
        <ProjetoForm 
          store={store} 
          projeto={projectToEdit} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}

      {isDetailOpen && selectedProjeto && (
        <ProjetoDetail 
          projeto={selectedProjeto} 
          store={store}
          onClose={handleCloseDetail} 
        />
      )}
    </div>
  );
};

export default ProjetoList;