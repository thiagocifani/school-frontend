'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  DollarSign,
  Calendar,
  TrendingUp,
  Download,
  Eye
} from 'lucide-react';

interface TeacherSalary {
  id: number;
  month: number;
  year: number;
  amount: number;
  bonus: number;
  deductions: number;
  netAmount: number;
  paymentDate?: string;
  status: 'pending' | 'paid';
  payslipUrl?: string;
}

export default function TeacherSalariesPage() {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState<TeacherSalary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadSalaries();
  }, [selectedYear]);

  const loadSalaries = async () => {
    try {
      setLoading(true);
      
      // Dados simulados - no backend, buscar pelos salários do professor logado
      const mockSalaries: TeacherSalary[] = [
        {
          id: 1,
          month: 1,
          year: 2024,
          amount: 4500.00,
          bonus: 200.00,
          deductions: 450.00,
          netAmount: 4250.00,
          paymentDate: '2024-01-05',
          status: 'paid'
        },
        {
          id: 2,
          month: 2,
          year: 2024,
          amount: 4500.00,
          bonus: 0.00,
          deductions: 450.00,
          netAmount: 4050.00,
          paymentDate: '2024-02-05',
          status: 'paid'
        },
        {
          id: 3,
          month: 3,
          year: 2024,
          amount: 4500.00,
          bonus: 300.00,
          deductions: 450.00,
          netAmount: 4350.00,
          paymentDate: '2024-03-05',
          status: 'paid'
        },
        {
          id: 4,
          month: 4,
          year: 2024,
          amount: 4500.00,
          bonus: 0.00,
          deductions: 450.00,
          netAmount: 4050.00,
          status: 'pending'
        }
      ];
      
      const filteredSalaries = mockSalaries.filter(salary => salary.year === selectedYear);
      setSalaries(filteredSalaries);
    } catch (error) {
      console.error('Erro ao carregar salários:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      paid: 'Pago',
      pending: 'Pendente'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const calculateTotals = () => {
    const totalGross = salaries.reduce((sum, salary) => sum + salary.amount, 0);
    const totalBonus = salaries.reduce((sum, salary) => sum + salary.bonus, 0);
    const totalDeductions = salaries.reduce((sum, salary) => sum + salary.deductions, 0);
    const totalNet = salaries.reduce((sum, salary) => sum + salary.netAmount, 0);
    
    return { totalGross, totalBonus, totalDeductions, totalNet };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Salários</h1>
          <p className="text-gray-600">Histórico de pagamentos e holerites</p>
        </div>
        
        <div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
            <option value={2022}>2022</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Salário Bruto Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totals.totalGross)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total de Bônus</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totals.totalBonus)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total de Descontos</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totals.totalDeductions)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Líquido Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(totals.totalNet)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Salários - {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">Mês</th>
                  <th className="px-4 py-3 text-left">Salário Bruto</th>
                  <th className="px-4 py-3 text-left">Bônus</th>
                  <th className="px-4 py-3 text-left">Descontos</th>
                  <th className="px-4 py-3 text-left">Líquido</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Data Pagamento</th>
                  <th className="px-4 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map((salary) => (
                  <tr key={salary.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{getMonthName(salary.month)}</p>
                        <p className="text-sm text-gray-500">{salary.year}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(salary.amount)}
                    </td>
                    <td className="px-4 py-3 text-green-600">
                      {salary.bonus > 0 ? formatCurrency(salary.bonus) : '-'}
                    </td>
                    <td className="px-4 py-3 text-red-600">
                      {formatCurrency(salary.deductions)}
                    </td>
                    <td className="px-4 py-3 font-bold text-blue-600">
                      {formatCurrency(salary.netAmount)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(salary.status)}
                    </td>
                    <td className="px-4 py-3">
                      {salary.paymentDate ? (
                        new Date(salary.paymentDate).toLocaleDateString('pt-BR')
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {salary.status === 'paid' && (
                          <>
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                              title="Visualizar holerite"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                              title="Baixar holerite"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {salaries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>Nenhum registro de salário encontrado para {selectedYear}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Salary Breakdown */}
      {salaries.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Anual - {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Valores Recebidos</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Salário Base:</span>
                      <span className="font-medium">{formatCurrency(totals.totalGross)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bônus Total:</span>
                      <span className="font-medium text-green-600">{formatCurrency(totals.totalBonus)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Total Bruto:</span>
                      <span className="font-bold">{formatCurrency(totals.totalGross + totals.totalBonus)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">Descontos e Líquido</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total de Descontos:</span>
                      <span className="font-medium text-red-600">{formatCurrency(totals.totalDeductions)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Total Líquido:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(totals.totalNet)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Média Mensal:</span>
                      <span className="font-medium">{formatCurrency(totals.totalNet / Math.max(salaries.length, 1))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}