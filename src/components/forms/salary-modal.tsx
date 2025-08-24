'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { useTeachers } from '@/hooks/useTeachers';

interface SalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  salary?: any;
}

const months = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

export function SalaryModal({ isOpen, onClose, onSave, salary }: SalaryModalProps) {
  const { data: teachers, loading: teachersLoading } = useTeachers();
  const [formData, setFormData] = useState({
    teacher_id: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    bonus: '',
    deductions: '',
    status: 'pending'
  });

  useEffect(() => {
    if (salary) {
      setFormData({
        teacher_id: salary.teacher_id || '',
        amount: salary.amount || '',
        month: salary.month || new Date().getMonth() + 1,
        year: salary.year || new Date().getFullYear(),
        bonus: salary.bonus || '',
        deductions: salary.deductions || '',
        status: salary.status || 'pending'
      });
    } else {
      setFormData({
        teacher_id: '',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        bonus: '',
        deductions: '',
        status: 'pending'
      });
    }
  }, [salary, isOpen]);

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
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {salary ? 'Editar Salário' : 'Novo Salário'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Professor</label>
            <select
              value={formData.teacher_id}
              onChange={(e) => handleInputChange('teacher_id', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
              disabled={!!salary}
            >
              <option value="">
                {teachersLoading ? 'Carregando professores...' : 'Selecione um professor'}
              </option>
              {teachers?.map((teacher: any) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mês</label>
              <select
                value={formData.month}
                onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Ano</label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                min="2020"
                max="2030"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Valor Base (R$)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0,00"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bônus (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.bonus}
                onChange={(e) => handleInputChange('bonus', e.target.value)}
                placeholder="0,00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Descontos (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.deductions}
                onChange={(e) => handleInputChange('deductions', e.target.value)}
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
            </select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {salary ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}