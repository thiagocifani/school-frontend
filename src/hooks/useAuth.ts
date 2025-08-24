import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import type { LoginRequest, User } from '@/types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');
      
      const response = await authApi.validateToken();
      return response.data.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      queryClient.setQueryData(['auth'], user);
      toast.success(`Bem-vindo, ${user.name}!`);
      
      // Redirecionar baseado no papel do usuário
      if (user.role === 'teacher') {
        router.push('/teacher-dashboard');
      } else if (user.role === 'guardian') {
        router.push('/guardian-dashboard');
      } else {
        router.push('/dashboard');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao fazer login');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      localStorage.removeItem('token');
      queryClient.setQueryData(['auth'], null);
      queryClient.clear();
      router.push('/login');
      toast.success('Logout realizado com sucesso');
    },
    onError: () => {
      // Even if the API call fails, we still want to logout locally
      localStorage.removeItem('token');
      queryClient.setQueryData(['auth'], null);
      queryClient.clear();
      router.push('/login');
    },
  });

  const login = (data: LoginRequest) => {
    loginMutation.mutate(data);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    loading: isLoading,
    isAuthenticated: !!user && !error,
    login,
    logout,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};