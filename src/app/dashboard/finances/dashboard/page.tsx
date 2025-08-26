'use client';

import { useState, useEffect } from 'react';
import { ResponsiveCard, ResponsiveCardContent, ResponsiveCardHeader, ResponsiveCardTitle } from '@/components/ui/responsive-card';
import { ResponsiveButton, ResponsiveButtonGroup } from '@/components/ui/responsive-button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function FinancialDashboard() {
  const [data, setData] = useState({
    totalTuitions: 0,
    totalSalaries: 0,
    pendingTuitions: 0,
    pendingSalaries: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    coraStats: {
      totalInvoices: 0,
      pendingAmount: 0,
      paidAmount: 0,
      overdueCount: 0,
      recentPayments: []
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      // Simulação de dados - em produção, isso viria das APIs
      setTimeout(() => {
        setData({
          totalTuitions: 45000,
          totalSalaries: 25000,
          pendingTuitions: 8500,
          pendingSalaries: 5000,
          monthlyRevenue: 52000,
          monthlyExpenses: 30000,
          coraStats: {
            totalInvoices: 156,
            pendingAmount: 12500.00,
            paidAmount: 48300.00,
            overdueCount: 3,
            recentPayments: [
              {
                id: 1,
                customer_name: 'Maria Silva',
                amount: 850.00,
                paid_at: '2025-01-20T10:30:00Z',
                invoice_type: 'tuition'
              },
              {
                id: 2,
                customer_name: 'João Santos',
                amount: 650.00,
                paid_at: '2025-01-20T09:15:00Z',
                invoice_type: 'tuition'
              },
              {
                id: 3,
                customer_name: 'Ana Costa',
                amount: 750.00,
                paid_at: '2025-01-19T16:45:00Z',
                invoice_type: 'tuition'
              }
            ]
          }
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast.error('Erro ao carregar dados financeiros');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Dashboard Financeiro
        </h1>
        <ResponsiveButtonGroup>
          <Link href="/dashboard/finances/tuitions">
            <ResponsiveButton variant="outline">Mensalidades</ResponsiveButton>
          </Link>
          <Link href="/dashboard/finances/salaries">
            <ResponsiveButton variant="outline">Salários</ResponsiveButton>
          </Link>
        </ResponsiveButtonGroup>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ResponsiveCard>
          <ResponsiveCardHeader className="pb-2">
            <ResponsiveCardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Receitas do Mês
            </ResponsiveCardTitle>
          </ResponsiveCardHeader>
          <ResponsiveCardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {data.monthlyRevenue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Mensalidades recebidas</p>
          </ResponsiveCardContent>
        </ResponsiveCard>

        <ResponsiveCard>
          <ResponsiveCardHeader className="pb-2">
            <ResponsiveCardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Despesas do Mês
            </ResponsiveCardTitle>
          </ResponsiveCardHeader>
          <ResponsiveCardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {data.monthlyExpenses.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Salários e custos</p>
          </ResponsiveCardContent>
        </ResponsiveCard>

        <ResponsiveCard>
          <ResponsiveCardHeader className="pb-2">
            <ResponsiveCardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Mensalidades Pendentes
            </ResponsiveCardTitle>
          </ResponsiveCardHeader>
          <ResponsiveCardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {data.pendingTuitions.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>A receber</p>
          </ResponsiveCardContent>
        </ResponsiveCard>

        <ResponsiveCard>
          <ResponsiveCardHeader className="pb-2">
            <ResponsiveCardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Saldo do Mês
            </ResponsiveCardTitle>
          </ResponsiveCardHeader>
          <ResponsiveCardContent>
            <div className={`text-2xl font-bold ${(data.monthlyRevenue - data.monthlyExpenses) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {(data.monthlyRevenue - data.monthlyExpenses).toLocaleString('pt-BR')}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Receitas - Despesas</p>
          </ResponsiveCardContent>
        </ResponsiveCard>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ResponsiveCard>
          <ResponsiveCardHeader>
            <ResponsiveCardTitle>Gestão de Mensalidades</ResponsiveCardTitle>
          </ResponsiveCardHeader>
          <ResponsiveCardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total de mensalidades do mês:</span>
              <strong>R$ {data.totalTuitions.toLocaleString('pt-BR')}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span>Pendentes:</span>
              <span className="text-yellow-600">R$ {data.pendingTuitions.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/finances/tuitions" className="flex-1">
                <ResponsiveButton className="w-full">Gerenciar Mensalidades</ResponsiveButton>
              </Link>
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>

        <ResponsiveCard>
          <ResponsiveCardHeader>
            <ResponsiveCardTitle>Gestão de Salários</ResponsiveCardTitle>
          </ResponsiveCardHeader>
          <ResponsiveCardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total de salários do mês:</span>
              <strong>R$ {data.totalSalaries.toLocaleString('pt-BR')}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span>Pendentes:</span>
              <span className="text-red-600">R$ {data.pendingSalaries.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/finances/salaries" className="flex-1">
                <ResponsiveButton className="w-full">Gerenciar Salários</ResponsiveButton>
              </Link>
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
      </div>

      {/* Cora Payment Statistics */}
      <ResponsiveCard className="mb-6">
        <ResponsiveCardHeader>
          <ResponsiveCardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Estatísticas Cora API
          </ResponsiveCardTitle>
        </ResponsiveCardHeader>
        <ResponsiveCardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="text-2xl font-bold text-blue-600">{data.coraStats.totalInvoices}</h3>
              <p className="text-sm text-gray-600">Total de Faturas</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-2xl font-bold text-yellow-600">
                R$ {data.coraStats.pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-sm text-gray-600">Valor Pendente</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h3 className="text-2xl font-bold text-green-600">
                R$ {data.coraStats.paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-sm text-gray-600">Valor Recebido</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <h3 className="text-2xl font-bold text-red-600">{data.coraStats.overdueCount}</h3>
              <p className="text-sm text-gray-600">Em Atraso</p>
            </div>
          </div>
          
          {/* Recent Payments */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Pagamentos Recentes
            </h4>
            <div className="space-y-3">
              {data.coraStats.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{payment.customer_name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(payment.paid_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {payment.invoice_type === 'tuition' ? 'Mensalidade' : 
                       payment.invoice_type === 'salary' ? 'Salário' : 'Despesa'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ResponsiveCardContent>
      </ResponsiveCard>

      {/* Resumo Financeiro */}
      <ResponsiveCard>
        <ResponsiveCardHeader>
          <ResponsiveCardTitle>Resumo Financeiro Mensal</ResponsiveCardTitle>
        </ResponsiveCardHeader>
        <ResponsiveCardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Receitas (Mensalidades)</span>
              <span className="text-green-600 font-bold">
                + R$ {data.monthlyRevenue.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Despesas (Salários)</span>
              <span className="text-red-600 font-bold">
                - R$ {data.monthlyExpenses.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t-2">
              <span className="font-bold text-lg">Saldo Final</span>
              <span className={`font-bold text-lg ${(data.monthlyRevenue - data.monthlyExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {(data.monthlyRevenue - data.monthlyExpenses).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </ResponsiveCardContent>
      </ResponsiveCard>
    </div>
  );
}