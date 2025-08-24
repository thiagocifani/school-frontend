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
import { educationLevelApi } from '@/lib/api';
import { EducationLevel } from '@/types';
import toast from 'react-hot-toast';

interface EducationLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  level?: EducationLevel | null;
}

export function EducationLevelModal({ isOpen, onClose, onSuccess, level }: EducationLevelModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ageRange: '',
  });
  const [loading, setLoading] = useState(false);

  // Atualizar form quando o level mudar
  useEffect(() => {
    if (level) {
      setFormData({
        name: level.name || '',
        description: level.description || '',
        ageRange: level.ageRange || '',
      });
    } else {
      resetForm();
    }
  }, [level, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        age_range: formData.ageRange || null,
      };

      if (level) {
        await educationLevelApi.update(level.id, payload);
        toast.success('Nível de ensino atualizado com sucesso!');
      } else {
        await educationLevelApi.create(payload);
        toast.success('Nível de ensino criado com sucesso!');
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar nível de ensino');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      ageRange: '',
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
            {level ? 'Editar Nível de Ensino' : 'Novo Nível de Ensino'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Nome do Nível *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Educação Infantil, Ensino Fundamental I"
                required
                className="w-full placeholder:text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="ageRange" className="block text-sm font-medium text-gray-900 mb-2">
                Faixa Etária
              </label>
              <Input
                id="ageRange"
                type="text"
                value={formData.ageRange}
                onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                placeholder="Ex: 3 a 5 anos, 6 a 10 anos"
                className="w-full placeholder:text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva as características deste nível de ensino..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400"
              />
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
              {loading ? 'Salvando...' : (level ? 'Atualizar' : 'Criar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}