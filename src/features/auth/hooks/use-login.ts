import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { LoginDto } from '../types';
import { useRouter } from 'next/navigation';

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: (data) => {
      // Guardar token en localStorage para persistencia en el cliente y axios
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Guardar token en cookie para que el Middleware pueda leerlo
      document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
      
      router.push('/');
    },
  });
};
