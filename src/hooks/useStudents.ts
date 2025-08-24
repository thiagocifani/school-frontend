import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api';
import type { Student } from '@/types';
import toast from 'react-hot-toast';

export const useStudents = (params?: any) => {
  const query = useQuery({
    queryKey: ['students', params],
    queryFn: () => studentApi.getAll(params).then(res => res.data),
  });
  
  return {
    ...query,
    refetch: query.refetch,
  };
};

export const useStudent = (id: number) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => studentApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Student>) => studentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Aluno criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao criar aluno');
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Student> }) =>
      studentApi.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      toast.success('Aluno atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao atualizar aluno');
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => studentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Aluno excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao excluir aluno');
    },
  });
};