import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: catalogService.getCategories,
    staleTime: 60_000,
  });
};

export const useWorkflowStates = () => {
  return useQuery({
    queryKey: ['workflow-states'],
    queryFn: catalogService.getWorkflowStates,
    staleTime: 60_000,
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['catalog-users'],
    queryFn: catalogService.getUsers,
    staleTime: 60_000,
  });
};

export const useTeamSettings = () => {
  return useQuery({
    queryKey: ['team-settings'],
    queryFn: catalogService.getTeamSettings,
    staleTime: 30_000,
  });
};

export const useDocumentFolders = () => {
  return useQuery({
    queryKey: ['document-folders'],
    queryFn: catalogService.getFolders,
  });
};

export const useRepoDocuments = (params?: { q?: string; categoryId?: string; folderId?: string }) => {
  return useQuery({
    queryKey: ['repo-documents', params ?? {}],
    queryFn: () => catalogService.getDocuments(params),
    staleTime: 20_000,
  });
};

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: catalogService.createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
};

export const useCreateSubcategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: catalogService.createSubcategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
};

export const useUpdateTeamSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: catalogService.updateTeamSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team-settings'] }),
  });
};

export const useCreateFolder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: catalogService.createFolder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['document-folders'] }),
  });
};

export const useMyPreferences = () => {
  return useQuery({
    queryKey: ['my-preferences'],
    queryFn: catalogService.getMyPreferences,
    staleTime: 30_000,
  });
};

export const useUpdateMyPreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: catalogService.updateMyPreferences,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-preferences'] }),
  });
};
