'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FinancialTransactionCard } from '@/components/ui/financial-transaction-card';
import { adminApi, dashboardApi, financialTransactionApi } from '@/lib/api';
import {
  Users,
  GraduationCap,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  DollarSign,
  Calendar
} from 'lucide-react';

interface DashboardData {
  overview: {
    total_users: number;
    total_students: number;
    active_students: number;
    total_teachers: number;
    total_guardians: number;
    total_classes: number;
    pending_tuitions: number;
    overdue_tuitions: number;
  };
  recent_activities: Array<{
    type: string;
    description: string;
    details: string;
    timestamp: string;
    icon: string;
  }>;
  alerts: Array<{
    type: string;
    title: string;
    message: string;
    action: string;
    link: string;
  }>;
  quick_stats: {
    new_students_this_month: number;
    new_users_this_month: number;
    payments_this_month: number;
    active_classes: number;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [adminDashboard, mainDashboard, transactions] = await Promise.all([
        adminApi.getDashboard(),
        dashboardApi.getOverview(),
        financialTransactionApi.getAll({ status: 'pending', per_page: 10 })
      ]);
      
      setData(adminDashboard.data);
      setDashboardData(mainDashboard.data);
      setPendingTransactions(transactions.data.transactions || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Erro ao carregar dados do dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <Button onClick={loadDashboardData} variant="outline">
          Atualizar
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold">{data.overview.total_users}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Estudantes</p>
                <p className="text-2xl font-bold">{data.overview.total_students}</p>
                <p className="text-xs text-gray-500">{data.overview.active_students} ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Professores</p>
                <p className="text-2xl font-bold">{data.overview.total_teachers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Responsáveis</p>
                <p className="text-2xl font-bold">{data.overview.total_guardians}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Novos Alunos (Mês)</p>
                <p className="text-xl font-bold">{data.quick_stats.new_students_this_month}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Novos Usuários (Mês)</p>
                <p className="text-xl font-bold">{data.quick_stats.new_users_this_month}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Pagamentos (Mês)</p>
                <p className="text-xl font-bold">{data.quick_stats.payments_this_month}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Turmas Ativas</p>
                <p className="text-xl font-bold">{data.quick_stats.active_classes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {data.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Alertas do Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => window.open(alert.link, '_blank')}
                    >
                      {alert.action}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Transactions */}
      {pendingTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Transações Pendentes</span>
              <Badge variant="outline">{pendingTransactions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingTransactions.slice(0, 6).map((transaction) => (
                <FinancialTransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  showPaymentOptions={true}
                  onUpdate={loadDashboardData}
                />
              ))}
            </div>
            {pendingTransactions.length > 6 && (
              <div className="text-center pt-4">
                <Button variant="outline" onClick={() => window.open('/dashboard/finances', '_blank')}>
                  Ver Todas as Transações ({pendingTransactions.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Atividades Recentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recent_activities.slice(0, 8).map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.details}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm">Mensalidades Pendentes</span>
              <Badge variant="outline" className="bg-white">
                {data.overview.pending_tuitions}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm">Mensalidades em Atraso</span>
              <Badge variant="destructive">
                {data.overview.overdue_tuitions}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm">Total de Turmas</span>
              <Badge variant="outline" className="bg-white">
                {data.overview.total_classes}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}