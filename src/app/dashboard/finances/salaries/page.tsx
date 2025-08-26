'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalaryModal } from '@/components/forms/salary-modal';
import { Badge } from '@/components/ui/badge';
import { apiHelper } from '@/lib/apiHelper';

interface Salary {
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

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function SalariesPage() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: '',
    teacher_id: ''
  });
  const [statistics, setStatistics] = useState({
    total_pending: 0,
    total_paid: 0,
    count_pending: 0,
    count_paid: 0,
    monthly_total: 0
  });

  useEffect(() => {
    loadSalaries();
    loadStatistics();
  }, [filters]);

  const loadSalaries = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;
      if (filters.status) params.status = filters.status;
      if (filters.teacher_id) params.teacher_id = filters.teacher_id;

      const data = await apiHelper.get('/salaries', params);
      setSalaries(data);
    } catch (error) {
      console.error('Erro ao carregar salários:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const params: Record<string, any> = {};
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;

      const data = await apiHelper.get('/salaries/statistics', params);
      setStatistics(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (selectedSalary) {
        await apiHelper.put(`/salaries/${selectedSalary.id}`, { salary: data });
      } else {
        await apiHelper.post('/salaries', { salary: data });
      }

      loadSalaries();
      loadStatistics();
      setShowModal(false);
      setSelectedSalary(null);
    } catch (error) {
      console.error('Erro ao salvar salário:', error);
    }
  };

  const handlePay = async (salary: Salary) => {
    try {
      await apiHelper.put(`/salaries/${salary.id}/pay`);
      loadSalaries();
      loadStatistics();
    } catch (error) {
      console.error('Erro ao pagar salário:', error);
    }
  };

  const handleGeneratePix = async (salary: Salary) => {
    try {
      const result = await apiHelper.post(`/salaries/${salary.id}/generate_cora_pix`);
      
      if (result.success) {
        // Show PIX data to user
        alert(`PIX gerado com sucesso!\n\nCódigo PIX: ${result.pix_data.qr_code}\nValor: R$ ${result.pix_data.amount}\nDestinatário: ${result.pix_data.recipient}`);
        loadSalaries();
        loadStatistics();
      } else {
        alert(`Erro: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Erro ao gerar PIX:', error);
      alert('Erro ao gerar PIX do salário');
    }
  };

  const handleBulkGenerate = async () => {
    try {
      const result = await apiHelper.post('/salaries/bulk_generate', {
        month: filters.month,
        year: filters.year
      });

      alert(result.message);
      loadSalaries();
      loadStatistics();
    } catch (error) {
      console.error('Erro ao gerar salários:', error);
    }
  };

  const handleEdit = (salary: Salary) => {
    setSelectedSalary(salary);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente excluir este salário?')) {
      try {
        await apiHelper.delete(`/salaries/${id}`);
        loadSalaries();
        loadStatistics();
      } catch (error) {
        console.error('Erro ao excluir salário:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800'
    };

    const labels = {
      pending: 'Pendente',
      paid: 'Pago'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const formatCurrency = (value: any) => {
    const numValue = parseFloat(value?.toString()) || 0;
    return numValue.toLocaleString('pt-BR');
  };

  const calculateTotal = (salary: Salary) => {
    const amount = parseFloat(salary.amount.toString()) || 0;
    const bonus = parseFloat((salary.bonus || 0).toString()) || 0;
    const deductions = parseFloat((salary.deductions || 0).toString()) || 0;
    return amount + bonus - deductions;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestão de Salários</h1>
        <div className="flex gap-2">
          <Button onClick={handleBulkGenerate} variant="outline">
            Gerar Folha do Mês
          </Button>
          <Button onClick={() => setShowModal(true)}>
            Novo Salário
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {formatCurrency(statistics.total_pending)}
            </div>
            <p className="text-xs text-gray-500">{statistics.count_pending} salários</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {formatCurrency(statistics.total_paid)}
            </div>
            <p className="text-xs text-gray-500">{statistics.count_paid} salários</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {formatCurrency(statistics.monthly_total)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mês</label>
              <select
                value={filters.month}
                onChange={(e) => setFilters(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {months.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ano</label>
              <Input
                type="number"
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                min="2020"
                max="2030"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Salários */}
      <Card>
        <CardHeader>
          <CardTitle>Salários - {months[filters.month - 1]} {filters.year}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Professor</th>
                    <th className="px-4 py-3 text-left">Valor Base</th>
                    <th className="px-4 py-3 text-left">Bônus</th>
                    <th className="px-4 py-3 text-left">Descontos</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {salaries.map((salary) => (
                    <tr key={salary.id} className="border-b">
                      <td className="px-4 py-3">{salary.teacher.user.name}</td>
                      <td className="px-4 py-3">R$ {formatCurrency(salary.amount)}</td>
                      <td className="px-4 py-3">R$ {formatCurrency(salary.bonus || 0)}</td>
                      <td className="px-4 py-3">R$ {formatCurrency(salary.deductions || 0)}</td>
                      <td className="px-4 py-3 font-bold">R$ {formatCurrency(calculateTotal(salary))}</td>
                      <td className="px-4 py-3">{getStatusBadge(salary.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEdit(salary)}>
                            Editar
                          </Button>
                          {salary.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => handlePay(salary)} variant="outline">
                                Pagar
                              </Button>
                              <Button size="sm" onClick={() => handleGeneratePix(salary)} className="bg-purple-600 hover:bg-purple-700 text-white">
                                PIX
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(salary.id)}>
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <SalaryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedSalary(null);
        }}
        onSave={handleSave}
        salary={selectedSalary}
      />
    </div>
  );
}