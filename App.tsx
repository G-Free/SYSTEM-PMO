import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjetoList from './components/projetos/ProjetoList';
import KanbanBoard from './components/tarefas/KanbanBoard';
import RecursoList from './components/recursos/RecursoList';
import RiscoList from './components/riscos/RiscoList';
import { usePmoStore } from './services/pmoService';
import NotificationPanel from './components/NotificationPanel';
import PortfolioView from './components/portfolio/PortfolioView';
import GanttChart from './components/gantt/GanttChart';
import RelatorioView from './components/relatorios/RelatorioView';
import RoadmapView from './components/roadmap/RoadmapView';
import Login from './components/Login';
import { StatusProjeto, User } from './types';

type View = 'dashboard' | 'projects' | 'tasks' | 'resources' | 'risks' | 'portfolio' | 'gantt' | 'reports' | 'roadmap';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  
  // Lifted state for Project Filtering to allow Dashboard interaction
  const [projectFilter, setProjectFilter] = useState<StatusProjeto | 'Todos'>('Todos');

  const { state, actions } = usePmoStore();

  useEffect(() => {
    if (user) {
        actions.checkNotifications();
        // Temporary hack to make user available to PermissionGate without Context provider
        (window as any).currentUser = user;
    } else {
        (window as any).currentUser = null;
    }
  }, [state.tarefas, actions, user]);

  const handleDashboardProjectClick = (status: StatusProjeto) => {
      setProjectFilter(status);
      setCurrentView('projects');
  };

  const handleRecentProjectClick = (projectId: string) => {
      actions.setSelectedProject(projectId);
      setProjectFilter('Todos'); // Reset filter to ensure project is visible in list
      setCurrentView('projects');
  }

  const handleLoginSuccess = (loggedInUser: User) => {
      setUser(loggedInUser);
  };

  const handleLogout = () => {
      setUser(null);
      setCurrentView('dashboard');
  };

  const recentProjects = useMemo(() => {
      return state.recentProjectIds
        .map(id => state.projetos.find(p => p.id === id))
        .filter((p): p is NonNullable<typeof p> => !!p);
  }, [state.recentProjectIds, state.projetos]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard store={{ state, actions }} onNavigateToProjects={handleDashboardProjectClick} />;
      case 'projects':
        return <ProjetoList store={{ state, actions }} filterStatus={projectFilter} setFilterStatus={setProjectFilter} />;
      case 'tasks':
        return <KanbanBoard store={{ state, actions }} />;
      case 'resources':
        return <RecursoList store={{ state, actions }} />;
      case 'risks':
        return <RiscoList store={{ state, actions }} />;
      case 'portfolio':
        return <PortfolioView store={{ state, actions }} />;
      case 'gantt':
        return <GanttChart store={{ state, actions }} />;
      case 'reports':
        return <RelatorioView store={{ state, actions }} />;
      case 'roadmap':
        return <RoadmapView store={{ state, actions }} />;
      default:
        return <Dashboard store={{ state, actions }} onNavigateToProjects={handleDashboardProjectClick} />;
    }
  };

  if (!user) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-sga-dark font-sans overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        notificationCount={state.notifications.length}
        onToggleNotifications={() => setNotificationsOpen(!isNotificationsOpen)}
        user={user}
        onLogout={handleLogout}
        recentProjects={recentProjects}
        onProjectClick={handleRecentProjectClick}
        />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative custom-scrollbar">
        {renderView()}
        <NotificationPanel
            isOpen={isNotificationsOpen}
            onClose={() => setNotificationsOpen(false)}
        />
      </main>
    </div>
  );
};

export default App;