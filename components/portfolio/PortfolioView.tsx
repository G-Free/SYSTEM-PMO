
import React, { useMemo, useState } from 'react';
import { Projeto, StatusProjeto, StatusTarefa } from '../../types';
import { usePmoStore } from '../../services/pmoService';
import { formatCurrency } from '../../utils/formatting';
import ProjetoDetail from '../projetos/ProjetoDetail';

interface PortfolioViewProps {
  store: ReturnType<typeof usePmoStore>;
}

// --- Componentes Auxiliares ---

const HealthIndicator: React.FC<{ progress: number; budgetUsedPct: number }> = ({ progress, budgetUsedPct }) => {
    // Lógica de Saúde: Se o gasto (budgetUsed) for maior que o progresso físico + 10%, é risco.
    let color = 'bg-emerald-500';
    let status = 'Saudável';

    if (budgetUsedPct > progress + 15) {
        color = 'bg-red-500';
        status = 'Crítico';
    } else if (budgetUsedPct > progress + 5) {
        color = 'bg-amber-500';
        status = 'Atenção';
    }

    return (
        <div className="flex items-center gap-1.5" title={`Saúde do Projeto: ${status}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${color} shadow-[0_0_8px_rgba(0,0,0,0.3)]`}></span>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider hidden xl:inline">{status}</span>
        </div>
    );
};

const PortfolioStatCard: React.FC<{ label: string; value: string; subtext?: string; icon: React.ReactNode; trend?: string; trendUp?: boolean }> = ({ label, value, subtext, icon, trend, trendUp }) => (
    <div className="bg-sga-dark-light p-5 rounded-xl border border-gray-700/50 shadow-lg relative overflow-hidden group hover:border-sga-blue/30 transition-all">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 rotate-12">
             {React.cloneElement(icon as React.ReactElement, { className: "w-20 h-20 text-white" })}
        </div>
        <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sga-gray text-xs uppercase tracking-wider font-semibold">{label}</p>
                    <div className="p-1.5 bg-sga-dark rounded-md text-sga-blue ring-1 ring-white/5">
                        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
                    </div>
                </div>
                <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            </div>
            
            <div className="mt-3 flex items-center justify-between">
                {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
                {trend && (
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {trend}
                    </span>
                )}
            </div>
        </div>
    </div>
);

const CompactProjectCard: React.FC<{ projeto: Projeto; store: ReturnType<typeof usePmoStore>; onOpenDetail: (p: Projeto) => void }> = ({ projeto, store, onOpenDetail }) => {
    const { state } = store;
    const gerente = state.recursos.find(r => r.id === projeto.gerenteId);
    
    const metrics = useMemo(() => {
        const tarefas = state.tarefas.filter(t => t.projetoId === projeto.id);
        const completedTasks = tarefas.filter(t => t.status === StatusTarefa.Concluida).length;
        const progress = tarefas.length > 0 ? Math.round((completedTasks / tarefas.length) * 100) : 0;
        
        const orcamento = Number(projeto.orcamento) || 0;
        const gasto = Number(projeto.gastoAtual) || 0;
        const beneficio = Number(projeto.beneficioPrevisto) || 0;
        const budgetUsedPct = orcamento > 0 ? (gasto / orcamento) * 100 : 0;
        const roi = orcamento > 0 ? ((beneficio - orcamento) / orcamento) * 100 : 0;

        return { progress, budgetUsedPct, roi, orcamento, gasto };
    }, [projeto, state.tarefas]);

    const statusColors = {
        [StatusProjeto.EmAndamento]: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        [StatusProjeto.Concluido]: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        [StatusProjeto.Planejado]: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
        [StatusProjeto.Cancelado]: 'text-red-400 border-red-500/30 bg-red-500/10',
    };

    return (
        <div 
            className="bg-sga-dark-light rounded-lg border border-gray-700/60 shadow-md hover:shadow-xl hover:border-sga-blue/40 transition-all duration-300 flex flex-col h-full group cursor-pointer relative overflow-hidden"
            onClick={() => onOpenDetail(projeto)}
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-gray-700 to-transparent group-hover:via-sga-blue transition-all"></div>

            <div className="p-5 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-1">
                             <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusColors[projeto.status]}`}>
                                {projeto.status.toUpperCase()}
                            </span>
                            <HealthIndicator progress={metrics.progress} budgetUsedPct={metrics.budgetUsedPct} />
                        </div>
                        <h3 className="font-bold text-white text-base leading-snug truncate group-hover:text-sga-blue transition-colors">
                            {projeto.nome}
                        </h3>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 my-3 py-3 border-t border-b border-gray-700/50">
                    {/* Coluna Execução */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] text-sga-gray uppercase">Progresso</span>
                            <span className="text-xs font-bold text-white">{metrics.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                            <div className="bg-sga-teal h-1.5 rounded-full" style={{ width: `${metrics.progress}%` }}></div>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                             <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                             <span className="text-[10px] text-gray-400">{new Date(projeto.dataFimPrevista).toLocaleDateString(undefined, {month:'short', year:'2-digit'})}</span>
                        </div>
                    </div>

                    {/* Coluna Financeira */}
                    <div className="space-y-1 pl-4 border-l border-gray-700/50">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] text-sga-gray uppercase">Orçamento</span>
                            <span className={`text-xs font-bold ${metrics.budgetUsedPct > 100 ? 'text-red-400' : 'text-blue-300'}`}>
                                {metrics.budgetUsedPct.toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${metrics.budgetUsedPct > 100 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(metrics.budgetUsedPct, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                             <span className="text-[10px] text-gray-500">ROI</span>
                             <span className={`text-[10px] font-bold ${metrics.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {metrics.roi.toFixed(0)}%
                             </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-[9px] text-gray-300 font-bold">
                            {gerente?.nome.charAt(0)}
                        </div>
                        <span className="text-xs text-sga-gray truncate max-w-[100px]">{gerente?.nome.split(' ')[0]}</span>
                    </div>
                    <button className="text-xs text-sga-blue font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver Detalhes &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal ---

const PortfolioView: React.FC<PortfolioViewProps> = ({ store }) => {
    const { state, actions } = store;
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterManager, setFilterManager] = useState('');

    // Integração com Estado Global para Modal e Histórico
    const selectedProjeto = state.selectedProjectId 
        ? state.projetos.find(p => p.id === state.selectedProjectId) || null 
        : null;

    const handleOpenDetail = (projeto: Projeto) => {
        actions.addRecentProject(projeto.id);
        actions.setSelectedProject(projeto.id);
    };

    const handleCloseDetail = () => {
        actions.setSelectedProject(null);
    };

    // Cálculos de Agregação
    const stats = useMemo(() => {
        const totalProjects = state.projetos.length;
        const totalBudget = state.projetos.reduce((acc, p) => acc + Number(p.orcamento), 0);
        const totalBenefit = state.projetos.reduce((acc, p) => acc + Number(p.beneficioPrevisto), 0);
        const totalROI = totalBudget > 0 ? ((totalBenefit - totalBudget) / totalBudget) * 100 : 0;
        const activeProjects = state.projetos.filter(p => p.status === StatusProjeto.EmAndamento || p.status === StatusProjeto.Planejado).length;

        return { totalProjects, totalBudget, activeProjects, totalROI };
    }, [state.projetos]);

    const filteredProjects = useMemo(() => {
        return state.projetos.filter(p => {
            const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || p.descricao.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesManager = filterManager ? p.gerenteId === filterManager : true;
            return matchesSearch && matchesManager;
        });
    }, [state.projetos, searchTerm, filterManager]);

    const projectsByStatus = useMemo(() => {
        return filteredProjects.reduce((acc, proj) => {
            if (!acc[proj.status]) acc[proj.status] = [];
            acc[proj.status].push(proj);
            return acc;
        }, {} as Record<StatusProjeto, Projeto[]>);
    }, [filteredProjects]);
    
    const statusOrder: StatusProjeto[] = [
        StatusProjeto.EmAndamento,
        StatusProjeto.Planejado,
        StatusProjeto.Concluido,
        StatusProjeto.Cancelado
    ];

    const managers = useMemo(() => {
        const managerIds = Array.from(new Set(state.projetos.map(p => p.gerenteId)));
        return state.recursos.filter(r => managerIds.includes(r.id));
    }, [state.projetos, state.recursos]);

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Portfólio de Projetos</h1>
            <p className="text-sga-gray mt-1 text-sm">Visão estratégica consolidada e análise de saúde.</p>
        </div>
        
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto bg-sga-dark-light p-1.5 rounded-lg border border-gray-700">
             <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </span>
                <input 
                    type="text" 
                    placeholder="Buscar projeto..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 bg-sga-dark border-none rounded-md py-2 pl-9 pr-4 text-sm text-white focus:ring-1 focus:ring-sga-blue placeholder-gray-600"
                />
             </div>
             <select 
                value={filterManager}
                onChange={(e) => setFilterManager(e.target.value)}
                className="bg-sga-dark border-none rounded-md py-2 px-3 text-sm text-white focus:ring-1 focus:ring-sga-blue cursor-pointer"
             >
                 <option value="">Todos os Gerentes</option>
                 {managers.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
             </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <PortfolioStatCard 
            label="Total Investido" 
            value={formatCurrency(stats.totalBudget)} 
            subtext="CAPEX Aprovado"
            icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
        />
        <PortfolioStatCard 
            label="Projetos Ativos" 
            value={String(stats.activeProjects)} 
            subtext={`${stats.totalProjects} no total`}
            icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>}
        />
        <PortfolioStatCard 
            label="ROI Portfólio" 
            value={`${stats.totalROI.toFixed(1)}%`} 
            subtext="Média Ponderada"
            trend={stats.totalROI > 0 ? "+ Positivo" : "- Negativo"}
            trendUp={stats.totalROI > 0}
            icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
        />
        <PortfolioStatCard 
            label="Liderança" 
            value={String(managers.length)} 
            subtext="Gerentes Ativos"
            icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
        />
      </div>
      
      {/* Projetos por Status */}
      <div className="space-y-10">
        {statusOrder.map(status => (
            projectsByStatus[status] && projectsByStatus[status].length > 0 && (
                <div key={status} className="animate-fadeIn">
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-lg font-bold text-white uppercase tracking-wider border-l-4 border-sga-blue pl-3">
                            {status}
                        </h2>
                        <div className="h-px bg-gray-800 flex-1"></div>
                        <span className="text-xs font-mono text-gray-500">{projectsByStatus[status].length} PROJETOS</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {projectsByStatus[status].map(projeto => (
                            <CompactProjectCard 
                                key={projeto.id} 
                                projeto={projeto} 
                                store={store} 
                                onOpenDetail={handleOpenDetail}
                            />
                        ))}
                    </div>
                </div>
            )
        ))}

        {filteredProjects.length === 0 && (
            <div className="text-center py-20 bg-sga-dark-light rounded-xl border border-dashed border-gray-700">
                <p className="text-gray-400">Nenhum projeto encontrado com os filtros atuais.</p>
                <button 
                    onClick={() => { setSearchTerm(''); setFilterManager(''); }}
                    className="mt-4 text-sga-blue hover:underline text-sm"
                >
                    Limpar filtros
                </button>
            </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedProjeto && (
          <ProjetoDetail 
            projeto={selectedProjeto}
            store={store}
            onClose={handleCloseDetail}
          />
      )}

    </div>
  );
};

export default PortfolioView;
