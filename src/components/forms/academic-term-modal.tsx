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
import { academicTermApi } from '@/lib/api';
import { AcademicTerm } from '@/types';
import toast from 'react-hot-toast';

interface AcademicTermModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  term?: AcademicTerm | null;
}

export function AcademicTermModal({ isOpen, onClose, onSuccess, term }: AcademicTermModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    termType: 'bimester',
    year: new Date().getFullYear().toString(),
    active: false,
  });
  const [loading, setLoading] = useState(false);

  // Atualizar form quando o term mudar
  useEffect(() => {
    if (term) {
      setFormData({
        name: term.name || '',
        startDate: term.startDate || '',
        endDate: term.endDate || '',
        termType: term.termType || 'bimester',
        year: term.year.toString() || new Date().getFullYear().toString(),
        active: term.active || false,
      });
    } else {
      resetForm();
    }
  }, [term, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        start_date: formData.startDate,
        end_date: formData.endDate,
        term_type: formData.termType,
        year: parseInt(formData.year),
        active: formData.active,
      };

      if (term) {
        await academicTermApi.update(term.id, payload);
        toast.success('Etapa atualizada com sucesso!');
      } else {
        await academicTermApi.create(payload);
        toast.success('Etapa criada com sucesso!');
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar etapa');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      termType: 'bimester',
      year: new Date().getFullYear().toString(),
      active: false,
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
            {term ? 'Editar Etapa' : 'Nova Etapa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Nome da Etapa *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: 1º Bimestre 2024"
                required
                className="w-full placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="termType" className="block text-sm font-medium text-gray-900 mb-2">
                  Tipo *
                </label>
                <select
                  id="termType"
                  value={formData.termType}
                  onChange={(e) => setFormData({ ...formData, termType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="bimester">Bimestre</option>
                  <option value="quarter">Trimestre</option>
                  <option value="semester">Semestre</option>
                </select>
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-900 mb-2">
                  Ano *
                </label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024"
                  required
                  className="w-full placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-900 mb-2">
                  Data de Início *
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="w-full placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-900 mb-2">
                  Data de Fim *
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  className="w-full placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-900">
                Definir como etapa ativa
              </label>
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
              {loading ? 'Salvando...' : (term ? 'Atualizar' : 'Criar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}