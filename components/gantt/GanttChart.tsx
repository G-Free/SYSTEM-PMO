import React, { useState, useMemo, useRef, useEffect } from 'react';
import { usePmoStore } from '../../services/pmoService';
import { Projeto, Tarefa } from '../../types';

interface GanttChartProps {
  store: ReturnType<typeof usePmoStore>;
}

const DAY_WIDTH = 40; // width of a day column in pixels
const ROW_HEIGHT = 50; // height of a task row in pixels
const CHART_HEADER_HEIGHT = 50;
const SIDEBAR_WIDTH = 300;

const GanttChart: React.FC<GanttChartProps> = ({ store }) => {
  const { state } = store;
  const [selectedProjectId, setSelectedProjectId] = useState<string>(state.projetos[0]?.id || '');
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { project, tasks, startDate, endDate, durationInDays } = useMemo(() => {
    const project = state.projetos.find(p => p.id === selectedProjectId);
    if (!project) return { project: null, tasks: [], startDate: new Date(), endDate: new Date(), durationInDays: 0 };
    
    const tasks = state.tarefas
        .filter(t => t.projetoId === project.id)
        .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());
        
    if (tasks.length === 0) return { project, tasks, startDate: project.dataInicio, endDate: project.dataFimPrevista, durationInDays: 0 };

    const startDates = tasks.map(t => new Date(t.dataInicio).getTime());
    const endDates = tasks.map(t => new Date(t.dataVencimento).getTime());

    const minDate = new Date(Math.min(...startDates));
    const maxDate = new Date(Math.max(...endDates));
    
    minDate.setDate(minDate.getDate() - 2); // Add padding
    maxDate.setDate(maxDate.getDate() + 2); // Add padding

    const durationInDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24));

    return { project, tasks, startDate: minDate, endDate: maxDate, durationInDays };
  }, [selectedProjectId, state.projetos, state.tarefas]);

  const daysDiff = (date1: Date, date2: Date) => {
    return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24));
  };
  
  const renderDateHeader = () => {
    const dates = [];
    for (let i = 0; i < durationInDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(
        <div key={i} className="flex-shrink-0 text-center border-r border-gray-700" style={{ width: DAY_WIDTH }}>
          <div className="text-xs text-sga-gray">{date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0,3)}</div>
          <div className="text-sm text-white font-semibold">{date.getDate()}</div>
        </div>
      );
    }
    return dates;
  };

  const getTaskPosition = (task: Tarefa) => {
      const left = daysDiff(startDate, new Date(task.dataInicio)) * DAY_WIDTH;
      const width = daysDiff(new Date(task.dataInicio), new Date(task.dataVencimento)) * DAY_WIDTH;
      return { left, width };
  };

  const getDependencyLines = () => {
    const lines = [];
    tasks.forEach((task, index) => {
      if(task.dependencias && task.dependencias.length > 0) {
        task.dependencias.forEach(depId => {
          const dependentTask = tasks.find(t => t.id === depId);
          if (dependentTask) {
            const fromTaskIndex = tasks.findIndex(t => t.id === depId);
            const {left: fromLeft, width: fromWidth} = getTaskPosition(dependentTask);

            const startX = fromLeft + fromWidth;
            const startY = (fromTaskIndex * ROW_HEIGHT) + (ROW_HEIGHT / 2);
            
            const {left: toLeft} = getTaskPosition(task);
            const endX = toLeft;
            const endY = (index * ROW_HEIGHT) + (ROW_HEIGHT / 2);

            const path = `M ${startX} ${startY} L ${startX + 15} ${startY} L ${startX + 15} ${endY} L ${endX} ${endY}`;
            
            lines.push(
                <path key={`${depId}-${task.id}`} d={path} stroke="#319795" fill="none" strokeWidth="2" markerEnd="url(#arrow)"/>
            );
          }
        });
      }
    });
    return lines;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Cronograma (Gantt)</h1>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="bg-sga-dark-light p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sga-blue text-white"
        >
          {state.projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>

      <div className="flex-1 flex overflow-auto bg-sga-dark-light rounded-lg shadow-lg">
        {/* Task List Sidebar */}
        <div className="flex-shrink-0 border-r border-gray-700 bg-sga-dark" style={{ width: SIDEBAR_WIDTH }}>
            <div className="text-white font-bold text-center py-3 border-b border-gray-700" style={{height: CHART_HEADER_HEIGHT}}>
                Tarefas
            </div>
            <div className="overflow-hidden">
                 {tasks.map(task => (
                    <div key={task.id} className="p-3 border-b border-gray-700 whitespace-nowrap overflow-hidden text-ellipsis" style={{ height: ROW_HEIGHT}}>
                        <p className="text-white text-sm">{task.nome}</p>
                        <p className="text-xs text-sga-gray">{state.recursos.find(r => r.id === task.responsavelId)?.nome || 'N/A'}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 overflow-x-auto">
          <div className="sticky top-0 bg-sga-dark-light z-10">
            <div className="flex" style={{ width: durationInDays * DAY_WIDTH, height: CHART_HEADER_HEIGHT}}>
              {renderDateHeader()}
            </div>
          </div>
          <div className="relative" style={{ width: durationInDays * DAY_WIDTH, height: tasks.length * ROW_HEIGHT }}>
            {/* Grid Lines */}
             {Array.from({ length: durationInDays }).map((_, i) => (
              <div key={i} className="absolute h-full border-r border-gray-700" style={{ left: i * DAY_WIDTH, top: 0 }}></div>
            ))}
            {Array.from({ length: tasks.length }).map((_, i) => (
              <div key={i} className="absolute w-full border-b border-gray-700" style={{ top: i * ROW_HEIGHT, left: 0 }}></div>
            ))}

            {/* Task Bars */}
            {tasks.map((task, index) => {
              const { left, width } = getTaskPosition(task);
              return (
                <div key={task.id} ref={el => (taskRefs.current[task.id] = el)} className="absolute bg-sga-blue rounded-md p-2" style={{ left, width, top: (index * ROW_HEIGHT) + 10, height: ROW_HEIGHT - 20}}>
                   <p className="text-white text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{task.nome}</p>
                </div>
              );
            })}
            
            {/* Dependency Lines */}
            <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#319795" />
                  </marker>
              </defs>
              {getDependencyLines()}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;