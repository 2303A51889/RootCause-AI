import React, { createContext, useContext, useState, useEffect } from 'react';
import { BugAnalysis, AppNotification, UploadedFileItem } from '../types';
import { api } from '../lib/api';

interface AnalysisContextType {
  analyses: BugAnalysis[];
  notifications: AppNotification[];
  isLoadingAnalyses: boolean;
  getAnalysisById: (id: string) => BugAnalysis | undefined;
  createAnalysis: (data: {
    title: string;
    description: string;
    uploadedFiles: UploadedFileItem[];
  }) => Promise<string>;
  deleteAnalysis: (id: string) => Promise<void>;
  toggleFixRecommendation: (analysisId: string, recId: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  unreadCount: number;
  refreshAnalyses: () => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analyses, setAnalyses] = useState<BugAnalysis[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState<boolean>(true);

  const normalizeAnalysis = (analysis: any): BugAnalysis => ({
    ...analysis,
    id: analysis?.id || analysis?._id || `analysis-${Date.now()}`,
    createdAt: analysis?.createdAt || new Date().toISOString(),
    uploadedFiles: (analysis?.uploadedFiles || []).map((file: any, idx: number) => ({
      ...file,
      id: file?.id || `uf-${Date.now()}-${idx}`,
    })),
  });

  /**
   * Fetch analyses from the backend database.
   * No mock fallback — shows empty state if backend unavailable.
   */
  const refreshAnalyses = async () => {
    try {
      const res = await api.get('/analyses');
      if (res.data.analyses) {
        setAnalyses(res.data.analyses.map(normalizeAnalysis));
      }
    } catch (err) {
      console.error('[AnalysisContext] Failed to fetch analyses:', err);
    }
  };

  /**
   * Fetch notifications from the backend database.
   */
  const refreshNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('[AnalysisContext] Failed to fetch notifications:', err);
    }
  };

  // Bootstrap on mount — load from real backend
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingAnalyses(true);
      await Promise.all([refreshAnalyses(), refreshNotifications()]);
      setIsLoadingAnalyses(false);
    };
    loadData();
  }, []);

  const getAnalysisById = (id: string) => {
    return analyses.find((item) => item.id === id || (item as any)._id === id);
  };

  /**
   * createAnalysis — posts to backend, returns the new analysis ID.
   * Throws on failure; caller should handle the error.
   */
  const createAnalysis = async (data: {
    title: string;
    description: string;
    uploadedFiles: UploadedFileItem[];
  }): Promise<string> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);

    data.uploadedFiles.forEach((fileItem) => {
      if (fileItem.file) {
        formData.append('files', fileItem.file);
      }
    });

    if (data.uploadedFiles[0]?.category) {
      formData.append('category', data.uploadedFiles[0].category);
    }

    const res = await api.post('/analyses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const newAnalysis: BugAnalysis = normalizeAnalysis(res.data.analysis);
    setAnalyses((prev) => [newAnalysis, ...prev.filter((item) => item.id !== newAnalysis.id)]);
    await refreshAnalyses();
    await refreshNotifications();
    return newAnalysis.id;
  };

  const deleteAnalysis = async (id: string) => {
    // Optimistic update
    setAnalyses((prev) => prev.filter((item) => item.id !== id));
    try {
      await api.delete(`/analyses/${id}`);
    } catch (err) {
      // Rollback not implemented — re-fetch to restore consistent state
      await refreshAnalyses();
    }
  };

  const toggleFixRecommendation = async (analysisId: string, recId: string) => {
    // Optimistic update
    setAnalyses((prev) =>
      prev.map((item) => {
        if (item.id === analysisId) {
          return {
            ...item,
            fixRecommendations: item.fixRecommendations.map((rec) =>
              rec.id === recId ? { ...rec, completed: !rec.completed } : rec,
            ),
          };
        }
        return item;
      }),
    );
    try {
      await api.patch(`/analyses/${analysisId}/checklist/${recId}`);
    } catch (err) {
      // Re-fetch to restore consistent state on failure
      await refreshAnalyses();
    }
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {
      console.error('[AnalysisContext] Failed to mark notification read:', err);
    }
  };

  const clearAllNotifications = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.patch('/notifications/read-all');
    } catch (err) {
      console.error('[AnalysisContext] Failed to clear notifications:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnalysisContext.Provider
      value={{
        analyses,
        notifications,
        isLoadingAnalyses,
        getAnalysisById,
        createAnalysis,
        deleteAnalysis,
        toggleFixRecommendation,
        markNotificationAsRead,
        clearAllNotifications,
        unreadCount,
        refreshAnalyses,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};
