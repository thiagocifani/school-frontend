'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialDashboard } from '@/hooks/useFinances';
import { useStudents } from '@/hooks/useStudents';
import { formatCurrency } from '@/lib/utils';
import { Users, GraduationCap, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const { data: financialData } = useFinancialDashboard();
  const { data: students } = useStudents();

  const stats = [
    {
      name: 'Total de Alunos',
      value: students?.length || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Receita do Mês',
      value: formatCurrency(financialData?.monthlyReceived || 0),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Saldo Atual',
      value: formatCurrency(financialData?.balance || 0),
      icon: TrendingUp,
      color: financialData?.balance && financialData.balance >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: financialData?.balance && financialData.balance >= 0 ? 'bg-green-100' : 'bg-red-100',
    },
    {
      name: 'Mensalidades Pendentes',
      value: financialData?.pendingTuitions?.length || 0,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="container mx-auto px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema escolar</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mensalidades Pendentes */}
        <Card>
          <CardHeader>
            <CardTitle>Mensalidades Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {financialData?.pendingTuitions?.slice(0, 5).map((tuition) => (
                <div key={tuition.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">{tuition.student.name}</p>
                      <p className="text-sm text-gray-500">{tuition.student.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">{formatCurrency(tuition.amount)}</p>
                    {tuition.daysOverdue && tuition.daysOverdue > 0 && (
                      <p className="text-xs text-red-500">{tuition.daysOverdue} dias em atraso</p>
                    )}
                  </div>
                </div>
              ))}
              {(!financialData?.pendingTuitions || financialData.pendingTuitions.length === 0) && (
                <div className="text-center py-6 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>Todas as mensalidades estão em dia!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {financialData?.recentTransactions?.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <DollarSign className={`h-4 w-4 ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                    </div>
                  </div>
                  <p className={`font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
              {(!financialData?.recentTransactions || financialData.recentTransactions.length === 0) && (
                <div className="text-center py-6 text-gray-500">
                  <p>Nenhuma transação recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}