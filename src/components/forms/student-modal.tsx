'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  ResponsiveForm, 
  FormGrid, 
  FormField, 
  FormLabel, 
  ResponsiveInput, 
  ResponsiveSelect, 
  FormActions 
} from '@/components/ui/responsive-form';
import { ResponsiveButton, ResponsiveButtonGroup } from '@/components/ui/responsive-button';
import { studentApi } from '@/lib/api';
import { Student } from '@/types';
import toast from 'react-hot-toast';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student?: Student | null;
}

export function StudentModal({ isOpen, onClose, onSuccess, student }: StudentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    registrationNumber: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);

  // Atualizar form quando o student mudar
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        birthDate: student.birthDate || '',
        registrationNumber: student.registrationNumber || '',
        status: student.status || 'active',
      });
    } else {
      resetForm();
    }
  }, [student, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (student) {
        await studentApi.update(student.id, formData);
        toast.success('Aluno atualizado com sucesso!');
      } else {
        await studentApi.create(formData);
        toast.success('Aluno criado com sucesso!');
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar aluno');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      birthDate: '',
      registrationNumber: '',
      status: 'active',
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-lg sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
            {student ? 'Editar Aluno' : 'Novo Aluno'}
          </DialogTitle>
        </DialogHeader>

        <ResponsiveForm onSubmit={handleSubmit}>
          <FormField>
            <FormLabel htmlFor="name" required>Nome Completo</FormLabel>
            <ResponsiveInput
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Digite o nome do aluno"
              required
            />
          </FormField>

          <FormGrid cols={2}>
            <FormField>
              <FormLabel htmlFor="birthDate">Data de Nascimento</FormLabel>
              <ResponsiveInput
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="registrationNumber">Matrícula</FormLabel>
              <ResponsiveInput
                id="registrationNumber"
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                placeholder="Ex: 2025001"
              />
            </FormField>
          </FormGrid>

          <FormField>
            <FormLabel htmlFor="status">Status</FormLabel>
            <ResponsiveSelect
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { value: 'active', label: 'Ativo' },
                { value: 'inactive', label: 'Inativo' },
                { value: 'transferred', label: 'Transferido' }
              ]}
            />
          </FormField>

          <FormActions>
            <ResponsiveButtonGroup>
              <ResponsiveButton
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </ResponsiveButton>
              <ResponsiveButton
                type="submit"
                variant="primary"
                disabled={loading}
                loading={loading}
              >
                {student ? 'Atualizar' : 'Criar'}
              </ResponsiveButton>
            </ResponsiveButtonGroup>
          </FormActions>
        </ResponsiveForm>
      </DialogContent>
    </Dialog>
  );
}