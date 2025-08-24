'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface Tuition {
  id: number;
  student: {
    id: number;
    name: string;
    school_class?: {
      name: string;
    };
  };
  amount: number;
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: string;
  discount: number;
  late_fee: number;
  observation?: string;
}

export interface TuitionStatistics {
  total_pending: number;
  total_paid: number;
  total_overdue: number;
  count_pending: number;
  count_paid: number;
  count_overdue: number;
  monthly_total: number;
}

export interface PaymentData {
  payment_method: string;
  discount?: number;
  late_fee?: number;
  paid_date?: string;
}

export function useTuitions() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [statistics, setStatistics] = useState<TuitionStatistics>({
    total_pending: 0,
    total_paid: 0,
    total_overdue: 0,
    count_pending: 0,
    count_paid: 0,
    count_overdue: 0,
    monthly_total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTuitions = async (params: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tuitions', { params });
      setTuitions(response.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar mensalidades');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async (params: any = {}) => {
    try {
      const response = await api.get('/tuitions/statistics', { params });
      setStatistics(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const fetchOverdueReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tuitions/overdue_report');
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar relatório de atrasos');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTuition = async (data: Partial<Tuition>) => {
    try {
      setLoading(true);
      const response = await api.post('/tuitions', { tuition: data });
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar mensalidade');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTuition = async (id: number, data: Partial<Tuition>) => {
    try {
      setLoading(true);
      const response = await api.put(`/tuitions/${id}`, { tuition: data });
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar mensalidade');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const payTuition = async (id: number, paymentData: PaymentData) => {
    try {
      setLoading(true);
      const response = await api.put(`/tuitions/${id}/pay`, paymentData);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Erro ao pagar mensalidade');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTuition = async (id: number) => {
    try {
      setLoading(true);
      await api.delete(`/tuitions/${id}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir mensalidade');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkGenerateTuitions = async (month: number, year: number, amount: number) => {
    try {
      setLoading(true);
      const response = await api.post('/tuitions/bulk_generate', { month, year, amount });
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar mensalidades');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    tuitions,
    statistics,
    loading,
    error,
    fetchTuitions,
    fetchStatistics,
    fetchOverdueReport,
    createTuition,
    updateTuition,
    payTuition,
    deleteTuition,
    bulkGenerateTuitions
  };
}