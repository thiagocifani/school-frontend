'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { financialTransactionApi, teacherApi, studentApi } from '@/lib/api';
import { Save, ArrowLeft, Search, User, Users, Landmark, Filter, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

type TransactionType = 'tuition' | 'salary' | 'expense' | 'income';

interface OptionItem {
  id: number;
  label: string;
  sublabel?: string;
}

export default function UnifiedTransactionsPage() {
  const router = useRouter();
  // Filters (reuse cash-flow)
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'paid' | 'overdue' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [activeTab, setActiveTab] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  const [transactionType, setTransactionType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [observation, setObservation] = useState<string>('');

  // Reference selection (Teacher or Student depending on type)
  const [reference, setReference] = useState<{ type: 'Teacher' | 'Student' | null; id: number | null; label?: string }>(
    { type: null, id: null }
  );

  // Search state for dropdowns
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [teacherOptions, setTeacherOptions] = useState<OptionItem[]>([]);
  const [studentOptions, setStudentOptions] = useState<OptionItem[]>([]);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);

  const needsTeacher = transactionType === 'salary';
  const needsStudent = transactionType === 'tuition';

  // Debounced query
  const debouncedQuery = useMemo(() => {
    let timer: any;
    return (q: string, cb: () => void) => {
      clearTimeout(timer);
      timer = setTimeout(cb, 300);
    };
  }, []);

  useEffect(() => {
    if (!needsTeacher && !needsStudent) return;
    if (!searchQuery) {
      setTeacherOptions([]);
      setStudentOptions([]);
      return;
    }

    setLoadingSearch(true);
    debouncedQuery(searchQuery, async () => {
      try {
        if (needsTeacher) {
          const res = await teacherApi.getAll({ search: searchQuery });
          const items: OptionItem[] = (res.data || []).map((t: any) => ({
            id: t.id,
            label: t.user?.name || t.name || 'Professor(a)',
            sublabel: t.user?.email,
          }));
          setTeacherOptions(items);
        }
        if (needsStudent) {
          const res = await studentApi.getAll({ search: searchQuery });
          const items: OptionItem[] = (res.data || []).map((s: any) => ({
            id: s.id,
            label: s.name,
            sublabel: s.registration_number || s.registrationNumber,
          }));
          setStudentOptions(items);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoadingSearch(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, transactionType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error('Informe um valor válido');
      return;
    }
    if (!dueDate) {
      toast.error('Informe a data de vencimento');
      return;
    }

    // Build payload
    const payload: any = {
      transaction_type: transactionType,
      amount: numericAmount,
      due_date: dueDate,
      description,
      observation,
    };

    if (needsTeacher) {
      if (!reference?.id) {
        toast.error('Selecione um professor/funcionário');
        return;
      }
      payload.reference_type = 'Teacher';
      payload.reference_id = reference.id;
    }

    if (needsStudent) {
      if (!reference?.id) {
        toast.error('Selecione um aluno');
        return;
      }
      payload.reference_type = 'Student';
      payload.reference_id = reference.id;
    }

    try {
      await financialTransactionApi.create(payload);
      toast.success('Transação criada com sucesso!');
      setShowNewModal(false);
      setAmount('');
      setDescription('');
      setObservation('');
      setReference({ type: null, id: null });
      setSearchQuery('');
      loadTransactions();
    } catch (error: any) {
      const msg = error?.response?.data?.errors?.join(', ') || error?.response?.data?.error || 'Erro ao criar transação';
      toast.error(msg);
    }
  };

  // load transactions with filters
  const transform = (t: any) => ({
    ...t,
    dueDate: t.due_date,
    paidDate: t.paid_date,
    transactionType: t.transaction_type,
    formattedAmount: t.formatted_amount,
    formattedFinalAmount: t.formatted_final_amount,
    canBePaid: t.can_be_paid,
    canBeCancelled: t.can_be_cancelled,
    reference: t.reference,
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
      setTransactions((data.transactions || []).map(transform));
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

  const renderTypeBadge = (type: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      tuition: { label: 'Mensalidade', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      salary: { label: 'Salário', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      expense: { label: 'Despesa', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
      income: { label: 'Receita', cls: 'bg-green-50 text-green-700 border-green-200' },
    };
    const it = map[type] || { label: type, cls: 'bg-gray-50 text-gray-700 border-gray-200' };
    return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${it.cls}`}>{it.label}</span>;
  };

  const renderStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${map[status] || 'bg-gray-100 text-gray-800'}`}>{status === 'paid' ? 'Pago' : status === 'pending' ? 'Pendente' : status === 'overdue' ? 'Em Atraso' : status === 'cancelled' ? 'Cancelado' : status}</span>;
  };

  const formatAmount = (row: any) => {
    const final = row.formattedFinalAmount || row.formattedAmount;
    const type = row.transactionType;
    const color = type === 'expense' ? 'text-red-600' : type === 'income' ? 'text-green-600' : type === 'salary' ? 'text-indigo-600' : 'text-emerald-600';
    return <span className={`font-semibold ${color}`}>{final}</span>;
  };

  const columns = [
    {
      key: 'description',
      label: 'Descrição',
      priority: 5,
      render: (_: any, row: any) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.description}</span>
          {row.reference?.name && (
            <span className="text-xs text-gray-500">{row.reference.name}</span>
          )}
        </div>
      ),
      mobileRender: (_: any, row: any) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.description}</span>
          {row.reference?.name && (
            <span className="text-xs text-gray-500">{row.reference.name}</span>
          )}
        </div>
      ),
    },
    { key: 'transactionType', label: 'Tipo', priority: 4, render: (v: string) => renderTypeBadge(v) },
    {
      key: 'dueDate',
      label: 'Vencimento',
      priority: 3,
      render: (v: string, row: any) => {
        if (!v) return '-';
        const date = new Date(v);
        const today = new Date();
        const overdue = row.status === 'overdue' || date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return <span className={overdue ? 'text-red-600 font-medium' : ''}>{date.toLocaleDateString('pt-BR')}</span>;
      },
    },
    { key: 'formattedFinalAmount', label: 'Valor', priority: 2, render: (_: any, row: any) => formatAmount(row) },
    { key: 'status', label: 'Status', priority: 1, render: (v: string) => renderStatusBadge(v) },
  ];

  return (
    <div className="container mx-auto px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/finances/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Transações</h1>
            <p className="text-gray-600">Listagem unificada com filtros e criação via modal</p>
          </div>
        </div>
        <Button onClick={() => setShowNewModal(true)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 border border-indigo-300">
          <Plus className="h-4 w-4 mr-2" /> Nova Transação
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Listagem</TabsTrigger>
          <TabsTrigger value="filters">Filtros</TabsTrigger>
        </TabsList>

        <TabsContent value="filters">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Filter className="h-4 w-4" /> Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Select value={selectedType} onValueChange={(v: any) => setSelectedType(v)}>
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
                  <Select value={selectedStatus} onValueChange={(v: any) => setSelectedStatus(v)}>
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
                  <Input placeholder="Descrição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => { setPage(1); loadTransactions(); }}>Aplicar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveTable
                data={transactions}
                columns={columns as any}
                searchable
                filterable
                onSearch={setSearchTerm}
                onFilter={() => setActiveTab('filters')}
                pagination={{ currentPage: pagination.currentPage, totalPages: pagination.totalPages, onPageChange: setPage, pageSize: 20 }}
                emptyMessage={searchTerm ? 'Nenhuma transação encontrada' : 'Nenhuma transação'}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Transaction Modal */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {([
                { key: 'income', label: 'Receita', color: 'text-green-700 bg-green-50' },
                { key: 'tuition', label: 'Mensalidade', color: 'text-emerald-700 bg-emerald-50' },
                { key: 'expense', label: 'Despesa', color: 'text-yellow-700 bg-yellow-50' },
                { key: 'salary', label: 'Salário', color: 'text-indigo-700 bg-indigo-50' },
              ] as Array<{ key: TransactionType; label: string; color: string }>).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setTransactionType(t.key);
                    setReference({ type: null, id: null });
                    setSearchQuery('');
                  }}
                  className={`border rounded-md py-2 px-3 text-sm text-left ${transactionType === t.key ? t.color + ' border-current' : 'border-gray-200'}`}
                >
                  <div className="flex items-center gap-2">
                    {t.key === 'salary' ? <Users className="h-4 w-4" /> : t.key === 'expense' ? <Landmark className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    <span className="font-medium">{t.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Valor e Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                <Input
                  inputMode="decimal"
                  placeholder="Ex: 850,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vencimento</label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <Input placeholder="Ex: Mensalidade Janeiro/2025" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            {/* Observação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Observação</label>
              <Textarea rows={3} placeholder="Informações adicionais" value={observation} onChange={(e) => setObservation(e.target.value)} />
            </div>

            {/* Seleção de referência condicional */}
            {needsTeacher && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Professor ou Funcionário</label>
                  {reference?.id && (
                    <Badge variant="outline" className="text-xs">Selecionado: {reference.label}</Badge>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome ou email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="mt-2 border rounded-md divide-y max-h-56 overflow-auto">
                  {loadingSearch && <div className="px-3 py-2 text-sm text-gray-500">Carregando...</div>}
                  {!loadingSearch && teacherOptions.length === 0 && searchQuery && (
                    <div className="px-3 py-2 text-sm text-gray-500">Nenhum resultado</div>
                  )}
                  {teacherOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setReference({ type: 'Teacher', id: opt.id, label: opt.label })}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${reference?.id === opt.id ? 'bg-indigo-50' : ''}`}
                    >
                      <div className="font-medium text-gray-900">{opt.label}</div>
                      {opt.sublabel && <div className="text-xs text-gray-500">{opt.sublabel}</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {needsStudent && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Aluno</label>
                  {reference?.id && (
                    <Badge variant="outline" className="text-xs">Selecionado: {reference.label}</Badge>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome ou matrícula"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="mt-2 border rounded-md divide-y max-h-56 overflow-auto">
                  {loadingSearch && <div className="px-3 py-2 text-sm text-gray-500">Carregando...</div>}
                  {!loadingSearch && studentOptions.length === 0 && searchQuery && (
                    <div className="px-3 py-2 text-sm text-gray-500">Nenhum resultado</div>
                  )}
                  {studentOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setReference({ type: 'Student', id: opt.id, label: opt.label })}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${reference?.id === opt.id ? 'bg-indigo-50' : ''}`}
                    >
                      <div className="font-medium text-gray-900">{opt.label}</div>
                      {opt.sublabel && <div className="text-xs text-gray-500">Matrícula: {opt.sublabel}</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowNewModal(false)}>Cancelar</Button>
              <Button type="submit" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 border border-indigo-300">
                <Save className="h-4 w-4 mr-2" />
                Salvar Transação
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


