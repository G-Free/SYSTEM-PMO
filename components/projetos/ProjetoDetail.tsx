
import React, { useState, useMemo } from 'react';
import { Projeto, StatusTarefa, StatusProjeto, ImpactoRisco, ProbabilidadeRisco } from '../../types';
import { usePmoStore } from '../../services/pmoService';
import { formatCurrency } from '../../utils/formatting';

interface ProjetoDetailProps {
  projeto: Projeto;
  store: ReturnType<typeof usePmoStore>;
  onClose: () => void;
}

type Tab = 'overview' | 'financial' | 'tasks' | 'team' | 'risks' | 'comments';

const ProgressBar: React.FC<{ value: number; colorClass?: string }> = ({ value, colorClass = "bg-sga-teal" }) => (
    <div className="w-full bg-gray-700 rounded-full h-2 my-2">
      <div
        className={`${colorClass} h-2 rounded-full transition-all duration-500 relative`}
        style={{ width: `${Math.min(value, 100)}%` }}
      >
      </div>
    </div>
);

const KPICard: React.FC<{ label: string; value: string | number; subtext?: string; icon?: React.ReactNode; color?: string }> = ({ label, value, subtext, icon, color = "text-white" }) => (
    <div className="bg-sga-dark p-4 rounded-lg border border-gray-700 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-sga-gray text-xs uppercase tracking-wider font-semibold mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        {icon && <div className="text-gray-500">{icon}</div>}
    </div>
);

const ProjetoDetail: React.FC<ProjetoDetailProps> = ({ projeto, store, onClose }) => {
  const { state } = store;
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const gerente = state.recursos.find(r => r.id === projeto.gerenteId);
  const tasks = state.tarefas.filter(t => t.projetoId === projeto.id);
  const risks = state.riscos.filter(r => r.projetoId === projeto.id);
  const team = state.recursos.filter(r => projeto.recursoIds.includes(r.id) || r.id === projeto.gerenteId);
  const comments = state.comentarios.filter(c => c.entidadeId === projeto.id);

  const metrics = useMemo(() => {
      const completedTasks = tasks.filter(t => t.status === StatusTarefa.Concluida).length;
      const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
      
      const orcamento = Number(projeto.orcamento) || 0;
      const gasto = Number(projeto.gastoAtual) || 0;
      const beneficio = Number(projeto.beneficioPrevisto) || 0;
      
      const budgetUsedPct = orcamento > 0 ? (gasto / orcamento) * 100 : 0;
      const profit = beneficio - orcamento;
      const roi = orcamento > 0 ? (profit / orcamento) * 100 : 0;

      return { progress, budgetUsedPct, profit, roi, orcamento, gasto, beneficio };
  }, [projeto, tasks]);

  const getStatusColor = (status: StatusProjeto) => {
      switch(status) {
          case StatusProjeto.EmAndamento: return 'bg-yellow-900 text-yellow-300 border-yellow-700';
          case StatusProjeto.Concluido: return 'bg-green-900 text-green-300 border-green-700';
          case StatusProjeto.Cancelado: return 'bg-red-900 text-red-300 border-red-700';
          default: return 'bg-blue-900 text-blue-300 border-blue-700';
      }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-sga-dark-light rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-gray-700">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-sga-dark-light rounded-t-xl flex justify-between items-start">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{projeto.nome}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(projeto.status)}`}>
                        {projeto.status.toUpperCase()}
                    </span>
                </div>
                <div className="flex items-center text-sga-gray text-sm space-x-4">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        Gerente: <span className="text-white ml-1 font-medium">{gerente?.nome || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        {new Date(projeto.dataInicio).toLocaleDateString()} - {new Date(projeto.dataFimPrevista).toLocaleDateString()}
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        {/* KPIs Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-800/30 border-b border-gray-700">
             <KPICard label="Orçamento" value={formatCurrency(metrics.orcamento)} />
             <KPICard label="Gasto Real" value={formatCurrency(metrics.gasto)} color={metrics.budgetUsedPct > 100 ? 'text-red-400' : 'text-white'} subtext={`${metrics.budgetUsedPct.toFixed(1)}% utilizado`} />
             <KPICard label="Lucro Estimado" value={formatCurrency(metrics.profit)} color={metrics.profit >= 0 ? 'text-green-400' : 'text-red-400'} />
             <KPICard label="ROI" value={`${metrics.roi.toFixed(2)}%`} color={metrics.roi >= 0 ? 'text-green-400' : 'text-red-400'} />
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-700 px-6 space-x-6 overflow-x-auto">
            {(['overview', 'financial', 'tasks', 'team', 'risks', 'comments'] as Tab[]).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap ${
                        activeTab === tab 
                        ? 'border-sga-teal text-sga-teal' 
                        : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                    }`}
                >
                    {tab === 'overview' ? 'Visão Geral' : 
                     tab === 'financial' ? 'Financeiro' : 
                     tab === 'tasks' ? 'Cronograma' : 
                     tab === 'team' ? 'Equipe' : 
                     tab === 'risks' ? 'Riscos' : 'Comentários'}
                </button>
            ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
            
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Descrição do Projeto</h3>
                        <p className="text-gray-300 leading-relaxed">{projeto.descricao}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-sga-dark p-4 rounded-lg">
                            <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Progresso Físico (Tarefas)</h4>
                            <div className="flex items-end justify-between mb-1">
                                <span className="text-2xl font-bold text-white">{metrics.progress.toFixed(0)}%</span>
                                <span className="text-xs text-gray-400">{tasks.filter(t => t.status === StatusTarefa.Concluida).length}/{tasks.length} tarefas</span>
                            </div>
                            <ProgressBar value={metrics.progress} colorClass="bg-sga-teal" />
                        </div>
                        <div className="bg-sga-dark p-4 rounded-lg">
                            <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Consumo Financeiro</h4>
                            <div className="flex items-end justify-between mb-1">
                                <span className={`text-2xl font-bold ${metrics.budgetUsedPct > 100 ? 'text-red-400' : 'text-white'}`}>{metrics.budgetUsedPct.toFixed(0)}%</span>
                                <span className="text-xs text-gray-400">{formatCurrency(metrics.gasto)} / {formatCurrency(metrics.orcamento)}</span>
                            </div>
                            <ProgressBar value={metrics.budgetUsedPct} colorClass={metrics.budgetUsedPct > 100 ? "bg-red-500" : "bg-blue-500"} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'financial' && (
                <div className="bg-sga-dark rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Item</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            <tr>
                                <td className="px-6 py-4 text-white">Orçamento Inicial</td>
                                <td className="px-6 py-4 text-right text-white font-mono">{formatCurrency(metrics.orcamento)}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 text-white">Gasto Acumulado</td>
                                <td className="px-6 py-4 text-right text-yellow-400 font-mono">{formatCurrency(metrics.gasto)}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 text-white">Saldo Restante</td>
                                <td className={`px-6 py-4 text-right font-mono font-bold ${metrics.orcamento - metrics.gasto < 0 ? 'text-red-500' : 'text-green-400'}`}>
                                    {formatCurrency(metrics.orcamento - metrics.gasto)}
                                </td>
                            </tr>
                            <tr className="bg-gray-800/50">
                                <td className="px-6 py-4 text-white font-medium">Benefício Projetado</td>
                                <td className="px-6 py-4 text-right text-blue-300 font-mono">{formatCurrency(metrics.beneficio)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'tasks' && (
                <div className="space-y-4">
                    {tasks.map(task => (
                        <div key={task.id} className="bg-sga-dark p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-white">{task.nome}</p>
                                <p className="text-xs text-gray-400">Vencimento: {new Date(task.dataVencimento).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded border ${
                                task.status === StatusTarefa.Concluida ? 'border-green-600 text-green-400' : 
                                task.status === StatusTarefa.EmAndamento ? 'border-yellow-600 text-yellow-400' : 
                                'border-gray-600 text-gray-400'
                            }`}>
                                {task.status}
                            </span>
                        </div>
                    ))}
                    {tasks.length === 0 && <p className="text-gray-500 text-center py-4">Nenhuma tarefa associada.</p>}
                </div>
            )}

            {activeTab === 'team' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {team.map(member => (
                         <div key={member.id} className="bg-sga-dark p-4 rounded-lg border border-gray-700 flex items-center space-x-3">
                             <div className="w-10 h-10 rounded-full bg-sga-blue flex items-center justify-center text-white font-bold">
                                 {member.nome.charAt(0)}
                             </div>
                             <div>
                                 <p className="font-semibold text-white">{member.nome}</p>
                                 <p className="text-xs text-gray-400">{member.funcao}</p>
                                 {member.id === projeto.gerenteId && <span className="text-xs text-sga-teal bg-sga-teal/10 px-1 rounded mt-1 inline-block">Gerente</span>}
                             </div>
                         </div>
                     ))}
                </div>
            )}

            {activeTab === 'risks' && (
                <div className="space-y-4">
                    {risks.map(risk => (
                        <div key={risk.id} className="bg-sga-dark p-4 rounded-lg border border-gray-700">
                             <div className="flex justify-between items-start mb-2">
                                 <h4 className="text-white font-medium">{risk.descricao}</h4>
                                 <div className="flex gap-2">
                                     <span className={`text-xs px-2 py-0.5 rounded border ${
                                         risk.impacto === ImpactoRisco.Alto ? 'bg-red-900/50 border-red-500 text-red-200' : 
                                         risk.impacto === ImpactoRisco.Medio ? 'bg-yellow-900/50 border-yellow-500 text-yellow-200' : 'bg-green-900/50 border-green-500 text-green-200'
                                     }`}>Imp: {risk.impacto}</span>
                                 </div>
                             </div>
                             <p className="text-sm text-gray-400"><span className="font-semibold text-gray-500">Mitigação:</span> {risk.planoMitigacao}</p>
                        </div>
                    ))}
                     {risks.length === 0 && <p className="text-gray-500 text-center py-4">Nenhum risco identificado.</p>}
                </div>
            )}

            {activeTab === 'comments' && (
                 <div className="space-y-4">
                     {comments.map(comment => (
                         <div key={comment.id} className="bg-sga-dark p-3 rounded-lg border border-gray-700">
                             <div className="flex justify-between mb-1">
                                 <span className="text-sga-teal font-semibold text-sm">{state.recursos.find(r => r.id === comment.autorId)?.nome || 'Desconhecido'}</span>
                                 <span className="text-gray-500 text-xs">{new Date(comment.timestamp).toLocaleString()}</span>
                             </div>
                             <p className="text-gray-300 text-sm">{comment.texto}</p>
                         </div>
                     ))}
                     {comments.length === 0 && <p className="text-gray-500 text-center py-4">Nenhum comentário.</p>}
                 </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default ProjetoDetail;
