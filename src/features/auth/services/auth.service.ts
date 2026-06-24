import api from '@/lib/api';
import { LoginDto, AuthResponse } from '../types';

export const authService = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
};
