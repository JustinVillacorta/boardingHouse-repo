import { useState, useEffect, useCallback } from 'react';
import { NotificationsService } from '../../application/services/NotificationsService';
import { NotificationsRepositoryImpl } from '../../infrastructure/repositories/NotificationsRepositoryImpl';
import type { Notification } from '../../domain/entities/Notification';

// Create service instance
const notificationsRepository = new NotificationsRepositoryImpl();
const notificationsService = new NotificationsService(notificationsRepository);

interface UseNotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export const useNotifications = () => {
  const [state, setState] = useState<UseNotificationsState>({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [notifications, unreadCount] = await Promise.all([
        notificationsService.getNotifications(),
        notificationsService.getUnreadCount()
      ]);
      
      setState(prev => ({
        ...prev,
        notifications,
        unreadCount,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load notifications';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification => ({
          ...notification,
          isRead: true
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loading,
    error: state.error,
    
    // Actions
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
    clearError: () => setError(null),
  };
};
