'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface Salary {
  id: number;
  teacher: {
    id: number;
    user: {
      name: string;
    };
  };
  amount: number;
  month: number;
  year: number;
  bonus: number;
  deductions: number;
  status: 'pending' | 'paid';
  payment_date?: string;
}

export interface SalaryStatistics {
  total_pending: number;
  total_paid: number;
  count_pending: number;
  count_paid: number;
  monthly_total: number;
}

export function useSalaries() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [statistics, setStatistics] = useState<SalaryStatistics>({
    total_pending: 0,
    total_paid: 0,
    count_pending: 0,
    count_paid: 0,
    monthly_total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSalaries = async (params: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/salaries', { params });
      setSalaries(response.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar salários');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async (params: any = {}) => {
    try {
      const response = await api.get('/salaries/statistics', { params });
      setStatistics(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const createSalary = async (data: Partial<Salary>) => {
    try {
      setLoading(true);
      const response = await api.post('/salaries', { salary: data });
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar salário');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSalary = async (id: number, data: Partial<Salary>) => {
    try {
      setLoading(true);
      const response = await api.put(`/salaries/${id}`, { salary: data });
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar salário');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const paySalary = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.put(`/salaries/${id}/pay`);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Erro ao pagar salário');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSalary = async (id: number) => {
    try {
      setLoading(true);
      await api.delete(`/salaries/${id}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir salário');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkGenerateSalaries = async (month: number, year: number) => {
    try {
      setLoading(true);
      const response = await api.post('/salaries/bulk_generate', { month, year });
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar salários');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    salaries,
    statistics,
    loading,
    error,
    fetchSalaries,
    fetchStatistics,
    createSalary,
    updateSalary,
    paySalary,
    deleteSalary,
    bulkGenerateSalaries
  };
}