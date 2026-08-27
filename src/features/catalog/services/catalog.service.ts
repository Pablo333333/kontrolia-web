import api from '@/lib/api';
import { Category, WorkflowState } from '../types';

export type CatalogUser = {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  phone?: string | null;
};

export type DocumentFolder = {
  id: string;
  name: string;
  description?: string | null;
  cloudinaryPrefix?: string | null;
  _count?: { documents: number };
};

export type RepoDocument = {
  id: string;
  name: string;
  url: string;
  type?: string | null;
  version: number;
  isLatest: boolean;
  createdAt: string;
  folderId?: string | null;
  folderName?: string | null;
  ticketId?: string | null;
  ticketTitle?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
};

export type UserPreference = {
  id: string;
  userId: string;
  defaultInboxView: string;
  searchMode: string;
  preferredCategoryIds?: string | null;
  notifyEmail: boolean;
  notifyPush: boolean;
  notifyWhatsApp: boolean;
  accentColor?: string | null;
};

export const catalogService = {
  getMyPreferences: async (): Promise<UserPreference> => {
    const response = await api.get<UserPreference>('/catalog/me/preferences');
    return response.data;
  },
  updateMyPreferences: async (data: Partial<UserPreference>): Promise<UserPreference> => {
    const response = await api.patch<UserPreference>('/catalog/me/preferences', data);
    return response.data;
  },
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/catalog/categories');
    return response.data;
  },
  createCategory: async (data: { name: string; description?: string }) => {
    const response = await api.post('/catalog/categories', data);
    return response.data;
  },
  updateCategory: async (id: string, data: { name?: string; description?: string }) => {
    const response = await api.patch(`/catalog/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id: string) => {
    await api.delete(`/catalog/categories/${id}`);
  },
  getSubcategories: async () => {
    const response = await api.get('/catalog/subcategories');
    return response.data;
  },
  createSubcategory: async (data: { name: string; description?: string; categoryId: string }) => {
    const response = await api.post('/catalog/subcategories', data);
    return response.data;
  },
  updateSubcategory: async (id: string, data: { name?: string; description?: string }) => {
    const response = await api.patch(`/catalog/subcategories/${id}`, data);
    return response.data;
  },
  deleteSubcategory: async (id: string) => {
    await api.delete(`/catalog/subcategories/${id}`);
  },
  getTeamSettings: async () => {
    const response = await api.get('/catalog/team-settings');
    return response.data;
  },
  updateTeamSettings: async (data: {
    displayName?: string;
    groupIdentifier?: string;
    logoUrl?: string;
    primaryColor?: string;
  }) => {
    const response = await api.patch('/catalog/team-settings', data);
    return response.data;
  },
  getFolders: async (): Promise<DocumentFolder[]> => {
    const response = await api.get<DocumentFolder[]>('/catalog/folders');
    return response.data;
  },
  createFolder: async (data: { name: string; description?: string }) => {
    const response = await api.post('/catalog/folders', data);
    return response.data;
  },
  deleteFolder: async (id: string) => {
    await api.delete(`/catalog/folders/${id}`);
  },
  getDocuments: async (params?: {
    q?: string;
    categoryId?: string;
    folderId?: string;
  }): Promise<RepoDocument[]> => {
    const response = await api.get<RepoDocument[]>('/catalog/documents', { params });
    return response.data;
  },
  exportDocuments: async (format: 'csv' | 'pdf', params?: {
    q?: string;
    categoryId?: string;
    folderId?: string;
  }): Promise<Blob> => {
    const response = await api.get('/catalog/documents/export', {
      params: { ...params, format },
      responseType: 'blob',
    });
    return response.data;
  },
  getWorkflowStates: async (): Promise<WorkflowState[]> => {
    const response = await api.get<WorkflowState[]>('/catalog/workflow-states');
    return response.data;
  },
  getUsers: async (): Promise<CatalogUser[]> => {
    const response = await api.get<CatalogUser[]>('/catalog/users');
    return response.data;
  },
};
