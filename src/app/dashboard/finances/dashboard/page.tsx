'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { financialTransactionApi, teacherApi, studentApi } from '@/lib/api';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { 
  DollarSign, 
  Users, 
  GraduationCap,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  RefreshCw,
  Save,
  Search,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ResponsiveCard, ResponsiveCardContent, ResponsiveCardHeader, ResponsiveCardTitle } from '@/components/ui/responsive-card';
import { ResponsiveButton, ResponsiveButtonGroup } from '@/components/ui/responsive-button';

interface SummaryData {
  receivables: { total: number; paid: number; pending: number };
  payables: { total: number; paid: number; pending: number };
  net_flow: number;
  transactions_count: number;
}

interface DailyBreakdownItem {
  date: string;
  receivablesPaid: number;
  payablesPaid: number;
  netFlow: number;
}

type TransactionType = 'tuition' | 'salary' | 'expense' | 'income';

interface OptionItem {
  id: number;
  label: string;
  sublabel?: string;
}

export default function FinancialDashboardUnified() {
  // Cash flow data
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [dailyBreakdown, setDailyBreakdown] = useState<DailyBreakdownItem[]>([]);
  // Monthly listings
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [monthIncome, setMonthIncome] = useState<any[]>([]);
  const [monthExpenses, setMonthExpenses] = useState<any[]>([]);

  // Filters (simple)
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  // Quick create form
  const [transactionType, setTransactionType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [observation, setObservation] = useState('');
  const [saving, setSaving] = useState(false);

  // Searchable dropdowns
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherOptions, setTeacherOptions] = useState<OptionItem[]>([]);
  const [studentOptions, setStudentOptions] = useState<OptionItem[]>([]);
  const [reference, setReference] = useState<{ type: 'Teacher' | 'Student' | null; id: number | null; label?: string }>({ type: null, id: null });
  const [searching, setSearching] = useState(false);

  const needsTeacher = transactionType === 'salary';
  const needsStudent = transactionType === 'tuition';

  // Transactions list state (to embed on main page)
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'paid' | 'overdue' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  const debounced = useMemo(() => {
    let t: any;
    return (cb: () => void) => {
      clearTimeout(t);
      t = setTimeout(cb, 300);
    };
  }, []);

  useEffect(() => {
    loadCashFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  useEffect(() => {
    loadMonthlyLists();
  }, [month, year]);

  const loadCashFlow = async () => {
    try {
      setLoading(true);
      const { data } = await financialTransactionApi.getCashFlow(startDate, endDate);
      setSummary(data.summary);
      const transformedDaily = (data.daily_breakdown || []).map((d: any) => ({
        date: d.date,
        receivablesPaid: d.receivables_paid,
        payablesPaid: d.payables_paid,
        netFlow: d.net_flow,
      }));
      setDailyBreakdown(transformedDaily);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Erro ao carregar fluxo de caixa');
    } finally {
      setLoading(false);
    }
  };

  const transformTransaction = (t: any) => ({
    ...t,
    dueDate: t.due_date,
    paidDate: t.paid_date,
    transactionType: t.transaction_type,
    formattedAmount: t.formatted_amount,
    formattedFinalAmount: t.formatted_final_amount,
  });

  const loadMonthlyLists = async () => {
    try {
      const [incomeRes, expenseRes] = await Promise.all([
        financialTransactionApi.getAll({ type: 'income', month, year, perPage: 100 }),
        financialTransactionApi.getAll({ type: 'expense', month, year, perPage: 100 }),
      ]);
      setMonthIncome((incomeRes.data?.transactions || []).map(transformTransaction));
      setMonthExpenses((expenseRes.data?.transactions || []).map(transformTransaction));
    } catch (e) {
      setMonthIncome([]);
      setMonthExpenses([]);
    }
  };

  const transformRow = (t: any) => ({
    ...t,
    dueDate: t.due_date,
    transactionType: t.transaction_type,
    formattedAmount: t.formatted_amount,
    formattedFinalAmount: t.formatted_final_amount,
  });

  const loadTransactions = async () => {
    try {
      const { data } = await financialTransactionApi.getAll({
        type: selectedType !== 'all' ? selectedType : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        startDate,
        endDate,
        search: searchTerm || undefined,
        page,
        perPage: 20,
      });
      setTransactions((data.transactions || []).map(transformRow));
      setPagination({ currentPage: data.pagination?.currentPage || 1, totalPages: data.pagination?.totalPages || 1 });
    } catch (e) {
      setTransactions([]);
      setPagination({ currentPage: 1, totalPages: 1 });
    }
  };

  useEffect(() => {
    loadTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, selectedStatus, startDate, endDate, searchTerm, page]);

  // Search teachers/students
  useEffect(() => {
    if (!needsTeacher && !needsStudent) return;
    if (!searchQuery) {
      setTeacherOptions([]);
      setStudentOptions([]);
      return;
    }
    setSearching(true);
    debounced(async () => {
      try {
        if (needsTeacher) {
          const res = await teacherApi.getAll({ search: searchQuery });
          setTeacherOptions((res.data || []).map((t: any) => ({ id: t.id, label: t.user?.name || t.name || 'Professor', sublabel: t.user?.email }))); 
        }
        if (needsStudent) {
          const res = await studentApi.getAll({ search: searchQuery });
          setStudentOptions((res.data || []).map((s: any) => ({ id: s.id, label: s.name, sublabel: s.registration_number || s.registrationNumber })));
        }
      } catch (_) {
        // ignore
      } finally {
        setSearching(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, transactionType]);

  const handleCreate = async () => {
    const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) return toast.error('Informe um valor válido');
    if (!dueDate) return toast.error('Informe uma data');

    const payload: any = {
      transaction_type: transactionType,
      amount: numericAmount,
      due_date: dueDate,
      description,
      observation,
    };

    if (needsTeacher) {
      if (!reference?.id) return toast.error('Selecione um professor/funcionário');
      payload.reference_type = 'Teacher';
      payload.reference_id = reference.id;
    }
    if (needsStudent) {
      if (!reference?.id) return toast.error('Selecione um aluno');
      payload.reference_type = 'Student';
      payload.reference_id = reference.id;
    }

    try {
      setSaving(true);
      await financialTransactionApi.create(payload);
      toast.success('Transação criada!');
      // reset minimal
      setAmount('');
      setDescription('');
      setObservation('');
      setReference({ type: null, id: null });
      setSearchQuery('');
      loadCashFlow();
    } catch (e: any) {
      toast.error(e?.response?.data?.errors?.join(', ') || e?.response?.data?.error || 'Erro ao criar transação');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Finanças</h1>
        <div />
      </div>

      {/* Filters minimal */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Início</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fim</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={loadCashFlow} className="flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Atualizar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters for transactions */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data Inicial</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data Final</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <Select value={selectedType} onValueChange={(v: any) => { setSelectedType(v); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="tuition">Mensalidade</SelectItem>
                  <SelectItem value="salary">Salário</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={selectedStatus} onValueChange={(v: any) => { setSelectedStatus(v); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Em Atraso</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <Input placeholder="Descrição..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} />
            </div>
          </div>

          {/* Transactions table */}
          <ResponsiveTable
            data={transactions}
            columns={[
              { key: 'description', label: 'Descrição', priority: 5 },
              { key: 'transactionType', label: 'Tipo', priority: 4 },
              { key: 'dueDate', label: 'Vencimento', priority: 3, render: (v: string) => v ? new Date(v).toLocaleDateString('pt-BR') : '-' },
              { key: 'formattedFinalAmount', label: 'Valor', priority: 2 },
              { key: 'status', label: 'Status', priority: 1, render: (v: string) => <Badge variant="outline" className="text-xs">{v}</Badge> },
            ] as any}
            searchable
            onSearch={setSearchTerm}
            pagination={{ currentPage: pagination.currentPage, totalPages: pagination.totalPages, onPageChange: setPage, pageSize: 20 }}
            emptyMessage={searchTerm ? 'Nenhuma transação encontrada' : 'Nenhuma transação'}
          />
        </CardContent>
      </Card>

      {/* Summary */}
      {summary && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ResponsiveCard>
            <ResponsiveCardHeader className="pb-2"><ResponsiveCardTitle className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> A Receber</ResponsiveCardTitle></ResponsiveCardHeader>
          <ResponsiveCardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">R$ {summary.receivables.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Pago: R$ {summary.receivables.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </ResponsiveCardContent>
        </ResponsiveCard>
        <ResponsiveCard>
            <ResponsiveCardHeader className="pb-2"><ResponsiveCardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> A Pagar</ResponsiveCardTitle></ResponsiveCardHeader>
          <ResponsiveCardContent>
              <div className="text-2xl sm:text-3xl font-bold text-red-600">R$ {summary.payables.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Pago: R$ {summary.payables.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </ResponsiveCardContent>
        </ResponsiveCard>
        <ResponsiveCard>
            <ResponsiveCardHeader className="pb-2"><ResponsiveCardTitle className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Fluxo Líquido</ResponsiveCardTitle></ResponsiveCardHeader>
          <ResponsiveCardContent>
              <div className={`text-2xl sm:text-3xl font-bold ${summary.net_flow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {summary.net_flow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{summary.transactions_count} transações</p>
          </ResponsiveCardContent>
        </ResponsiveCard>
        <ResponsiveCard>
            <ResponsiveCardHeader className="pb-2"><ResponsiveCardTitle className="flex items-center gap-2"><Filter className="h-4 w-4" /> Período</ResponsiveCardTitle></ResponsiveCardHeader>
          <ResponsiveCardContent>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{startDate} • {endDate}</div>
          </ResponsiveCardContent>
        </ResponsiveCard>
      </div>
      )}

      

      {/* Monthly Chart + Lists */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Mensal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mês</label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{String(i + 1).padStart(2, '0')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ano</label>
              <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value || new Date().getFullYear()))} />
            </div>
          </div>
          
          {/* Chart */}
          <div className="w-full">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={[{
                  name: `${String(month).padStart(2, '0')}/${year}`,
                  receitas: monthIncome.reduce((s, t) => s + (t.final_amount ?? t.amount ?? 0), 0),
                  despesas: monthExpenses.reduce((s, t) => s + (t.final_amount ?? t.amount ?? 0), 0),
                  liquido: monthIncome.reduce((s, t) => s + (t.final_amount ?? t.amount ?? 0), 0) - monthExpenses.reduce((s, t) => s + (t.final_amount ?? t.amount ?? 0), 0),
                }]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="receitas" name="Receitas" fill="#10b981" />
                <Bar dataKey="despesas" name="Despesas" fill="#ef4444" />
                <Bar dataKey="liquido" name="Líquido" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Receitas do Mês</h3>
                <Badge className="bg-green-100 text-green-800">
                  Total R$ {monthIncome.reduce((s, t) => s + (t.final_amount ?? t.amount ?? 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Badge>
              </div>
            <div className="space-y-3">
                {monthIncome.slice(0, 10).map((t) => (
                  <div key={t.id} className="p-3 border rounded-md flex items-center justify-between">
                  <div>
                      <div className="font-medium">{t.description}</div>
                      <div className="text-xs text-gray-500">Venc. {t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : '-'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{t.formattedFinalAmount || `R$ ${(t.final_amount ?? t.amount ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</div>
                      <Badge variant="outline" className="text-xs">{t.status}</Badge>
                    </div>
                  </div>
                ))}
                {monthIncome.length === 0 && (
                  <div className="text-sm text-gray-500">Sem receitas neste mês.</div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Despesas do Mês</h3>
                <Badge className="bg-red-100 text-red-800">
                  Total R$ {monthExpenses.reduce((s, t) => s + (t.final_amount ?? t.amount ?? 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Badge>
              </div>
              <div className="space-y-3">
                {monthExpenses.slice(0, 10).map((t) => (
                  <div key={t.id} className="p-3 border rounded-md flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t.description}</div>
                      <div className="text-xs text-gray-500">Venc. {t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : '-'}</div>
                  </div>
                  <div className="text-right">
                      <div className="font-bold text-red-600">{t.formattedFinalAmount || `R$ ${(t.final_amount ?? t.amount ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</div>
                      <Badge variant="outline" className="text-xs">{t.status}</Badge>
                    </div>
                  </div>
                ))}
                {monthExpenses.length === 0 && (
                  <div className="text-sm text-gray-500">Sem despesas neste mês.</div>
                )}
                </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily snapshot list */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Diário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dailyBreakdown.slice(0, 9).map((d) => (
              <div key={d.date} className="p-3 border rounded-md flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">{d.date}</div>
                  <div className="text-xs text-gray-500">Receb.: R$ {d.receivablesPaid.toLocaleString('pt-BR')}</div>
            </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Pag.: R$ {d.payablesPaid.toLocaleString('pt-BR')}</div>
                  <div className={`text-sm font-medium ${d.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>Líquido: R$ {d.netFlow.toLocaleString('pt-BR')}</div>
            </div>
            </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}