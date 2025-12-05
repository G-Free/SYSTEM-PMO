
import React, { useMemo, useState } from 'react';
import { usePmoStore } from '../../services/pmoService';
import { StatusProjeto, Projeto } from '../../types';

interface RoadmapViewProps {
  store: ReturnType<typeof usePmoStore>;
}

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const RoadmapView: React.FC<RoadmapViewProps> = ({ store }) => {
    const { state } = store;
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    // 1. Agrupar projetos por Status
    const groupedProjects = useMemo(() => {
        const groups: Record<string, Projeto[]> = {
            [StatusProjeto.EmAndamento]: [],
            [StatusProjeto.Planejado]: [],
            [StatusProjeto.Concluido]: [],
            [StatusProjeto.Cancelado]: [],
        };

        state.projetos.forEach(p => {
            const pStart = new Date(p.dataInicio);
            const pEnd = new Date(p.dataFimPrevista);
            
            // Filtrar projetos que tocam o ano selecionado
            const startYear = pStart.getFullYear();
            const endYear = pEnd.getFullYear();

            if (startYear <= currentYear && endYear >= currentYear) {
                if (groups[p.status]) {
                    groups[p.status].push(p);
                }
            }
        });

        return groups;
    }, [state.projetos, currentYear]);

    // 2. Calcular posição e largura da barra
    const getBarMetrics = (start: Date, end: Date) => {
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);
        const totalYearTime = yearEnd.getTime() - yearStart.getTime();

        // Ajustar datas para não ultrapassar o ano atual visualmente
        const effectiveStart = start < yearStart ? yearStart : start;
        const effectiveEnd = end > yearEnd ? yearEnd : end;

        const leftPct = ((effectiveStart.getTime() - yearStart.getTime()) / totalYearTime) * 100;
        const widthPct = ((effectiveEnd.getTime() - effectiveStart.getTime()) / totalYearTime) * 100;

        return {
            left: Math.max(0, leftPct),
            width: Math.max(0.5, widthPct) // Mínimo de largura para visibilidade
        };
    };

    // 3. Posição da linha "Hoje"
    const getTodayPosition = () => {
        const now = new Date();
        if (now.getFullYear() !== currentYear) return -1;
        
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);
        const totalYearTime = yearEnd.getTime() - yearStart.getTime();
        
        return ((now.getTime() - yearStart.getTime()) / totalYearTime) * 100;
    };

    const todayPos = getTodayPosition();

    const statusColors: Record<string, string> = {
        [StatusProjeto.EmAndamento]: 'bg-yellow-500 border-yellow-400',
        [StatusProjeto.Planejado]: 'bg-blue-500 border-blue-400',
        [StatusProjeto.Concluido]: 'bg-emerald-500 border-emerald-400',
        [StatusProjeto.Cancelado]: 'bg-gray-600 border-gray-500',
    };

    const statusOrder = [StatusProjeto.EmAndamento, StatusProjeto.Planejado, StatusProjeto.Concluido];

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Roadmap Estratégico</h1>
                    <p className="text-sga-gray text-sm mt-1">Cronograma anual de entregas e fases</p>
                </div>
                
                <div className="flex items-center bg-sga-dark-light rounded-lg p-1 border border-gray-700">
                    <button 
                        onClick={() => setCurrentYear(prev => prev - 1)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <span className="px-4 font-bold text-white text-lg">{currentYear}</span>
                    <button 
                        onClick={() => setCurrentYear(prev => prev + 1)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
            </div>

            <div className="bg-sga-dark-light rounded-xl shadow-xl border border-gray-700/50 flex-1 flex flex-col overflow-hidden">
                {/* Header dos Meses */}
                <div className="flex border-b border-gray-700 bg-sga-dark">
                    <div className="w-64 flex-shrink-0 p-4 font-bold text-sga-gray border-r border-gray-700">
                        PROJETOS
                    </div>
                    <div className="flex-1 relative">
                        <div className="grid grid-cols-12 h-full">
                            {MONTHS.map((month, idx) => (
                                <div key={idx} className="border-r border-gray-800 p-3 text-center text-sm font-semibold text-gray-400">
                                    {month}
                                </div>
                            ))}
                        </div>
                        {/* Linha de Hoje (Header) */}
                        {todayPos >= 0 && (
                            <div 
                                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                                style={{ left: `${todayPos}%` }}
                            >
                                <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="absolute top-2 left-1 bg-red-500 text-white text-[10px] px-1 rounded transform -translate-x-1/2">Hoje</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Corpo do Roadmap */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/50">
                    <div className="relative min-h-full">
                        {/* Grid de Fundo */}
                        <div className="absolute inset-0 pl-64 pointer-events-none">
                            <div className="grid grid-cols-12 h-full w-full">
                                {MONTHS.map((_, idx) => (
                                    <div key={idx} className="border-r border-gray-800/50 h-full"></div>
                                ))}
                            </div>
                            {/* Linha de Hoje (Corpo) */}
                            {todayPos >= 0 && (
                                <div 
                                    className="absolute top-0 bottom-0 w-px bg-red-500/50 dashed border-l border-red-500/30 z-0"
                                    style={{ left: `${todayPos}%` }}
                                ></div>
                            )}
                        </div>

                        {/* Grupos de Projetos */}
                        {statusOrder.map(status => {
                            const projects = groupedProjects[status];
                            if (projects.length === 0) return null;

                            return (
                                <div key={status} className="relative z-10 mb-2">
                                    <div className="sticky top-0 bg-slate-800/90 backdrop-blur-sm border-y border-gray-700 px-4 py-2 flex items-center z-20">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${status === StatusProjeto.EmAndamento ? 'bg-yellow-500' : status === StatusProjeto.Concluido ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">{status}</h3>
                                        <span className="ml-2 text-xs text-gray-500">({projects.length})</span>
                                    </div>

                                    {projects.map(project => {
                                        const metrics = getBarMetrics(new Date(project.dataInicio), new Date(project.dataFimPrevista));
                                        
                                        return (
                                            <div key={project.id} className="flex border-b border-gray-800/50 hover:bg-white/5 transition-colors group">
                                                <div className="w-64 flex-shrink-0 p-3 pl-6 border-r border-gray-800 flex flex-col justify-center">
                                                    <div className="font-medium text-white text-sm truncate" title={project.nome}>{project.nome}</div>
                                                    <div className="text-xs text-sga-gray truncate">{store.state.recursos.find(r => r.id === project.gerenteId)?.nome}</div>
                                                </div>
                                                <div className="flex-1 relative h-14">
                                                    <div 
                                                        className={`absolute top-1/2 -translate-y-1/2 h-6 rounded-md shadow-lg border-b-2 cursor-pointer transition-all hover:h-8 hover:brightness-110 z-10 flex items-center px-2 ${statusColors[project.status]}`}
                                                        style={{ 
                                                            left: `${metrics.left}%`, 
                                                            width: `${metrics.width}%`,
                                                        }}
                                                    >
                                                        <span className="text-[10px] font-bold text-white truncate drop-shadow-md">
                                                            {project.nome}
                                                        </span>

                                                        {/* Tooltip */}
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-gray-700 z-50">
                                                            <p className="font-bold mb-1">{project.nome}</p>
                                                            <p className="text-gray-400">Início: <span className="text-white">{new Date(project.dataInicio).toLocaleDateString()}</span></p>
                                                            <p className="text-gray-400">Fim: <span className="text-white">{new Date(project.dataFimPrevista).toLocaleDateString()}</span></p>
                                                            <p className="text-gray-400 mt-1">Status: <span className="text-white">{project.status}</span></p>
                                                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-700"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoadmapView;
