'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { teacherApi } from '@/lib/api';
import { Teacher } from '@/types';
import toast from 'react-hot-toast';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teacher?: Teacher | null;
}

export function TeacherModal({ isOpen, onClose, onSuccess, teacher }: TeacherModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    salary: '',
    hireDate: '',
    specialization: '',
    status: 'active',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  // Atualizar form quando o teacher mudar
  useEffect(() => {
    if (teacher && teacher.user) {
      setFormData({
        name: teacher.user.name || '',
        email: teacher.user.email || '',
        phone: teacher.user.phone || '',
        cpf: teacher.user.cpf || '',
        salary: teacher.salary?.toString() || '',
        hireDate: teacher.hireDate || '',
        specialization: teacher.specialization || '',
        status: teacher.status || 'active',
        password: '',
      });
    } else {
      resetForm();
    }
  }, [teacher, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For new teachers, password is required
      if (!teacher && !formData.password) {
        toast.error('Senha é obrigatória para novos professores');
        setLoading(false);
        return;
      }

      const payload = {
        user_attributes: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf,
          role: 'teacher',
          // For new teachers, always include password; for updates, only if provided
          ...((!teacher || formData.password) && { password: formData.password }),
        },
        salary: parseFloat(formData.salary) || 0,
        hire_date: formData.hireDate,
        specialization: formData.specialization,
        status: formData.status,
      };

      console.log('🐛 DEBUG - Teacher form payload:', payload);

      if (teacher) {
        await teacherApi.update(teacher.id, payload);
        toast.success('Professor atualizado com sucesso!');
      } else {
        await teacherApi.create(payload);
        toast.success('Professor criado com sucesso!');
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error saving teacher:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.errors?.join(', ') || 'Erro ao salvar professor';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      salary: '',
      hireDate: '',
      specialization: '',
      status: 'active',
      password: '',
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {teacher ? 'Editar Professor' : 'Novo Professor'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                  Nome Completo *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Digite o nome do professor"
                  required
                  className="w-full placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="professor@escola.com"
                  required
                  className="w-full placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                  Telefone
                </label>
                <Input
                  id="phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-900 mb-2">
                  CPF
                </label>
                <Input
                  id="cpf"
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  className="w-full placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-900 mb-2">
                  Salário *
                </label>
                <Input
                  id="salary"
                  type="number"
                  step="0.01"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="0.00"
                  required
                  className="w-full placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="hireDate" className="block text-sm font-medium text-gray-900 mb-2">
                  Data de Contratação
                </label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  className="w-full placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-900 mb-2">
                  Especialização
                </label>
                <Input
                  id="specialization"
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="Ex: Matemática, Português"
                  className="w-full placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-900 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                  {teacher ? 'Nova Senha (opcional)' : 'Senha *'}
                </label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Digite a senha"
                  required={!teacher}
                  className="w-full placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? 'Salvando...' : (teacher ? 'Atualizar' : 'Criar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}