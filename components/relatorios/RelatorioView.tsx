
import React, { useMemo } from 'react';
import { usePmoStore } from '../../services/pmoService';
import { StatusProjeto, StatusTarefa } from '../../types';
import { formatCurrency } from '../../utils/formatting';

interface RelatorioViewProps {
  store: ReturnType<typeof usePmoStore>;
}

// --- Componentes de UI para o Relatório ---

const ReportCard: React.FC<{ title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }> = ({ title, children, className = "", action }) => (
    <div className={`bg-sga-dark-light rounded-xl border border-gray-700/50 shadow-lg overflow-hidden flex flex-col ${className}`}>
        <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/20">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
            {action}
        </div>
        <div className="p-6 flex-1 flex flex-col">
            {children}
        </div>
    </div>
);

const KPICard: React.FC<{ label: string; value: string; subtext: string; trend?: 'up' | 'down' | 'neutral'; color?: string }> = ({ label, value, subtext, trend, color = 'text-white' }) => (
    <div className="bg-sga-dark-light p-5 rounded-xl border border-gray-700/50 shadow hover:border-sga-blue/30 transition-all">
        <p className="text-xs text-sga-gray font-semibold uppercase tracking-wider mb-2">{label}</p>
        <div className="flex items-baseline gap-2">
            <h4 className={`text-3xl font-bold ${color} tracking-tight`}>{value}</h4>
            {trend && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                    trend === 'up' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    trend === 'down' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    'bg-gray-700 text-gray-400 border-gray-600'
                }`}>
                    {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '-'}
                </span>
            )}
        </div>
        <p className="text-xs text-gray-500 mt-2">{subtext}</p>
    </div>
);

const ProgressBar: React.FC<{ value: number; max: number; label: string; subLabel?: string }> = ({ value, max, label, subLabel }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const color = percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-amber-500' : 'bg-sga-teal';
    
    return (
        <div className="mb-4 last:mb-0">
            <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-medium text-white">{label}</span>
                <span className="text-xs text-gray-400">{subLabel} <span className="text-white font-bold ml-1">{value}</span></span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const RelatorioView: React.FC<RelatorioViewProps> = ({ store }) => {
    const { state } = store;

    // --- Cálculos ---

    const resourceStats = useMemo(() => {
        const workloads = state.recursos.map(recurso => ({
            id: recurso.id,
            name: recurso.nome,
            role: recurso.funcao,
            taskCount: state.tarefas.filter(t => t.responsavelId === recurso.id && t.status !== StatusTarefa.Concluida).length,
            completedTasks: state.tarefas.filter(t => t.responsavelId === recurso.id && t.status === StatusTarefa.Concluida).length
        })).sort((a,b) => b.taskCount - a.taskCount);

        const maxTasks = Math.max(...workloads.map(r => r.taskCount), 0) || 1;
        return { workloads, maxTasks };
    }, [state.recursos, state.tarefas]);

    const projectStats = useMemo(() => {
        const counts = state.projetos.reduce((acc: Record<string, number>, projeto) => {
            const key = projeto.status;
            const current = acc[key] || 0;
            acc[key] = current + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const total = state.projetos.length;
        return Object.entries(counts).map(([status, count]) => {
            const countNum = Number(count);
            return {
                status: status as StatusProjeto,
                count: countNum,
                percentage: total > 0 ? (countNum / total) * 100 : 0,
            };
        }).sort((a,b) => b.count - a.count);
    }, [state.projetos]);
    
    const financialOverview = useMemo(() => {
        return state.projetos.map(p => {
            const orcamento = Number(p.orcamento) || 0;
            const gastoAtual = Number(p.gastoAtual) || 0;
            const beneficioPrevisto = Number(p.beneficioPrevisto) || 0;
            const lucro = beneficioPrevisto - orcamento;
            const roi = orcamento > 0 ? (lucro / orcamento) * 100 : 0;
            const restante = orcamento - gastoAtual;
            const executionPct = orcamento > 0 ? (gastoAtual / orcamento) * 100 : 0;

            return ({ ...p, orcamento, gastoAtual, beneficioPrevisto, lucro, roi, restante, executionPct });
        });
    }, [state.projetos]);

    const globalStats = useMemo(() => {
        const totalBudget = financialOverview.reduce((acc, p) => acc + p.orcamento, 0);
        const totalSpent = financialOverview.reduce((acc, p) => acc + p.gastoAtual, 0);
        const totalProfit = financialOverview.reduce((acc, p) => acc + p.lucro, 0);
        const avgRoi = financialOverview.length > 0 ? financialOverview.reduce((acc, p) => acc + p.roi, 0) / financialOverview.length : 0;
        
        return { totalBudget, totalSpent, totalProfit, avgRoi };
    }, [financialOverview]);

    return (
        <div className="space-y-8 pb-12 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-700/50 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Inteligência Operacional</h1>
                    <p className="text-sga-gray mt-1">Relatórios consolidados de performance, finanças e recursos.</p>
                </div>
                <button 
                    className="bg-sga-surface border border-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                    onClick={() => window.print()}
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    Exportar PDF
                </button>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    label="Orçamento Global" 
                    value={formatCurrency(globalStats.totalBudget)} 
                    subtext="CAPEX Aprovado" 
                    color="text-white"
                />
                <KPICard 
                    label="Execução Financeira" 
                    value={formatCurrency(globalStats.totalSpent)} 
                    subtext={`${((globalStats.totalSpent / globalStats.totalBudget) * 100).toFixed(1)}% do orçamento`} 
                    color="text-sga-blue"
                    trend={globalStats.totalSpent > globalStats.totalBudget ? 'down' : 'neutral'}
                />
                <KPICard 
                    label="Lucro Projetado" 
                    value={formatCurrency(globalStats.totalProfit)} 
                    subtext="Benefício - Custo" 
                    color={globalStats.totalProfit >= 0 ? "text-emerald-400" : "text-red-400"}
                    trend={globalStats.totalProfit >= 0 ? 'up' : 'down'}
                />
                <KPICard 
                    label="ROI Médio do Portfólio" 
                    value={`${globalStats.avgRoi.toFixed(2)}%`} 
                    subtext="Retorno sobre Investimento" 
                    color={globalStats.avgRoi >= 0 ? "text-sga-accent" : "text-red-400"}
                    trend={globalStats.avgRoi >= 10 ? 'up' : 'neutral'}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Distribuição de Status */}
                <ReportCard title="Distribuição do Portfólio" className="lg:col-span-1">
                    <div className="flex flex-col justify-center h-full gap-6">
                        <div className="flex h-4 w-full rounded-full overflow-hidden bg-gray-800">
                             {projectStats.map((item, idx) => {
                                 const color = item.status === StatusProjeto.EmAndamento ? 'bg-amber-500' :
                                               item.status === StatusProjeto.Concluido ? 'bg-emerald-500' :
                                               item.status === StatusProjeto.Cancelado ? 'bg-red-500' : 'bg-blue-500';
                                 return <div key={idx} className={`${color} h-full`} style={{ width: `${item.percentage}%` }}></div>
                             })}
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {projectStats.map(item => {
                                 const color = item.status === StatusProjeto.EmAndamento ? 'bg-amber-500' :
                                               item.status === StatusProjeto.Concluido ? 'bg-emerald-500' :
                                               item.status === StatusProjeto.Cancelado ? 'bg-red-500' : 'bg-blue-500';
                                return (
                                    <div key={item.status} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${color}`}></div>
                                            <span className="text-sm text-gray-300">{item.status}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-white">{item.count}</span>
                                            <span className="text-xs text-gray-500 w-12 text-right">{item.percentage.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </ReportCard>

                {/* Carga de Trabalho */}
                <ReportCard title="Capacidade da Equipe" className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {resourceStats.workloads.map(recurso => (
                            <ProgressBar 
                                key={recurso.id}
                                label={recurso.name}
                                subLabel={recurso.role}
                                value={recurso.taskCount}
                                max={resourceStats.maxTasks}
                            />
                        ))}
                    </div>
                </ReportCard>
            </div>
            
            {/* Tabela Detalhada Financeira */}
            <ReportCard title="Demonstrativo Financeiro por Projeto">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700 text-left">
                                <th className="py-3 px-4 font-semibold text-gray-400 uppercase tracking-wider">Projeto</th>
                                <th className="py-3 px-4 font-semibold text-gray-400 uppercase tracking-wider text-right">Orçamento</th>
                                <th className="py-3 px-4 font-semibold text-gray-400 uppercase tracking-wider text-right">Executado</th>
                                <th className="py-3 px-4 font-semibold text-gray-400 uppercase tracking-wider text-right">% Uso</th>
                                <th className="py-3 px-4 font-semibold text-gray-400 uppercase tracking-wider text-right">Saldo</th>
                                <th className="py-3 px-4 font-semibold text-gray-400 uppercase tracking-wider text-right">ROI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {financialOverview.map(proj => (
                                <tr key={proj.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-4 font-medium text-white group-hover:text-sga-blue transition-colors">
                                        {proj.nome}
                                        <span className="block text-[10px] text-gray-500 font-normal mt-0.5">{proj.status}</span>
                                    </td>
                                    <td className="py-4 px-4 text-right text-gray-300 font-mono">{formatCurrency(proj.orcamento)}</td>
                                    <td className="py-4 px-4 text-right text-gray-300 font-mono">{formatCurrency(proj.gastoAtual)}</td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className={`font-bold ${proj.executionPct > 100 ? 'text-red-400' : 'text-gray-300'}`}>
                                                {proj.executionPct.toFixed(0)}%
                                            </span>
                                            <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${proj.executionPct > 100 ? 'bg-red-500' : 'bg-sga-blue'}`} 
                                                    style={{ width: `${Math.min(proj.executionPct, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`py-4 px-4 text-right font-mono font-bold ${proj.restante < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {formatCurrency(proj.restante)}
                                    </td>
                                    <td className={`py-4 px-4 text-right font-bold ${proj.roi < 0 ? 'text-red-400' : 'text-sga-accent'}`}>
                                        {proj.roi.toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ReportCard>
        </div>
    );
};

export default RelatorioView;
