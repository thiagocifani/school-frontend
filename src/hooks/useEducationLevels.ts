import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { educationLevelApi } from '@/lib/api';
import type { EducationLevel } from '@/types';
import toast from 'react-hot-toast';

export const useEducationLevels = () => {
  const query = useQuery({
    queryKey: ['education-levels'],
    queryFn: () => educationLevelApi.getAll().then(res => res.data),
  });
  
  return {
    ...query,
    refetch: query.refetch,
  };
};

export const useEducationLevel = (id: number) => {
  return useQuery({
    queryKey: ['education-level', id],
    queryFn: () => educationLevelApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreateEducationLevel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<EducationLevel>) => educationLevelApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-levels'] });
      toast.success('Nível de ensino criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao criar nível de ensino');
    },
  });
};

export const useUpdateEducationLevel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EducationLevel> }) =>
      educationLevelApi.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['education-levels'] });
      queryClient.invalidateQueries({ queryKey: ['education-level', id] });
      toast.success('Nível de ensino atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao atualizar nível de ensino');
    },
  });
};

export const useDeleteEducationLevel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => educationLevelApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-levels'] });
      toast.success('Nível de ensino excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao excluir nível de ensino');
    },
  });
};