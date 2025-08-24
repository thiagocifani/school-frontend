'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStudents } from '@/hooks/useStudents';

interface TuitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  tuition?: any;
}

const paymentMethods = [
  { value: 'cash', label: 'Dinheiro' },
  { value: 'card', label: 'Cartão' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'pix', label: 'PIX' }
];

export function TuitionModal({ isOpen, onClose, onSave, tuition }: TuitionModalProps) {
  const { data: students, loading: studentsLoading } = useStudents();
  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    due_date: '',
    discount: '',
    late_fee: '',
    payment_method: '',
    observation: '',
    status: 'pending'
  });

  useEffect(() => {
    if (tuition) {
      setFormData({
        student_id: tuition.student_id || '',
        amount: tuition.amount || '',
        due_date: tuition.due_date || '',
        discount: tuition.discount || '',
        late_fee: tuition.late_fee || '',
        payment_method: tuition.payment_method || '',
        observation: tuition.observation || '',
        status: tuition.status || 'pending'
      });
    } else {
      // Data padrão para próximo mês, dia 10
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(10);
      
      setFormData({
        student_id: '',
        amount: '',
        due_date: nextMonth.toISOString().split('T')[0],
        discount: '',
        late_fee: '',
        payment_method: '',
        observation: '',
        status: 'pending'
      });
    }
  }, [tuition, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {tuition ? 'Editar Mensalidade' : 'Nova Mensalidade'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Aluno</label>
            <select
              value={formData.student_id}
              onChange={(e) => handleInputChange('student_id', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
              disabled={!!tuition}
            >
              <option value="">
                {studentsLoading ? 'Carregando alunos...' : 'Selecione um aluno'}
              </option>
              {students?.map((student: any) => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.school_class?.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Valor (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Vencimento</label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Desconto (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) => handleInputChange('discount', e.target.value)}
                placeholder="0,00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Taxa de Atraso (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.late_fee}
                onChange={(e) => handleInputChange('late_fee', e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="overdue">Em Atraso</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          
          {formData.status === 'paid' && (
            <div>
              <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
              <select
                value={formData.payment_method}
                onChange={(e) => handleInputChange('payment_method', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Selecione</option>
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Observação</label>
            <textarea
              value={formData.observation}
              onChange={(e) => handleInputChange('observation', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
              placeholder="Observações adicionais..."
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {tuition ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}