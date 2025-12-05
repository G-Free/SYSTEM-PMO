
import React, { useMemo } from 'react';
import { Projeto, Tarefa, StatusTarefa, StatusProjeto, ImpactoRisco, StatusRisco } from '../types';
import { usePmoStore } from '../services/pmoService';
import { formatCurrency } from '../utils/formatting';
import { SgaLogo } from './icons/SgaLogo';

interface DashboardProps {
  store: ReturnType<typeof usePmoStore>;
  onNavigateToProjects: (status: StatusProjeto) => void;
}

// --- Bento Grid Components ---

const BentoGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-[minmax(160px,auto)] ${className}`}>
        {children}
    </div>
);

const BentoCard: React.FC<{ 
    children: React.ReactNode; 
    className?: string; 
    title?: string;
    icon?: React.ReactNode;
    headerAction?: React.ReactNode;
}> = ({ children, className = "", title, icon, headerAction }) => (
    <div className={`bg-sga-surface border border-slate-700/50 rounded-2xl p-5 flex flex-col shadow-xl shadow-black/10 hover:border-slate-600 transition-all duration-300 relative overflow-hidden group ${className}`}>
        {/* Subtle Gradient Background Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {(title || icon) && (
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                    {icon && <div className="text-slate-400 group-hover:text-sga-accent transition-colors">{icon}</div>}
                    {title && <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h3>}
                </div>
                {headerAction && <div>{headerAction}</div>}
            </div>
        )}
        <div className="flex-1 flex flex-col relative z-10">{children}</div>
    </div>
);

// --- KPI Stat Card (Compact) ---
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; trend?: string; trendUp?: boolean }> = ({ title, value, icon, trend, trendUp }) => (
    <div className="bg-sga-surface border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between shadow-lg hover:border-sga-brand/30 transition-all duration-300 relative overflow-hidden group h-full">
        <div className="flex justify-between items-start">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-sga-brand group-hover:bg-sga-brand group-hover:text-white transition-colors">
                {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
            </div>
             {trend && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${trendUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {trend}
                </span>
            )}
        </div>
        
        <div className="mt-4">
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">{title}</p>
        </div>
    </div>
);

// --- Financial Overview Widget ---
const FinancialOverview: React.FC<{ projetos: Projeto[] }> = ({ projetos }) => {
    const totals = useMemo(() => {
        return projetos.reduce((acc, p) => ({
            orcamento: acc.orcamento + Number(p.orcamento),
            gasto: acc.gasto + Number(p.gastoAtual),
            beneficio: acc.beneficio + Number(p.beneficioPrevisto)
        }), { orcamento: 0, gasto: 0, beneficio: 0 });
    }, [projetos]);

    const roi = totals.orcamento > 0 ? ((totals.beneficio - totals.orcamento) / totals.orcamento) * 100 : 0;
    const utilization = totals.orcamento > 0 ? (totals.gasto / totals.orcamento) * 100 : 0;
    const variance = totals.orcamento - totals.gasto;

    return (
        <BentoCard 
            title="Performance Financeira" 
            className="md:col-span-2 md:row-span-1" // Span 2 columns
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        >
            <div className="flex flex-col h-full justify-between gap-6">
                <div>
                     <div className="flex justify-between items-end mb-3">
                        <div>
                            <p className="text-3xl font-bold text-white tracking-tight">{formatCurrency(totals.gasto)}</p>
                            <p className="text-xs text-slate-400 mt-1">Gasto realizado de <span className="text-slate-300">{formatCurrency(totals.orcamento)}</span></p>
                        </div>
                        <div className="text-right">
                            <p className={`text-xl font-bold ${variance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Variância</p>
                        </div>
                    </div>

                    {/* Modern Progress Bar */}
                    <div className="relative h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                        <div 
                            className={`h-full relative transition-all duration-1000 ease-out ${utilization > 100 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-sga-brand to-sga-accent'}`} 
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                        ></div>
                        {utilization > 100 && (
                             <div className="absolute top-0 bottom-0 w-0.5 bg-white z-10 dashed" style={{ left: `${(100/utilization)*100}%` }}></div>
                        )}
                    </div>
                     <div className="flex justify-between text-[10px] mt-2 text-slate-500 font-medium tracking-wide">
                        <span>0%</span>
                        <span>{utilization.toFixed(1)}% Utilizado</span>
                        <span>100%</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">ROI Estimado</p>
                        <p className={`text-lg font-bold ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {roi.toFixed(1)}%
                        </p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Benefício</p>
                        <p className="text-lg font-bold text-sga-accent">
                            {formatCurrency(totals.beneficio)}
                        </p>
                    </div>
                </div>
            </div>
        </BentoCard>
    );
};

// --- Risk Overview Widget ---
const RiskOverview: React.FC<{ store: ReturnType<typeof usePmoStore> }> = ({ store }) => {
    const { state } = store;
    const risksByImpact = useMemo(() => {
        const counts: Record<string, number> = { [ImpactoRisco.Alto]: 0, [ImpactoRisco.Medio]: 0, [ImpactoRisco.Baixo]: 0 };
        state.riscos.forEach(r => {
            if (r.status !== StatusRisco.Fechado && r.status !== StatusRisco.Mitigado) {
                 const current = counts[r.impacto] || 0;
                 counts[r.impacto] = current + 1;
            }
        });
        return counts;
    }, [state.riscos]);

    return (
        <BentoCard 
            title="Matriz de Riscos"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        >
            <div className="space-y-4 flex flex-col justify-center h-full">
                {[
                    { label: ImpactoRisco.Alto, count: risksByImpact[ImpactoRisco.Alto], color: 'bg-red-500', text: 'text-red-400' },
                    { label: ImpactoRisco.Medio, count: risksByImpact[ImpactoRisco.Medio], color: 'bg-amber-500', text: 'text-amber-400' },
                    { label: ImpactoRisco.Baixo, count: risksByImpact[ImpactoRisco.Baixo], color: 'bg-sga-accent', text: 'text-sga-accent' }
                ].map((risk) => (
                    <div key={risk.label} className="group">
                         <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-400 font-semibold">{risk.label}</span>
                            <span className={`font-bold ${risk.text}`}>{risk.count}</span>
                         </div>
                         <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className={`${risk.color} h-1.5 rounded-full transition-all duration-500 group-hover:opacity-80`} style={{ width: `${Math.min(risk.count * 15, 100)}%` }}></div>
                         </div>
                    </div>
                ))}
            </div>
        </BentoCard>
    );
};

// --- Resource Snapshot Widget ---
const ResourceSnapshot: React.FC<{ store: ReturnType<typeof usePmoStore> }> = ({ store }) => {
    const { state } = store;
    const topResources = useMemo(() => {
        return state.recursos.map(r => ({
            ...r,
            activeTasks: state.tarefas.filter(t => t.responsavelId === r.id && t.status !== StatusTarefa.Concluida).length
        }))
        .sort((a,b) => b.activeTasks - a.activeTasks)
        .slice(0, 3);
    }, [state.recursos, state.tarefas]);

    return (
        <BentoCard 
            title="Top Alocação"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        >
            <div className="space-y-3">
                {topResources.map(r => (
                    <div key={r.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:border-sga-brand/50 transition-colors">
                                {r.nome.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-200 text-sm font-medium leading-none truncate">{r.nome}</p>
                                <p className="text-[10px] text-slate-500 mt-1 truncate">{r.funcao}</p>
                            </div>
                        </div>
                         <div className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                             r.activeTasks > 5 
                             ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                             : 'bg-sga-brand/10 text-sga-brand border-sga-brand/20'
                         }`}>
                            {r.activeTasks}
                         </div>
                    </div>
                ))}
            </div>
        </BentoCard>
    )
}

// --- Status Donut Chart ---
const DonutChart: React.FC<{ 
    data: { status: string, count: number, percentage: number }[],
    onSegmentClick: (status: string) => void
}> = ({ data, onSegmentClick }) => {
    const colors = {
        [StatusProjeto.EmAndamento]: '#f59e0b', // amber-500
        [StatusProjeto.Concluido]: '#319795',   // sga-accent (teal)
        [StatusProjeto.Planejado]: '#2b6cb0',   // sga-brand (blue)
        [StatusProjeto.Cancelado]: '#ef4444',   // red-500
    };
    const total = data.reduce((acc, item) => acc + item.count, 0);
    let cumulative = 0;

    return (
        <BentoCard 
            title="Status Projetos"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
        >
            <div className="flex flex-col items-center justify-center h-full relative">
                <div className="relative w-32 h-32">
                    <svg viewBox="0 0 36 36" className="transform -rotate-90 w-full h-full">
                        <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#1e293b" strokeWidth="3"></circle>
                        {data.map(item => {
                            const percentage = total > 0 ? (item.count / total) * 100 : 0;
                            const currentCumulative = cumulative;
                            cumulative += percentage;
                            return (
                                <circle
                                    key={item.status}
                                    cx="18" cy="18" r="15.9155"
                                    fill="transparent"
                                    stroke={colors[item.status as StatusProjeto] || '#94a3b8'}
                                    strokeWidth="3"
                                    strokeDasharray={`${percentage} ${100 - percentage}`}
                                    strokeDashoffset={-currentCumulative + percentage} 
                                    className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                                    onClick={() => onSegmentClick(item.status)}
                                >
                                    <title>{item.status}: {item.count} ({percentage.toFixed(1)}%)</title>
                                </circle>
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-2xl font-bold text-white">{total}</span>
                         <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Projetos</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 w-full mt-4">
                    {data.slice(0, 4).map(item => (
                         <div key={item.status} className="flex items-center gap-1.5 cursor-pointer hover:opacity-80" onClick={() => onSegmentClick(item.status)}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[item.status as StatusProjeto] || '#94a3b8' }}></span>
                            <span className="text-[10px] text-slate-400 font-medium truncate">{item.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </BentoCard>
    );
};

// --- Upcoming Deadlines Widget ---
const UpcomingDeadlines: React.FC<{ tarefas: Tarefa[] }> = ({ tarefas }) => {
    const upcomingTasks = useMemo(() => {
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        return tarefas
            .filter(t => t.status !== StatusTarefa.Concluida && new Date(t.dataVencimento) >= now && new Date(t.dataVencimento) <= nextWeek)
            .sort((a,b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())
            .slice(0, 4);
    }, [tarefas]);

    return (
        <BentoCard 
            title="Prazos Críticos"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        >
            {upcomingTasks.length > 0 ? (
                <div className="space-y-2">
                    {upcomingTasks.map(task => (
                        <div key={task.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className="w-1 h-8 rounded-full bg-amber-500 flex-shrink-0"></div>
                                <div>
                                    <p className="text-xs text-slate-200 font-medium truncate max-w-[120px]">{task.nome}</p>
                                    <p className="text-[10px] text-slate-500">Vence em breve</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-mono text-amber-500 font-bold block">
                                    {new Date(task.dataVencimento).toLocaleDateString(undefined, {weekday: 'short', day: 'numeric'})}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                     <svg className="w-8 h-8 text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     <p className="text-slate-500 text-xs">Agenda livre esta semana.</p>
                </div>
            )}
        </BentoCard>
    );
};

// --- Alerts Component ---
const Alerts: React.FC<{ store: ReturnType<typeof usePmoStore> }> = ({ store }) => {
    const { state } = store;
    const overdueTasks = useMemo(() => state.tarefas.filter(t => new Date(t.dataVencimento) < new Date() && t.status !== StatusTarefa.Concluida), [state.tarefas]);
    const overBudgetProjects = useMemo(() => state.projetos.filter(p => Number(p.gastoAtual) > Number(p.orcamento)), [state.projetos]);

    if (overdueTasks.length === 0 && overBudgetProjects.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-red-900/40 to-red-800/20 border border-red-500/20 rounded-xl p-4 mb-8 flex items-start gap-4 backdrop-blur-sm animate-fadeIn">
            <div className="p-2 bg-red-500/10 rounded-full text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
                 <h2 className="text-sm font-bold text-red-200 mb-1">Atenção Necessária</h2>
                 <p className="text-xs text-red-300/80 mb-3">Existem itens críticos que requerem sua intervenção imediata.</p>
                 <div className="flex flex-wrap gap-2">
                    {overBudgetProjects.map(p => (
                        <span key={p.id} className="text-[10px] font-bold bg-red-500/20 text-red-200 px-2 py-1 rounded border border-red-500/20">
                            Orçamento: {p.nome}
                        </span>
                    ))}
                    {overdueTasks.slice(0,3).map(t => (
                        <span key={t.id} className="text-[10px] font-bold bg-red-500/20 text-red-200 px-2 py-1 rounded border border-red-500/20">
                            Atraso: {t.nome}
                        </span>
                    ))}
                    {overdueTasks.length > 3 && <span className="text-[10px] text-red-300 underline pt-1">+{overdueTasks.length - 3} outros</span>}
                 </div>
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ store, onNavigateToProjects }) => {
    const { state } = store;
    const { projetos, tarefas, riscos } = state;

    const activeRisks = riscos.filter(r => r.status !== StatusRisco.Fechado && r.status !== StatusRisco.Mitigado).length;
    
    const projectStatusDistribution = useMemo(() => {
        const counts = state.projetos.reduce((acc: Record<string, number>, projeto) => {
            const status = projeto.status;
            const currentCount = acc[status] || 0;
            acc[status] = currentCount + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const total = state.projetos.length;
        if (total === 0) return [];
        
        return Object.entries(counts).map(([status, count]) => ({
            status: status as StatusProjeto,
            count: Number(count),
            percentage: (Number(count) / total) * 100,
        })).sort((a,b) => b.count - a.count);
    }, [state.projetos]);

    return (
        <div className="max-w-[1600px] mx-auto pb-12">
            <header className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-sga-surface p-2.5 rounded-xl shadow-lg border border-slate-700/50">
                        <SgaLogo className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Painel Executivo</h1>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </header>
            
            <Alerts store={store} />

            <BentoGrid>
                {/* Row 1: KPI Stats */}
                <StatCard 
                    title="Projetos Totais" 
                    value={projetos.length}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                    trend="+2 este mês"
                    trendUp={true}
                />
                <StatCard 
                    title="Tarefas Ativas" 
                    value={tarefas.filter(t => t.status === StatusTarefa.EmAndamento || t.status === StatusTarefa.AFazer).length} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                />
                 <StatCard 
                    title="Riscos Críticos" 
                    value={activeRisks} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    trend={activeRisks > 0 ? "Requer Ação" : "Estável"}
                    trendUp={activeRisks === 0}
                />
                 <StatCard 
                    title="Recursos" 
                    value={state.recursos.length} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />

                {/* Row 2: Main Logic */}
                <FinancialOverview projetos={projetos} />
                <DonutChart 
                    data={projectStatusDistribution} 
                    onSegmentClick={(status) => onNavigateToProjects(status as StatusProjeto)}
                />
                <RiskOverview store={store} />
                
                {/* Row 3: Operational */}
                <ResourceSnapshot store={store} />
                <UpcomingDeadlines tarefas={tarefas} />
            </BentoGrid>
        </div>
    );
};

export default Dashboard;
