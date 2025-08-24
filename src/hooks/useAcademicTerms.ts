import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicTermApi } from '@/lib/api';
import type { AcademicTerm } from '@/types';
import toast from 'react-hot-toast';

export const useAcademicTerms = () => {
  const query = useQuery({
    queryKey: ['academic-terms'],
    queryFn: () => academicTermApi.getAll().then(res => res.data),
  });
  
  return {
    ...query,
    refetch: query.refetch,
  };
};

export const useAcademicTerm = (id: number) => {
  return useQuery({
    queryKey: ['academic-term', id],
    queryFn: () => academicTermApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreateAcademicTerm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<AcademicTerm>) => academicTermApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-terms'] });
      toast.success('Etapa criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao criar etapa');
    },
  });
};

export const useUpdateAcademicTerm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AcademicTerm> }) =>
      academicTermApi.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['academic-terms'] });
      queryClient.invalidateQueries({ queryKey: ['academic-term', id] });
      toast.success('Etapa atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao atualizar etapa');
    },
  });
};

export const useDeleteAcademicTerm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => academicTermApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-terms'] });
      toast.success('Etapa excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao excluir etapa');
    },
  });
};

export const useSetActiveAcademicTerm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => academicTermApi.setActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-terms'] });
      toast.success('Etapa ativada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao ativar etapa');
    },
  });
};