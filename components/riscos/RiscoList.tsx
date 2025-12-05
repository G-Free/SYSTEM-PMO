import React, { useState } from 'react';
import { Risco, ImpactoRisco, ProbabilidadeRisco } from '../../types';
import { usePmoStore } from '../../services/pmoService';
import RiscoForm from './RiscoForm';

interface RiscoListProps {
  store: ReturnType<typeof usePmoStore>;
}

const getImpactoColor = (impacto: ImpactoRisco) => {
    switch (impacto) {
        case ImpactoRisco.Alto: return 'bg-red-900 text-red-200 border border-red-700';
        case ImpactoRisco.Medio: return 'bg-yellow-900 text-yellow-200 border border-yellow-700';
        case ImpactoRisco.Baixo: return 'bg-green-900 text-green-200 border border-green-700';
        default: return 'bg-gray-700 text-gray-300';
    }
}

const getProbabilidadeColor = (prob: ProbabilidadeRisco) => {
     switch (prob) {
        case ProbabilidadeRisco.Alta: return 'bg-red-900 text-red-200 border border-red-700';
        case ProbabilidadeRisco.Media: return 'bg-yellow-900 text-yellow-200 border border-yellow-700';
        case ProbabilidadeRisco.Baixa: return 'bg-green-900 text-green-200 border border-green-700';
        default: return 'bg-gray-700 text-gray-300';
    }
}


const RiscoList: React.FC<RiscoListProps> = ({ store }) => {
  const { state } = store;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRisco, setSelectedRisco] = useState<Risco | null>(null);

  const handleOpenForm = (risco?: Risco) => {
    setSelectedRisco(risco || null);
    setIsFormOpen(true);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Gestão de Riscos</h1>
        <button
          onClick={() => handleOpenForm()}
          className="bg-sga-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1.75-5.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" clipRule="evenodd" /></svg>
          <span>Novo Risco</span>
        </button>
      </div>

      <div className="bg-sga-dark-light rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-sga-dark">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-sga-gray uppercase tracking-wider">Descrição do Risco</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-sga-gray uppercase tracking-wider">Projeto</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-sga-gray uppercase tracking-wider">Impacto</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-sga-gray uppercase tracking-wider">Probabilidade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-sga-gray uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-sga-gray uppercase tracking-wider">Responsável</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-sga-gray uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {state.riscos.map(risco => {
                const projeto = state.projetos.find(p => p.id === risco.projetoId);
                const responsavel = state.recursos.find(r => r.id === risco.responsavelId);
                return (
                    <tr key={risco.id} className="odd:bg-sga-dark even:bg-sga-dark-light hover:bg-gray-700/50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-normal text-white max-w-sm">{risco.descricao}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sga-gray">{projeto?.nome || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getImpactoColor(risco.impacto)}`}>
                                {risco.impacto}
                            </span>
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getProbabilidadeColor(risco.probabilidade)}`}>
                                {risco.probabilidade}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sga-gray">{risco.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sga-gray">{responsavel?.nome || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleOpenForm(risco)} className="text-sga-teal hover:text-teal-400 font-semibold">Editar</button>
                        </td>
                    </tr>
                );
            })}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <RiscoForm 
          store={store} 
          risco={selectedRisco} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
};

export default RiscoList;