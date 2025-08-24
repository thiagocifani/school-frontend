'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialTransactionCard } from '@/components/ui/financial-transaction-card';
import { useFinancialDashboard } from '@/hooks/useFinances';
import { useStudents } from '@/hooks/useStudents';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import { financialTransactionApi } from '@/lib/api';
import { Users, GraduationCap, DollarSign, TrendingUp, AlertCircle, CheckCircle, Receipt } from 'lucide-react';

export default function DashboardPage() {
  const { data: financialData } = useFinancialDashboard();
  const { data: students } = useStudents();
  const { user } = useAuth();
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load guardian-specific transactions
  useEffect(() => {
    if (user?.role === 'guardian') {
      loadGuardianTransactions();
    }
  }, [user]);

  const loadGuardianTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load transactions related to guardian's children (tuitions)
      const { data } = await financialTransactionApi.getAll({
        transaction_type: 'tuition',
        status: 'pending,overdue',
        per_page: 20
      });
      
      setUserTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error loading guardian transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      name: 'Total de Alunos',
      value: students?.length || 0,
      icon: Users,
      color: 'var(--primary)',
      background: 'var(--highlight)',
    },
    {
      name: 'Receita do Mês',
      value: formatCurrency(financialData?.monthlyReceived || 0),
      icon: DollarSign,
      color: 'var(--success)',
      background: 'var(--highlight)',
    },
    {
      name: 'Saldo Atual',
      value: formatCurrency(financialData?.balance || 0),
      icon: TrendingUp,
      color: financialData?.balance && financialData.balance >= 0 ? 'var(--success)' : 'var(--error)',
      background: 'var(--highlight)',
    },
    {
      name: 'Mensalidades Pendentes',
      value: financialData?.pendingTuitions?.length || 0,
      icon: AlertCircle,
      color: 'var(--warning)',
      background: 'var(--highlight)',
    },
  ];

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--card-foreground)' }}>Dashboard</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Visão geral do sistema escolar</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name} className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1" style={{ 
            background: 'var(--card)', 
            border: '1px solid var(--border)',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>{stat.name}</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--card-foreground)' }}>{stat.value}</p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ 
                  background: stat.background,
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                }}>
                  <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mensalidades Pendentes */}
        <Card className="transition-all duration-300 hover:shadow-lg" style={{ 
          background: 'var(--card)', 
          border: '1px solid var(--border)',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
        }}>
          <CardHeader style={{ 
            borderBottom: '1px solid var(--border)',
            background: 'var(--highlight)'
          }}>
            <CardTitle style={{ color: 'var(--card-foreground)' }}>Mensalidades Pendentes</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {financialData?.pendingTuitions?.slice(0, 5).map((tuition) => (
                <div key={tuition.id} className="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:shadow-sm" style={{ 
                  border: '1px solid var(--border)', 
                  background: 'var(--muted)',
                }}>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ 
                      background: 'var(--warning)',
                      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                    }}>
                      <AlertCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--card-foreground)' }}>{tuition.student.name}</p>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{tuition.student.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium" style={{ color: 'var(--error)' }}>{formatCurrency(tuition.amount)}</p>
                    {tuition.daysOverdue && tuition.daysOverdue > 0 && (
                      <p className="text-xs" style={{ color: 'var(--error)' }}>{tuition.daysOverdue} dias em atraso</p>
                    )}
                  </div>
                </div>
              ))}
              {(!financialData?.pendingTuitions || financialData.pendingTuitions.length === 0) && (
                <div className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
                  <div className="h-16 w-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ 
                    background: 'var(--success)',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                  }}>
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-lg font-medium">Todas as mensalidades estão em dia!</p>
                  <p className="text-sm">Parabéns pelo controle financeiro!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transações Recentes */}
        <Card className="transition-all duration-300 hover:shadow-lg" style={{ 
          background: 'var(--card)', 
          border: '1px solid var(--border)',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
        }}>
          <CardHeader style={{ 
            borderBottom: '1px solid var(--border)',
            background: 'var(--highlight)'
          }}>
            <CardTitle style={{ color: 'var(--card-foreground)' }}>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {financialData?.recentTransactions?.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:shadow-sm" style={{ 
                  border: '1px solid var(--border)', 
                  background: 'var(--muted)',
                }}>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ 
                      background: transaction.type === 'income' ? 'var(--success)' : 'var(--error)',
                      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                    }}>
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--card-foreground)' }}>{transaction.description}</p>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{transaction.category}</p>
                    </div>
                  </div>
                  <p className="font-medium" style={{ 
                    color: transaction.type === 'income' ? 'var(--success)' : 'var(--error)' 
                  }}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
              {(!financialData?.recentTransactions || financialData.recentTransactions.length === 0) && (
                <div className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
                  <div className="h-16 w-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ 
                    background: 'var(--muted)',
                    border: '2px dashed var(--border)'
                  }}>
                    <DollarSign className="h-8 w-8" style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                  <p className="text-lg font-medium">Nenhuma transação recente</p>
                  <p className="text-sm">As transações aparecerão aqui quando houver movimentação</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guardian-specific section */}
      {user?.role === 'guardian' && (
        <div className="mt-8">
          <Card className="transition-all duration-300 hover:shadow-lg" style={{ 
            background: 'var(--card)', 
            border: '1px solid var(--border)',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
          }}>
            <CardHeader style={{ 
              borderBottom: '1px solid var(--border)',
              background: 'var(--highlight)'
            }}>
              <CardTitle className="flex items-center space-x-2" style={{ color: 'var(--card-foreground)' }}>
                <Receipt className="h-5 w-5" />
                <span>Mensalidades dos Seus Filhos</span>
                {userTransactions.length > 0 && (
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {userTransactions.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>Carregando mensalidades...</p>
                </div>
              ) : userTransactions.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Receipt className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-800">
                          Portal da Família - Mensalidades
                        </p>
                        <p className="text-sm text-blue-700">
                          Visualize e pague as mensalidades dos seus filhos usando PIX ou boleto bancário.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {userTransactions.map((transaction) => (
                      <FinancialTransactionCard
                        key={transaction.id}
                        transaction={transaction}
                        showPaymentOptions={true}
                        onUpdate={loadGuardianTransactions}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
                  <div className="h-16 w-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ 
                    background: 'var(--success)',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                  }}>
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-lg font-medium">Todas as mensalidades estão em dia!</p>
                  <p className="text-sm">Não há mensalidades pendentes para seus filhos.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}