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
import { gradeLevelApi } from '@/lib/api';
import { GradeLevel, EducationLevel } from '@/types';
import toast from 'react-hot-toast';

interface GradeLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  grade?: GradeLevel | null;
  educationLevels: EducationLevel[];
}

export function GradeLevelModal({ isOpen, onClose, onSuccess, grade, educationLevels }: GradeLevelModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    educationLevelId: '',
    order: '',
  });
  const [loading, setLoading] = useState(false);

  // Atualizar form quando o grade mudar
  useEffect(() => {
    if (grade) {
      setFormData({
        name: grade.name || '',
        educationLevelId: grade.educationLevel.id.toString() || '',
        order: grade.order.toString() || '',
      });
    } else {
      resetForm();
    }
  }, [grade, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        education_level_id: parseInt(formData.educationLevelId),
        order: parseInt(formData.order),
      };

      if (grade) {
        await gradeLevelApi.update(grade.id, payload);
        toast.success('Série atualizada com sucesso!');
      } else {
        await gradeLevelApi.create(payload);
        toast.success('Série criada com sucesso!');
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar série');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      educationLevelId: '',
      order: '',
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {grade ? 'Editar Série' : 'Nova Série'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Nome da Série *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Infantil I, 1º Ano, 2º Ano"
                required
                className="w-full placeholder:text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="educationLevelId" className="block text-sm font-medium text-gray-900 mb-2">
                Nível de Ensino *
              </label>
              <select
                id="educationLevelId"
                value={formData.educationLevelId}
                onChange={(e) => setFormData({ ...formData, educationLevelId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Selecione um nível de ensino</option>
                {educationLevels.map(level => (
                  <option key={level.id} value={level.id.toString()}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-900 mb-2">
                Ordem *
              </label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                placeholder="1, 2, 3..."
                required
                min="1"
                className="w-full placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Define a ordem de exibição da série dentro do nível de ensino
              </p>
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
              {loading ? 'Salvando...' : (grade ? 'Atualizar' : 'Criar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}