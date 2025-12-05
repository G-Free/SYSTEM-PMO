
import React from 'react';
import { User, Projeto } from '../types';
import { SgaLogo } from './icons/SgaLogo';
import { hasPermission, Permission } from '../services/permissionService';

type View = 'dashboard' | 'projects' | 'tasks' | 'resources' | 'risks' | 'portfolio' | 'gantt' | 'reports' | 'roadmap';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  notificationCount: number;
  onToggleNotifications: () => void;
  user: User;
  onLogout: () => void;
  recentProjects?: Projeto[];
  onProjectClick?: (projectId: string) => void;
}

const NavItem: React.FC<{
  view: View;
  currentView: View;
  setView: (view: View) => void;
  icon: React.ReactElement;
  label: string;
}> = ({ view, currentView, setView, icon, label }) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => setView(view)}
      className={`relative flex items-center w-full px-4 py-3 text-left transition-all duration-300 border-l-4 group ${
        isActive
          ? 'border-sga-accent bg-slate-800/50 text-white'
          : 'border-transparent text-sga-text hover:bg-slate-800/30 hover:text-white hover:border-sga-brand/50'
      }`}
    >
      {React.cloneElement(icon, { 
          className: `w-5 h-5 mr-3 transition-colors duration-300 ${isActive ? 'text-sga-accent' : 'text-slate-500 group-hover:text-sga-brand'}`
      })}
      <span className="hidden md:inline font-medium text-sm tracking-wide">{label}</span>
      
      {/* Glow effect on active */}
      {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-sga-accent/10 to-transparent pointer-events-none"></div>
      )}
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, notificationCount, onToggleNotifications, user, onLogout, recentProjects = [], onProjectClick }) => {
  
  const canViewDashboard = hasPermission(user, Permission.VIEW_DASHBOARD);
  const canViewPortfolio = hasPermission(user, Permission.VIEW_PORTFOLIO);
  const canViewRoadmap = hasPermission(user, Permission.VIEW_ROADMAP);
  const canViewProjects = hasPermission(user, Permission.VIEW_PROJECTS);
  const canViewGantt = hasPermission(user, Permission.VIEW_GANTT);
  const canViewTasks = hasPermission(user, Permission.VIEW_TASKS);
  const canViewResources = hasPermission(user, Permission.VIEW_RESOURCES);
  const canViewRisks = hasPermission(user, Permission.VIEW_RISKS);
  const canViewReports = hasPermission(user, Permission.VIEW_REPORTS);

  return (
    <aside className="w-16 md:w-64 bg-sidebar-gradient border-r border-sga-border flex flex-col shadow-2xl h-screen z-20">
      {/* Header / Logo */}
      <div className="flex items-center space-x-3 p-6 border-b border-sga-border/50 bg-slate-900/50 backdrop-blur-sm">
         <div className="bg-white p-1.5 rounded-lg shadow-lg shadow-sga-brand/20">
        <img src="/components/conteudo/imagem/Sga.png" alt="" srcset="" />
         </div>
        <div className="hidden md:block">
            <h1 className="text-lg font-bold text-white tracking-wider leading-none">SGA</h1>
            <span className="text-[10px] text-sga-accent uppercase tracking-[0.2em] font-bold">System PMO</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col mt-4 overflow-y-auto custom-scrollbar">
        {canViewDashboard && (
          <NavItem
            view="dashboard"
            currentView={currentView}
            setView={setView}
            label="Visão Geral"
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>}
          />
        )}
        
        {canViewPortfolio && (
          <NavItem
            view="portfolio"
            currentView={currentView}
            setView={setView}
            label="Portfólio Estratégico"
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>}
          />
        )}

        {canViewRoadmap && (
          <NavItem
            view="roadmap"
            currentView={currentView}
            setView={setView}
            label="Roadmap Anual"
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
          />
        )}

        <div className="pt-6 pb-2 px-6">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:block border-b border-slate-700/50 pb-1">Gestão Operacional</p>
            <div className="h-px bg-slate-700/50 md:hidden"></div>
        </div>
        
        {canViewProjects && (
          <NavItem
            view="projects"
            currentView={currentView}
            setView={setView}
            label="Projetos"
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>}
          />
        )}

        {canViewGantt && (
          <NavItem
            view="gantt"
            currentView={currentView}
            setView={setView}
            label="Cronograma (Gantt)"
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>}
          />
        )}
        
        {canViewTasks && (
          <NavItem
            view="tasks"
            currentView={currentView}
            setView={setView}
            label="Tarefas (Kanban)"
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>}
          />
        )}
        
        {canViewResources && (
          <NavItem
            view="resources"
            currentView={currentView}
            setView={setView}
            label="Recursos Humanos"
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
          />
        )}

        {canViewRisks && (
          <NavItem
              view="risks"
              currentView={currentView}
              setView={setView}
              label="Gestão de Riscos"
              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
          />
        )}

        {canViewReports && (
          <>
            <div className="pt-6 pb-2 px-6">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:block border-b border-slate-700/50 pb-1">Inteligência</p>
                <div className="h-px bg-slate-700/50 md:hidden"></div>
            </div>
            <NavItem
              view="reports"
              currentView={currentView}
              setView={setView}
              label="Relatórios"
              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12l5-5 5 5 5-5 7 7"></path></svg>}
            />
          </>
        )}

        {recentProjects.length > 0 && canViewProjects && (
            <>
                <div className="pt-6 pb-2 px-6">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:block border-b border-slate-700/50 pb-1">Acesso Rápido</p>
                </div>
                <div className="space-y-0.5 hidden md:block px-2">
                    {recentProjects.map(proj => (
                        <button
                            key={proj.id}
                            onClick={() => onProjectClick && onProjectClick(proj.id)}
                            className="flex items-center w-full px-4 py-2 text-left text-xs text-sga-text hover:text-white hover:bg-slate-800/50 rounded-md transition-colors group"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-sga-brand mr-2 group-hover:bg-sga-accent group-hover:scale-125 transition-all"></span>
                            <span className="truncate opacity-80 group-hover:opacity-100">{proj.nome}</span>
                        </button>
                    ))}
                </div>
            </>
        )}
      </nav>

       {/* Notifications & User Profile */}
       <div className="mt-auto bg-slate-900 border-t border-sga-border/50">
        <button
          onClick={onToggleNotifications}
          className="flex items-center w-full px-6 py-4 text-left transition-colors duration-200 text-sga-text hover:bg-slate-800 hover:text-white relative group"
        >
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3 group-hover:text-sga-accent transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            {notificationCount > 0 && (
                <span className="absolute -top-1 -right-0.5 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-slate-900"></span>
            )}
          </div>
          <span className="hidden md:inline text-sm font-medium">Notificações</span>
          {notificationCount > 0 && (
            <span className="ml-auto bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-500/30 hidden md:inline-block">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="px-6 py-4 border-t border-sga-border/50 flex items-center justify-between group bg-slate-950">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-sga-gradient flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-sga-brand/30 ring-2 ring-slate-800">
                    {user.avatarInitials}
                </div>
                <div className="hidden md:block overflow-hidden">
                    <p className="text-sm font-semibold text-white truncate leading-tight">{user.name}</p>
                    <p className="text-[10px] text-sga-text truncate uppercase tracking-wide">{user.role}</p>
                </div>
            </div>
            <button 
                onClick={onLogout}
                className="text-slate-500 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors hidden md:block"
                title="Sair"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
