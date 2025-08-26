'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  Plus,
  Eye,
  CreditCard,
  Users,
  GraduationCap,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { toast } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/error-boundary';
import { financialTransactionApi } from '@/lib/api';
import type { 
  CashFlowSummary, 
  DailyBreakdown, 
  MonthlyBreakdown, 
  FinancialTransaction 
} from '@/types';


const COLORS = {
  tuition: '#10b981',
  salary: '#f59e0b',
  expense: '#ef4444',
  income: '#8b5cf6'
};

const CHART_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function CashFlowPage() {
  // Helper function to transform transaction data from snake_case to camelCase
  const transformTransaction = (transaction: any) => ({
    ...transaction,
    dueDate: transaction.due_date,
    paidDate: transaction.paid_date,
    transactionType: transaction.transaction_type,
    formattedAmount: transaction.formatted_amount,
    formattedFinalAmount: transaction.formatted_final_amount,
    finalAmount: transaction.final_amount,
    paymentMethod: transaction.payment_method,
    canBePaid: transaction.can_be_paid,
    canBeCancelled: transaction.can_be_cancelled,
    statusBadgeClass: transaction.status_badge_class,
    typeIcon: transaction.type_icon,
    daysOverdue: transaction.days_overdue,
    externalId: transaction.external_id,
    createdAt: transaction.created_at,
    updatedAt: transaction.updated_at,
    coraInvoice: transaction.cora_invoice ? {
      ...transaction.cora_invoice,
      invoiceId: transaction.cora_invoice.invoice_id,
      formattedAmount: transaction.cora_invoice.formatted_amount,
      dueDate: transaction.cora_invoice.due_date,
      customerName: transaction.cora_invoice.customer_name,
      customerEmail: transaction.cora_invoice.customer_email,
      invoiceType: transaction.cora_invoice.invoice_type,
      boletoUrl: transaction.cora_invoice.boleto_url,
      pixQrCode: transaction.cora_invoice.pix_qr_code,
      pixQrCodeUrl: transaction.cora_invoice.pix_qr_code_url,
      canBeCancelled: transaction.cora_invoice.can_be_cancelled,
      daysOverdue: transaction.cora_invoice.days_overdue,
      paidAt: transaction.cora_invoice.paid_at,
      createdAt: transaction.cora_invoice.created_at,
      updatedAt: transaction.cora_invoice.updated_at
    } : null
  });

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [summary, setSummary] = useState<CashFlowSummary | null>(null);
  const [dailyBreakdown, setDailyBreakdown] = useState<DailyBreakdown[]>([]);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<MonthlyBreakdown[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<FinancialTransaction[]>([]);
  const [overdueTransactions, setOverdueTransactions] = useState<FinancialTransaction[]>([]);
  
  // Filters
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // View controls
  const [activeTab, setActiveTab] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  
  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [processingPayment, setProcessingPayment] = useState(false);

  // New expense modal
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    dueDate: new Date().toISOString().slice(0, 10),
    observation: ''
  });
  const [creatingExpense, setCreatingExpense] = useState(false);

  // New income modal  
  const [showNewIncomeModal, setShowNewIncomeModal] = useState(false);
  const [incomeData, setIncomeData] = useState({
    description: '',
    amount: '',
    dueDate: new Date().toISOString().slice(0, 10),
    observation: ''
  });
  const [creatingIncome, setCreatingIncome] = useState(false);

  useEffect(() => {
    loadCashFlowData();
  }, [startDate, endDate]);

  useEffect(() => {
    loadTransactions();
  }, [selectedType, selectedStatus, searchTerm]);

  const loadCashFlowData = async () => {
    try {
      setLoading(true);
      
      const { data } = await financialTransactionApi.getCashFlow(startDate, endDate);
      
      // Transform snake_case to camelCase for frontend compatibility
      setSummary(data.summary);
      
      // Transform daily breakdown field names for chart compatibility
      const transformedDailyBreakdown = (data.daily_breakdown || []).map((day: any) => ({
        ...day,
        receivablesPaid: day.receivables_paid,
        payablesPaid: day.payables_paid,
        netFlow: day.net_flow,
        receivablesDue: day.receivables_due,
        payablesDue: day.payables_due
      }));
      setDailyBreakdown(transformedDailyBreakdown);
      
      setMonthlyBreakdown(data.monthly_breakdown || []);
      
      setRecentTransactions((data.recent_transactions || []).map(transformTransaction));
      setOverdueTransactions((data.overdue_transactions || []).map(transformTransaction));
      
    } catch (error: any) {
      console.error('Erro ao carregar dados de fluxo de caixa:', error);
      toast.error(error?.response?.data?.error || 'Erro ao carregar dados de fluxo de caixa');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const filters = {
        type: selectedType !== 'all' ? selectedType as any : undefined,
        status: selectedStatus !== 'all' ? selectedStatus as any : undefined,
        search: searchTerm || undefined,
        startDate,
        endDate,
        perPage: 50
      };
      
      const { data } = await financialTransactionApi.getAll(filters);
      
      setTransactions((data.transactions || []).map(transformTransaction));
    } catch (error: any) {
      console.error('Erro ao carregar transações:', error);
      toast.error(error?.response?.data?.error || 'Erro ao carregar transações');
    }
  };


  const handleCreateTuition = async () => {
    try {
      const currentDate = new Date();
      const amount = 650; // Default tuition amount
      
      const { data } = await financialTransactionApi.bulkCreateTuitions(
        currentDate.getMonth() + 1,
        currentDate.getFullYear(),
        amount
      );
      
      toast.success(data.message);
      loadCashFlowData();
      loadTransactions();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Erro ao criar mensalidades');
    }
  };

  const handleCreateSalary = async () => {
    try {
      const currentDate = new Date();
      
      const { data } = await financialTransactionApi.bulkCreateSalaries(
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      );
      
      toast.success(data.message);
      loadCashFlowData();
      loadTransactions();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Erro ao criar salários');
    }
  };

  const handlePayTransaction = (transaction: FinancialTransaction) => {
    setSelectedTransaction(transaction);
    setPaymentMethod('pix');
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedTransaction) return;
    
    try {
      setProcessingPayment(true);
      
      const { data } = await financialTransactionApi.pay(selectedTransaction.id, {
        payment_method: paymentMethod,
        paid_date: paymentDate
      });
      
      toast.success(data.message);
      
      // Close modal and refresh data
      setShowPaymentModal(false);
      setSelectedTransaction(null);
      loadTransactions();
      loadCashFlowData();
      
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error?.response?.data?.error || 'Erro ao processar pagamento');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleBulkCreateTuitions = async () => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    const amount = prompt(
      `Criar mensalidades para ${month.toString().padStart(2, '0')}/${year}.\nValor da mensalidade (R$):`,
      '850.00'
    );
    
    if (!amount) return;
    
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Valor inválido');
      return;
    }
    
    if (!confirm(`Confirma a criação das mensalidades de R$ ${numericAmount.toFixed(2)} para ${month.toString().padStart(2, '0')}/${year}?`)) {
      return;
    }
    
    try {
      const { data } = await financialTransactionApi.bulkCreateTuitions(month, year, numericAmount);
      
      toast.success(data.message);
      
      // Auto-generate Cora invoices for new tuitions
      if (data.transactions && data.transactions.length > 0) {
        const generatePromises = data.transactions.map((transaction: any) => 
          financialTransactionApi.generateCoraInvoice(transaction.id).catch((error) => {
            console.warn(`Failed to generate Cora invoice for transaction ${transaction.id}:`, error);
            return null;
          })
        );
        
        const results = await Promise.allSettled(generatePromises);
        const successCount = results.filter(result => result.status === 'fulfilled' && result.value !== null).length;
        
        if (successCount > 0) {
          toast.success(`${successCount} boletos Cora gerados automaticamente!`);
        }
      }
      
      loadCashFlowData();
      loadTransactions();
      
    } catch (error: any) {
      console.error('Bulk create tuitions error:', error);
      toast.error(error?.response?.data?.error || 'Erro ao criar mensalidades');
    }
  };

  const handleBulkCreateSalaries = async () => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    const generateCoraInvoices = confirm(
      `Confirma a criação dos salários para ${month.toString().padStart(2, '0')}/${year}?\n\nDeseja gerar boletos Cora para pagamento automático?`
    );
    
    if (!generateCoraInvoices && !confirm(`Criar salários sem boletos Cora?`)) {
      return;
    }
    
    try {
      const { data } = await financialTransactionApi.bulkCreateSalaries(month, year);
      
      toast.success(data.message);
      
      // Generate Cora invoices if requested
      if (generateCoraInvoices && data.transactions && data.transactions.length > 0) {
        const generatePromises = data.transactions.map((transaction: any) => 
          financialTransactionApi.generateCoraInvoice(transaction.id).catch((error) => {
            console.warn(`Failed to generate Cora invoice for salary ${transaction.id}:`, error);
            return null;
          })
        );
        
        const results = await Promise.allSettled(generatePromises);
        const successCount = results.filter(result => result.status === 'fulfilled' && result.value !== null).length;
        
        if (successCount > 0) {
          toast.success(`${successCount} boletos Cora gerados para pagamento de salários!`);
        }
      }
      
      loadCashFlowData();
      loadTransactions();
      
    } catch (error: any) {
      console.error('Bulk create salaries error:', error);
      toast.error(error?.response?.data?.error || 'Erro ao criar salários');
    }
  };

  const handleGenerateCoraInvoice = async (transaction: FinancialTransaction) => {
    try {
      const { data } = await financialTransactionApi.generateCoraInvoice(transaction.id);
      
      toast.success('Boleto Cora gerado com sucesso!');
      
      if (data.cora_invoice?.boleto_url) {
        // Open boleto URL in new window
        window.open(data.cora_invoice.boleto_url, '_blank');
      }
      
      // Refresh data to show updated transaction
      loadTransactions();
      loadCashFlowData();
      
    } catch (error: any) {
      console.error('Generate Cora invoice error:', error);
      toast.error(error?.response?.data?.error || 'Erro ao gerar boleto Cora');
    }
  };

  const handleCreateExpense = async () => {
    if (!expenseData.description || !expenseData.amount) {
      toast.error('Preencha descrição e valor');
      return;
    }
    
    const numericAmount = parseFloat(expenseData.amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Valor inválido');
      return;
    }
    
    try {
      setCreatingExpense(true);
      
      const { data } = await financialTransactionApi.create({
        transaction_type: 'expense',
        amount: numericAmount,
        due_date: expenseData.dueDate,
        description: expenseData.description,
        observation: expenseData.observation
      });
      
      toast.success('Despesa criada com sucesso!');
      
      setShowNewExpenseModal(false);
      setExpenseData({
        description: '',
        amount: '',
        dueDate: new Date().toISOString().slice(0, 10),
        observation: ''
      });
      
      loadCashFlowData();
      loadTransactions();
      
    } catch (error: any) {
      console.error('Create expense error:', error);
      toast.error(error?.response?.data?.error || 'Erro ao criar despesa');
    } finally {
      setCreatingExpense(false);
    }
  };

  const handleCreateIncome = async () => {
    if (!incomeData.description || !incomeData.amount) {
      toast.error('Preencha descrição e valor');
      return;
    }
    
    const numericAmount = parseFloat(incomeData.amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Valor inválido');
      return;
    }
    
    try {
      setCreatingIncome(true);
      
      const { data } = await financialTransactionApi.create({
        transaction_type: 'income',
        amount: numericAmount,
        due_date: incomeData.dueDate,
        description: incomeData.description,
        observation: incomeData.observation
      });
      
      toast.success('Receita criada com sucesso!');
      
      setShowNewIncomeModal(false);
      setIncomeData({
        description: '',
        amount: '',
        dueDate: new Date().toISOString().slice(0, 10),
        observation: ''
      });
      
      loadCashFlowData();
      loadTransactions();
      
    } catch (error: any) {
      console.error('Create income error:', error);
      toast.error(error?.response?.data?.error || 'Erro ao criar receita');
    } finally {
      setCreatingIncome(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'tuition': return <GraduationCap className="h-4 w-4" />;
      case 'salary': return <Users className="h-4 w-4" />;
      case 'expense': return <ArrowDownCircle className="h-4 w-4" />;
      case 'income': return <ArrowUpCircle className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'overdue': return <Badge className="bg-red-100 text-red-800">Em Atraso</Badge>;
      case 'cancelled': return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fluxo de Caixa</h1>
            <p className="text-gray-600 mt-1">
              Controle financeiro completo com Cora API
            </p>
          </div>
          
          <div className="flex gap-3">
            {/* Recurring Generation Buttons */}
            <Button
              onClick={handleBulkCreateTuitions}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              Gerar Mensalidades
            </Button>
            <Button
              onClick={handleBulkCreateSalaries}
              className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Gerar Salários
            </Button>
            
            <div className="border-l border-gray-300 mx-1"></div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button
              variant="outline"
              onClick={loadCashFlowData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Enhanced Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros Avançados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Date Presets */}
              <div>
                <label className="block text-sm font-medium mb-3">Períodos Rápidos</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const today = new Date();
                      setStartDate(today.toISOString().slice(0, 10));
                      setEndDate(today.toISOString().slice(0, 10));
                    }}
                  >
                    Hoje
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const today = new Date();
                      const startOfWeek = new Date(today);
                      startOfWeek.setDate(today.getDate() - today.getDay());
                      setStartDate(startOfWeek.toISOString().slice(0, 10));
                      setEndDate(today.toISOString().slice(0, 10));
                    }}
                  >
                    Esta Semana
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const today = new Date();
                      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                      setStartDate(startOfMonth.toISOString().slice(0, 10));
                      setEndDate(endOfMonth.toISOString().slice(0, 10));
                    }}
                  >
                    Este Mês
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const today = new Date();
                      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                      const endLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                      setStartDate(lastMonth.toISOString().slice(0, 10));
                      setEndDate(endLastMonth.toISOString().slice(0, 10));
                    }}
                  >
                    Mês Passado
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const today = new Date();
                      const last30Days = new Date(today);
                      last30Days.setDate(today.getDate() - 30);
                      setStartDate(last30Days.toISOString().slice(0, 10));
                      setEndDate(today.toISOString().slice(0, 10));
                    }}
                  >
                    Últimos 30 Dias
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const today = new Date();
                      const last90Days = new Date(today);
                      last90Days.setDate(today.getDate() - 90);
                      setStartDate(last90Days.toISOString().slice(0, 10));
                      setEndDate(today.toISOString().slice(0, 10));
                    }}
                  >
                    Últimos 90 Dias
                  </Button>
                </div>
              </div>

              {/* Custom Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Data Inicial</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data Final</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Transação</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🔍 Todos os Tipos</SelectItem>
                      <SelectItem value="tuition">🎓 Mensalidades</SelectItem>
                      <SelectItem value="salary">👨‍🏫 Salários</SelectItem>
                      <SelectItem value="expense">💸 Despesas</SelectItem>
                      <SelectItem value="income">💰 Receitas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status do Pagamento</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">📋 Todos os Status</SelectItem>
                      <SelectItem value="pending">⏳ Pendente</SelectItem>
                      <SelectItem value="paid">✅ Pago</SelectItem>
                      <SelectItem value="overdue">⚠️ Em Atraso</SelectItem>
                      <SelectItem value="cancelled">❌ Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Buscar Descrição</label>
                  <Input
                    placeholder="Digite para buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Badge variant="secondary">
                    {transactions?.length || 0} transações encontradas
                  </Badge>
                  {selectedType !== 'all' && (
                    <Badge variant="outline">Tipo: {selectedType}</Badge>
                  )}
                  {selectedStatus !== 'all' && (
                    <Badge variant="outline">Status: {selectedStatus}</Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="outline">Busca: "{searchTerm}"</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedType('all');
                      setSelectedStatus('all');
                      setSearchTerm('');
                      const today = new Date();
                      setStartDate(today.toISOString().slice(0, 10));
                      setEndDate(today.toISOString().slice(0, 10));
                    }}
                  >
                    Limpar Filtros
                  </Button>
                  <Button size="sm" onClick={() => setShowFilters(false)}>
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">A Receber</p>
                    <p className="text-3xl font-bold text-green-600">
                      R$ {summary.receivables.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Pago: R$ {summary.receivables.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">A Pagar</p>
                    <p className="text-3xl font-bold text-red-600">
                      R$ {summary.payables.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Pago: R$ {summary.payables.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fluxo Líquido</p>
                    <p className={`text-3xl font-bold ${summary.net_flow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      R$ {summary.net_flow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {summary.transactions_count} transações
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Em Atraso</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {overdueTransactions?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500">
                      transações pendentes
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                onClick={handleCreateTuition}
                className="h-20 flex flex-col gap-2"
              >
                <GraduationCap className="h-6 w-6" />
                <span>Gerar Mensalidades</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleCreateSalary}
                className="h-20 flex flex-col gap-2"
              >
                <Users className="h-6 w-6" />
                <span>Gerar Salários</span>
              </Button>
              <Button
                onClick={() => setShowNewExpenseModal(true)}
                variant="outline"
                className="h-20 flex flex-col gap-2"
              >
                <Plus className="h-6 w-6" />
                <span>Nova Despesa</span>
              </Button>
              <Button
                onClick={() => setShowNewIncomeModal(true)}
                variant="outline"
                className="h-20 flex flex-col gap-2"
              >
                <CreditCard className="h-6 w-6" />
                <span>Nova Receita</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts and Data */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="daily">Fluxo Diário</TabsTrigger>
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fluxo Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                      <Legend />
                      <Bar dataKey="receivables" name="A Receber" fill="#10b981" />
                      <Bar dataKey="payables" name="A Pagar" fill="#ef4444" />
                      <Bar dataKey="net" name="Líquido" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transações Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(recentTransactions || []).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.transactionType)}
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.dueDate).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{transaction.formattedFinalAmount}</p>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="daily">
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Caixa Diário</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={dailyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                    <Legend />
                    <Line type="monotone" dataKey="receivablesPaid" stroke="#10b981" name="Recebimentos" />
                    <Line type="monotone" dataKey="payablesPaid" stroke="#ef4444" name="Pagamentos" />
                    <Line type="monotone" dataKey="netFlow" stroke="#3b82f6" name="Fluxo Líquido" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle>Análise Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                    <Legend />
                    <Bar dataKey="receivables" name="Receitas" fill="#10b981" />
                    <Bar dataKey="payables" name="Despesas" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="space-y-4">
              {(transactions || []).map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getTransactionIcon(transaction.transactionType)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{transaction.description}</h3>
                          <p className="text-sm text-gray-600">
                            Vencimento: {new Date(transaction.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                          {transaction.daysOverdue > 0 && (
                            <p className="text-sm text-red-600">
                              {transaction.daysOverdue} dias em atraso
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-bold">{transaction.formattedFinalAmount}</p>
                        {getStatusBadge(transaction.status)}
                        
                        {transaction.canBePaid && (
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handlePayTransaction(transaction)}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pagar PIX
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateCoraInvoice(transaction)}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Gerar Boleto
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* PIX Payment Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Processar Pagamento PIX
              </DialogTitle>
            </DialogHeader>
            
            {selectedTransaction && (
              <div className="space-y-4">
                {/* Transaction Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Transação</span>
                    <Badge variant="outline">
                      {selectedTransaction.transactionType === 'tuition' && '🎓 Mensalidade'}
                      {selectedTransaction.transactionType === 'salary' && '👨‍🏫 Salário'}
                      {selectedTransaction.transactionType === 'expense' && '💸 Despesa'}
                      {selectedTransaction.transactionType === 'income' && '💰 Receita'}
                    </Badge>
                  </div>
                  <h3 className="font-medium">{selectedTransaction.description}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Vencimento: {new Date(selectedTransaction.dueDate).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-lg font-bold text-green-600 mt-2">
                    {selectedTransaction.formattedFinalAmount}
                  </div>
                  {selectedTransaction.daysOverdue > 0 && (
                    <div className="text-sm text-red-600 mt-1">
                      ⚠️ {selectedTransaction.daysOverdue} dias em atraso
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium mb-2">Método de Pagamento</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">🔸 PIX (Instantâneo)</SelectItem>
                      <SelectItem value="bank_transfer">🏦 Transferência Bancária</SelectItem>
                      <SelectItem value="credit_card">💳 Cartão de Crédito</SelectItem>
                      <SelectItem value="debit_card">💳 Cartão de Débito</SelectItem>
                      <SelectItem value="cash">💵 Dinheiro</SelectItem>
                      <SelectItem value="check">📝 Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-sm font-medium mb-2">Data do Pagamento</label>
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>

                {/* PIX Instructions */}
                {paymentMethod === 'pix' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800 mb-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-medium">Instruções PIX</span>
                    </div>
                    <div className="text-sm text-blue-700">
                      <p>• Pagamento será processado instantaneamente</p>
                      <p>• Chave PIX: escola@exemplo.com</p>
                      <p>• Ou utilize o QR Code que será gerado</p>
                    </div>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Valor da transação:</span>
                    <span>R$ {selectedTransaction.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {selectedTransaction.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto:</span>
                      <span>-R$ {selectedTransaction.discount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {selectedTransaction.lateFee > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Multa por atraso:</span>
                      <span>+R$ {selectedTransaction.lateFee?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total a pagar:</span>
                    <span className="text-green-600">{selectedTransaction.formattedFinalAmount}</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                disabled={processingPayment}
              >
                Cancelar
              </Button>
              <Button
                onClick={processPayment}
                disabled={processingPayment}
                className="bg-green-600 hover:bg-green-700"
              >
                {processingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Pagamento
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Expense Modal */}
        <Dialog open={showNewExpenseModal} onOpenChange={setShowNewExpenseModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-red-600" />
                Nova Despesa
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Input
                  value={expenseData.description}
                  onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
                  placeholder="Ex: Conta de energia elétrica"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Valor (R$)</label>
                <Input
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Data de Vencimento</label>
                <Input
                  type="date"
                  value={expenseData.dueDate}
                  onChange={(e) => setExpenseData({...expenseData, dueDate: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
                <Input
                  value={expenseData.observation}
                  onChange={(e) => setExpenseData({...expenseData, observation: e.target.value})}
                  placeholder="Observações adicionais..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNewExpenseModal(false)}
                disabled={creatingExpense}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateExpense}
                disabled={creatingExpense}
                className="bg-red-600 hover:bg-red-700"
              >
                {creatingExpense ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Despesa
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Income Modal */}
        <Dialog open={showNewIncomeModal} onOpenChange={setShowNewIncomeModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-green-600" />
                Nova Receita
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Input
                  value={incomeData.description}
                  onChange={(e) => setIncomeData({...incomeData, description: e.target.value})}
                  placeholder="Ex: Locação do auditório"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Valor (R$)</label>
                <Input
                  value={incomeData.amount}
                  onChange={(e) => setIncomeData({...incomeData, amount: e.target.value})}
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Data de Recebimento</label>
                <Input
                  type="date"
                  value={incomeData.dueDate}
                  onChange={(e) => setIncomeData({...incomeData, dueDate: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
                <Input
                  value={incomeData.observation}
                  onChange={(e) => setIncomeData({...incomeData, observation: e.target.value})}
                  placeholder="Observações adicionais..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNewIncomeModal(false)}
                disabled={creatingIncome}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateIncome}
                disabled={creatingIncome}
                className="bg-green-600 hover:bg-green-700"
              >
                {creatingIncome ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Receita
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
}