'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TuitionModal } from '@/components/forms/tuition-modal';
import { Badge } from '@/components/ui/badge';
import { apiHelper } from '@/lib/apiHelper';

interface Tuition {
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

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const paymentMethodLabels = {
  cash: 'Dinheiro',
  card: 'Cartão',
  transfer: 'Transferência',
  pix: 'PIX'
};

export default function TuitionsPage() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTuition, setSelectedTuition] = useState<Tuition | null>(null);
  const [filters, setFilters] = useState({
    due_month: new Date().getMonth() + 1,
    due_year: new Date().getFullYear(),
    status: '',
    student_id: ''
  });
  const [statistics, setStatistics] = useState({
    total_pending: 0,
    total_paid: 0,
    total_overdue: 0,
    count_pending: 0,
    count_paid: 0,
    count_overdue: 0,
    monthly_total: 0
  });
  const [paymentData, setPaymentData] = useState({
    payment_method: '',
    discount: '',
    late_fee: '',
    paid_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadTuitions();
    loadStatistics();
  }, [filters]);

  const loadTuitions = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};
      if (filters.due_month) params.due_month = filters.due_month.toString();
      if (filters.due_year) params.due_year = filters.due_year.toString();
      if (filters.status) params.status = filters.status;
      if (filters.student_id) params.student_id = filters.student_id;

      const data = await apiHelper.get('/tuitions', params);
      setTuitions(data);
    } catch (error) {
      console.error('Erro ao carregar mensalidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const params: Record<string, any> = {};
      if (filters.due_month) params.month = filters.due_month.toString();
      if (filters.due_year) params.year = filters.due_year.toString();

      const data = await apiHelper.get('/tuitions/statistics', params);
      setStatistics(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (selectedTuition) {
        await apiHelper.put(`/tuitions/${selectedTuition.id}`, { tuition: data });
      } else {
        await apiHelper.post('/tuitions', { tuition: data });
      }
      
      loadTuitions();
      loadStatistics();
      setShowModal(false);
      setSelectedTuition(null);
    } catch (error) {
      console.error('Erro ao salvar mensalidade:', error);
    }
  };

  const handlePay = async () => {
    if (!selectedTuition) return;

    try {
      await apiHelper.put(`/tuitions/${selectedTuition.id}/pay`, paymentData);
      
      loadTuitions();
      loadStatistics();
      setShowPaymentModal(false);
      setSelectedTuition(null);
      setPaymentData({
        payment_method: '',
        discount: '',
        late_fee: '',
        paid_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Erro ao pagar mensalidade:', error);
    }
  };

  const handleBulkGenerate = async () => {
    const amount = prompt('Digite o valor da mensalidade:');
    if (!amount) return;

    try {
      const result = await apiHelper.post('/tuitions/bulk_generate', {
        month: filters.due_month,
        year: filters.due_year,
        amount: parseFloat(amount)
      });
      
      alert(result.message);
      loadTuitions();
      loadStatistics();
    } catch (error) {
      console.error('Erro ao gerar mensalidades:', error);
    }
  };

  const handleEdit = (tuition: Tuition) => {
    setSelectedTuition(tuition);
    setShowModal(true);
  };

  const openPaymentModal = (tuition: Tuition) => {
    setSelectedTuition(tuition);
    
    // Calcular taxa de atraso automaticamente
    const today = new Date();
    const dueDate = new Date(tuition.due_date);
    let calculatedLateFee = '';
    
    if (dueDate < today) {
      const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const lateFeeAmount = (tuition.amount * 0.02 * daysLate / 30);
      calculatedLateFee = lateFeeAmount.toFixed(2);
    }

    setPaymentData({
      payment_method: '',
      discount: '',
      late_fee: calculatedLateFee,
      paid_date: new Date().toISOString().split('T')[0]
    });
    setShowPaymentModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente excluir esta mensalidade?')) {
      try {
        await apiHelper.delete(`/tuitions/${id}`);
        loadTuitions();
        loadStatistics();
      } catch (error) {
        console.error('Erro ao excluir mensalidade:', error);
      }
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    let finalStatus = status;
    
    // Verificar se está em atraso
    if (status === 'pending' && new Date(dueDate) < new Date()) {
      finalStatus = 'overdue';
    }

    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Em Atraso',
      cancelled: 'Cancelado'
    };

    return (
      <Badge className={colors[finalStatus as keyof typeof colors]}>
        {labels[finalStatus as keyof typeof labels]}
      </Badge>
    );
  };

  const formatCurrency = (value: any) => {
    const numValue = parseFloat(value?.toString()) || 0;
    return numValue.toLocaleString('pt-BR');
  };

  const calculateFinalAmount = (tuition: Tuition) => {
    const amount = parseFloat(tuition.amount.toString()) || 0;
    const lateFee = parseFloat((tuition.late_fee || 0).toString()) || 0;
    const discount = parseFloat((tuition.discount || 0).toString()) || 0;
    return amount + lateFee - discount;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestão de Mensalidades</h1>
        <div className="flex gap-2">
          <Button onClick={handleBulkGenerate} variant="outline">
            Gerar Mensalidades
          </Button>
          <Button onClick={() => setShowModal(true)}>
            Nova Mensalidade
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {formatCurrency(statistics.total_pending)}
            </div>
            <p className="text-xs text-gray-500">{statistics.count_pending} mensalidades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recebidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {formatCurrency(statistics.total_paid)}
            </div>
            <p className="text-xs text-gray-500">{statistics.count_paid} mensalidades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {formatCurrency(statistics.total_overdue)}
            </div>
            <p className="text-xs text-gray-500">{statistics.count_overdue} mensalidades</p>
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
                value={filters.due_month}
                onChange={(e) => setFilters(prev => ({ ...prev, due_month: parseInt(e.target.value) }))}
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
                value={filters.due_year}
                onChange={(e) => setFilters(prev => ({ ...prev, due_year: parseInt(e.target.value) }))}
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
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Mensalidades */}
      <Card>
        <CardHeader>
          <CardTitle>Mensalidades - {months[filters.due_month - 1]} {filters.due_year}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Aluno</th>
                    <th className="px-4 py-3 text-left">Turma</th>
                    <th className="px-4 py-3 text-left">Valor</th>
                    <th className="px-4 py-3 text-left">Vencimento</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tuitions.map((tuition) => (
                    <tr key={tuition.id} className="border-b">
                      <td className="px-4 py-3">{tuition.student.name}</td>
                      <td className="px-4 py-3">{tuition.student.school_class?.name || '-'}</td>
                      <td className="px-4 py-3">R$ {formatCurrency(calculateFinalAmount(tuition))}</td>
                      <td className="px-4 py-3">{new Date(tuition.due_date).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3">{getStatusBadge(tuition.status, tuition.due_date)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEdit(tuition)}>
                            Editar
                          </Button>
                          {tuition.status === 'pending' && (
                            <Button size="sm" onClick={() => openPaymentModal(tuition)} variant="outline">
                              Pagar
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(tuition.id)}>
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

      {/* Modal de Mensalidade */}
      <TuitionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTuition(null);
        }}
        onSave={handleSave}
        tuition={selectedTuition}
      />

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Registrar Pagamento</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Aluno</label>
                <p className="text-gray-700">{selectedTuition?.student.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Valor Original</label>
                <p className="text-gray-700">R$ {formatCurrency(selectedTuition?.amount)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Data do Pagamento</label>
                <Input
                  type="date"
                  value={paymentData.paid_date}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, paid_date: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Selecione</option>
                  <option value="cash">Dinheiro</option>
                  <option value="card">Cartão</option>
                  <option value="transfer">Transferência</option>
                  <option value="pix">PIX</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Desconto (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentData.discount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, discount: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Taxa de Atraso (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentData.late_fee}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, late_fee: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowPaymentModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handlePay} disabled={!paymentData.payment_method}>
                  Confirmar Pagamento
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}