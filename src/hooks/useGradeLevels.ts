import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gradeLevelApi } from '@/lib/api';
import type { GradeLevel } from '@/types';
import toast from 'react-hot-toast';

export const useGradeLevels = (params?: any) => {
  const query = useQuery({
    queryKey: ['grade-levels', params],
    queryFn: () => gradeLevelApi.getAll(params).then(res => res.data),
  });
  
  return {
    ...query,
    refetch: query.refetch,
  };
};

export const useGradeLevel = (id: number) => {
  return useQuery({
    queryKey: ['grade-level', id],
    queryFn: () => gradeLevelApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreateGradeLevel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<GradeLevel>) => gradeLevelApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-levels'] });
      toast.success('Série criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao criar série');
    },
  });
};

export const useUpdateGradeLevel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GradeLevel> }) =>
      gradeLevelApi.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['grade-levels'] });
      queryClient.invalidateQueries({ queryKey: ['grade-level', id] });
      toast.success('Série atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao atualizar série');
    },
  });
};

export const useDeleteGradeLevel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => gradeLevelApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-levels'] });
      toast.success('Série excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao excluir série');
    },
  });
};