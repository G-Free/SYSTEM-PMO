
import React, { useState } from 'react';
import { Recurso } from '../../types';
import { usePmoStore } from '../../services/pmoService';
import RecursoForm from './RecursoForm';

interface RecursoListProps {
  store: ReturnType<typeof usePmoStore>;
}

const RecursoList: React.FC<RecursoListProps> = ({ store }) => {
  const { state } = store;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecurso, setSelectedRecurso] = useState<Recurso | null>(null);

  const handleOpenForm = (recurso?: Recurso) => {
    setSelectedRecurso(recurso || null);
    setIsFormOpen(true);
  };
  
  const getProjetosForRecurso = (recursoId: string) => {
      return state.projetos.filter(p => p.recursoIds.includes(recursoId) || p.gerenteId === recursoId).map(p => p.nome).join(', ');
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Recursos Humanos</h1>
        <button
          onClick={() => handleOpenForm()}
          className="bg-sga-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" /></svg>
          <span>Novo Recurso</span>
        </button>
      </div>

      <div className="bg-sga-dark-light rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-sga-dark">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-sga-gray uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-sga-gray uppercase tracking-wider">Função</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-sga-gray uppercase tracking-wider">Projetos Atribuídos</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-sga-gray uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {state.recursos.map(recurso => (
              <tr key={recurso.id} className="odd:bg-sga-dark even:bg-sga-dark-light hover:bg-gray-700/50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-white">{recurso.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sga-gray">{recurso.funcao}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sga-gray text-sm">{getProjetosForRecurso(recurso.id) || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenForm(recurso)} className="text-sga-teal hover:text-teal-400 font-semibold">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <RecursoForm 
          store={store} 
          recurso={selectedRecurso} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
};

export default RecursoList;