
import React from 'react';
import { usePmoStore } from '../services/pmoService';
import { Notification, NotificationType } from '../types';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
    const baseClasses = "w-6 h-6 mr-3 flex-shrink-0";
    switch (type) {
        case NotificationType.Warning:
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} text-yellow-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
        case NotificationType.Error:
             return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} text-red-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
        default:
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} text-blue-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
    }
}

const NotificationItem: React.FC<{ notification: Notification; onDismiss: (id: string) => void; }> = ({ notification, onDismiss }) => (
    <div className="bg-sga-dark p-3 rounded-lg flex items-start justify-between">
        <div className="flex items-start">
            <NotificationIcon type={notification.type} />
            <div>
                <p className="text-white text-sm">{notification.message}</p>
                <p className="text-sga-gray text-xs mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
            </div>
        </div>
        <button onClick={() => onDismiss(notification.id)} className="text-sga-gray hover:text-white pl-2">&times;</button>
    </div>
);


const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
    const { state, actions } = usePmoStore();

    if (!isOpen) {
        return null;
    }

    return (
        <div className="absolute top-0 right-0 mt-4 sm:mt-6 lg:mt-8 mr-4 sm:mr-6 lg:mr-8 w-80 sm:w-96 bg-sga-dark-light rounded-lg shadow-2xl z-50 border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Notificações</h3>
                <button onClick={onClose} className="text-sga-gray hover:text-white text-2xl">&times;</button>
            </div>
            {state.notifications.length > 0 ? (
                <>
                    <div className="p-2 sm:p-4 space-y-3 max-h-96 overflow-y-auto">
                        {state.notifications.map(notif => (
                            <NotificationItem key={notif.id} notification={notif} onDismiss={actions.removeNotification} />
                        ))}
                    </div>
                    <div className="p-2 border-t border-gray-700 text-center">
                         <button onClick={actions.clearNotifications} className="text-sga-blue text-sm hover:underline">Limpar Todas</button>
                    </div>
                </>
            ) : (
                <div className="p-10 text-center">
                    <p className="text-sga-gray">Nenhuma notificação nova.</p>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
