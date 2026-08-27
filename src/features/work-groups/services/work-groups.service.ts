import api from '@/lib/api';

export type WorkGroupMember = {
  id: string;
  roleInGroup: string;
  user: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
    phone?: string | null;
  };
};

export type WorkGroupTopic = {
  id: string;
  category: { id: string; name: string; description?: string | null };
};

export type WorkGroup = {
  id: string;
  name: string;
  identifier: string;
  description?: string | null;
  logoUrl?: string | null;
  primaryColor: string;
  isActive: boolean;
  members: WorkGroupMember[];
  topics: WorkGroupTopic[];
  _count?: { tickets: number; members: number };
};

export type CreateWorkGroupDto = {
  name: string;
  identifier: string;
  description?: string;
  primaryColor?: string;
};

export const workGroupsService = {
  list: async (): Promise<WorkGroup[]> => {
    const { data } = await api.get<WorkGroup[]>('/work-groups');
    return data;
  },
  getActive: async (): Promise<WorkGroup | null> => {
    const { data } = await api.get<WorkGroup | null>('/work-groups/active');
    return data;
  },
  create: async (payload: CreateWorkGroupDto): Promise<WorkGroup> => {
    const { data } = await api.post<WorkGroup>('/work-groups', payload);
    return data;
  },
  addMember: async (groupId: string, userId: string, roleInGroup = 'MEMBER') => {
    const { data } = await api.post(`/work-groups/${groupId}/members`, { userId, roleInGroup });
    return data;
  },
  removeMember: async (groupId: string, userId: string) => {
    await api.delete(`/work-groups/${groupId}/members/${userId}`);
  },
  assignTopics: async (groupId: string, categoryIds: string[]) => {
    const { data } = await api.post<WorkGroup>(`/work-groups/${groupId}/topics`, { categoryIds });
    return data;
  },
  setActive: async (workGroupId: string) => {
    const { data } = await api.post<WorkGroup>('/work-groups/active', { workGroupId });
    return data;
  },
  updateContact: async (phone: string) => {
    const { data } = await api.patch('/work-groups/me/contact', { phone });
    return data;
  },
  runDigest: async () => {
    const { data } = await api.post('/work-groups/digest/run');
    return data;
  },
};
