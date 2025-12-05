import React, { useState } from 'react';
import { Tarefa } from '../../types';
import { usePmoStore } from '../../services/pmoService';

interface TarefaDetailProps {
  tarefa: Tarefa;
  store: ReturnType<typeof usePmoStore>;
  onClose: () => void;
  onEdit: (tarefa: Tarefa) => void;
}

const TarefaDetail: React.FC<TarefaDetailProps> = ({ tarefa, store, onClose, onEdit }) => {
  const { state, actions } = store;
  const projeto = state.projetos.find(p => p.id === tarefa.projetoId);
  const responsavel = state.recursos.find(r => r.id === tarefa.responsavelId);
  const dependencias = state.tarefas.filter(t => tarefa.dependencias.includes(t.id));
  const comentariosTarefa = state.comentarios.filter(c => c.entidadeId === tarefa.id);
  const comentariosProjeto = state.comentarios.filter(c => c.entidadeId === projeto?.id);


  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState(state.recursos[0]?.id || '');

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && commentAuthor) {
      actions.addComentario({
        texto: newComment,
        autorId: commentAuthor,
        entidadeId: tarefa.id,
      });
      setNewComment('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-sga-dark-light p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{tarefa.nome}</h2>
              <p className="text-sga-gray text-sm">Projeto: {projeto?.nome || 'N/A'}</p>
              <p className="text-sga-gray text-sm">Responsável: {responsavel?.nome || 'N/A'}</p>
            </div>
            <button onClick={onClose} className="text-sga-gray hover:text-white text-2xl">&times;</button>
        </div>
        
        <p className="mt-4 text-white">{tarefa.descricao}</p>

        <div className="mt-4">
          <h4 className="font-semibold text-white">Dependências:</h4>
          {dependencias.length > 0 ? (
            <ul className="list-disc list-inside text-sga-gray">
              {dependencias.map(d => <li key={d.id}>{d.nome}</li>)}
            </ul>
          ) : <p className="text-sga-gray text-sm">Nenhuma dependência.</p>}
        </div>

        {projeto && (
            <div className="mt-6 border-t border-gray-700 pt-6">
                <h3 className="text-xl font-semibold text-white mb-4">Contexto do Projeto</h3>
                <div className="bg-sga-dark p-4 rounded-lg">
                    <p className="font-semibold text-sga-teal">{projeto.nome}</p>
                    <div className="mt-3">
                        <h4 className="font-semibold text-white text-sm mb-2">Últimos Comentários no Projeto:</h4>
                        {comentariosProjeto.length > 0 ? (
                            <div className="space-y-2 max-h-24 overflow-y-auto pr-2 border-l-2 border-gray-600 pl-3">
                                {comentariosProjeto.slice(0, 2).map(c => {
                                    const autor = state.recursos.find(r => r.id === c.autorId);
                                    return (
                                        <div key={c.id} className="text-xs">
                                            <p className="text-white"><span className="font-medium text-sga-gray">{autor?.nome || 'Desconhecido'}:</span> {c.texto}</p>
                                        </div>
                                    );
                                })}
                                {comentariosProjeto.length > 2 && <p className="text-sga-gray text-xs mt-1">...</p>}
                            </div>
                        ) : (
                            <p className="text-sga-gray text-sm">Nenhum comentário no projeto.</p>
                        )}
                    </div>
                </div>
            </div>
        )}


        <div className="mt-6 border-t border-gray-700 pt-6">
            <h3 className="text-xl font-semibold text-white mb-4">Comentários da Tarefa</h3>
            <div className="space-y-4 mb-6">
                {comentariosTarefa.map(c => {
                    const autor = state.recursos.find(r => r.id === c.autorId);
                    return (
                        <div key={c.id} className="bg-sga-dark p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-sga-teal">{autor?.nome || 'Desconhecido'}</p>
                                <p className="text-xs text-sga-gray">{new Date(c.timestamp).toLocaleString()}</p>
                            </div>
                            <p className="text-white whitespace-pre-wrap">{c.texto}</p>
                        </div>
                    );
                })}
            </div>
            <form onSubmit={handleCommentSubmit} className="space-y-3">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicionar um comentário à tarefa..."
                    required
                    rows={3}
                    className="w-full bg-sga-dark p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sga-blue text-white"
                ></textarea>
                 <div className="flex items-center justify-between">
                    <select
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        required
                        className="bg-sga-dark p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sga-blue text-white text-sm"
                    >
                        <option value="">Selecione o autor</option>
                        {state.recursos.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                    </select>
                    <button type="submit" className="bg-sga-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition">Comentar</button>
                 </div>
            </form>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end">
            <button onClick={() => { onClose(); onEdit(tarefa); }} className="bg-sga-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition">Editar Tarefa</button>
        </div>
      </div>
    </div>
  );
};

export default TarefaDetail;