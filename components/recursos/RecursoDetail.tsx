
import React from 'react';
import { Recurso } from '../../types';
import { usePmoStore } from '../../services/pmoService';

interface RecursoDetailProps {
  recurso: Recurso;
  store: ReturnType<typeof usePmoStore>;
  onClose: () => void;
}

// NOTE: This component is provided to match the requested file structure.
// In this application's design, resource details are viewed and edited
// directly within the RecursoList and RecursoForm for a more streamlined user experience.
// This component could be expanded to show more detailed information if needed.

const RecursoDetail: React.FC<RecursoDetailProps> = ({ recurso, store, onClose }) => {
  const { state } = store;
  const projetosAtribuidos = state.projetos.filter(p => p.recursoIds.includes(recurso.id) || p.gerenteId === recurso.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-sga-dark-light p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-white">{recurso.nome}</h2>
            <button onClick={onClose} className="text-sga-gray hover:text-white text-2xl">&times;</button>
        </div>
        <p className="text-sga-blue font-semibold">{recurso.funcao}</p>
        
        <div className="mt-6 border-t border-gray-700 pt-6">
            <h3 className="text-xl font-semibold text-white mb-4">Projetos Atribuídos</h3>
            {projetosAtribuidos.length > 0 ? (
                <ul>
                    {projetosAtribuidos.map(p => (
                        <li key={p.id} className="text-white bg-sga-dark p-2 rounded mb-2">{p.nome}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-sga-gray">Nenhum projeto atribuído.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default RecursoDetail;
