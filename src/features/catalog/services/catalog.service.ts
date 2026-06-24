import api from '@/lib/api';
import { Category, WorkflowState } from '../types';

export const catalogService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/catalog/categories');
    return response.data;
  },
  getWorkflowStates: async (): Promise<WorkflowState[]> => {
    const response = await api.get<WorkflowState[]>('/catalog/workflow-states');
    return response.data;
  },
};
