import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/lib/api';
import type { FinancialDashboard, Tuition, Salary, FinancialAccount } from '@/types';
import toast from 'react-hot-toast';

export const useFinancialDashboard = (month?: string) => {
  return useQuery({
    queryKey: ['financial-dashboard', month],
    queryFn: () => financeApi.getDashboard(month).then(res => res.data),
  });
};

export const useTuitions = (params?: any) => {
  return useQuery({
    queryKey: ['tuitions', params],
    queryFn: () => financeApi.getTuitions(params).then(res => res.data),
  });
};

export const useUpdateTuition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Tuition> }) =>
      financeApi.updateTuition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuitions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
      toast.success('Mensalidade atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao atualizar mensalidade');
    },
  });
};

export const useSalaries = (params?: any) => {
  return useQuery({
    queryKey: ['salaries', params],
    queryFn: () => financeApi.getSalaries(params).then(res => res.data),
  });
};

export const useUpdateSalary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Salary> }) =>
      financeApi.updateSalary(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
      toast.success('Salário atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao atualizar salário');
    },
  });
};

export const useFinancialAccounts = (params?: any) => {
  return useQuery({
    queryKey: ['financial-accounts', params],
    queryFn: () => financeApi.getFinancialAccounts(params).then(res => res.data),
  });
};

export const useCreateFinancialAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<FinancialAccount>) => financeApi.createFinancialAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
      toast.success('Conta financeira criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Erro ao criar conta financeira');
    },
  });
};

export const useFinancialReports = (params: any) => {
  return useQuery({
    queryKey: ['financial-reports', params],
    queryFn: () => financeApi.getReports(params).then(res => res.data),
    enabled: !!(params.start_date && params.end_date),
  });
};