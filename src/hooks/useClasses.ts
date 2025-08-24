import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classApi } from '@/lib/api';
import type { SchoolClass } from '@/types';
import toast from 'react-hot-toast';

export const useClasses = (params?: any) => {
  const query = useQuery({
    queryKey: ['classes', params],
    queryFn: () => classApi.getAll(params).then(res => res.data),
  });
  
  return {
    ...query,
    refetch: query.refetch,
  };
};

export const useClass = (id: number) => {
  return useQuery({
    queryKey: ['class', id],
    queryFn: () => classApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<SchoolClass>) => classApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Turma criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao criar turma');
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SchoolClass> }) =>
      classApi.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class', id] });
      toast.success('Turma atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao atualizar turma');
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => classApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Turma excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao excluir turma');
    },
  });
};