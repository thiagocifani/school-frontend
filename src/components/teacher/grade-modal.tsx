'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: any;
  students: any[];
  diaryId: number;
  onSuccess: () => void;
}

export function GradeModal({ isOpen, onClose, student, students, diaryId, onSuccess }: GradeModalProps) {
  const [formData, setFormData] = useState({
    studentId: '',
    value: '',
    gradeType: '',
    date: '',
    observation: ''
  });
  const [loading, setLoading] = useState(false);

  const gradeTypes = [
    'Prova',
    'Trabalho',
    'Exercício',
    'Participação',
    'Projeto',
    'Seminário',
    'Avaliação Oral',
    'Teste'
  ];

  useEffect(() => {
    if (student) {
      setFormData({
        studentId: student.id.toString(),
        value: '',
        gradeType: '',
        date: new Date().toISOString().split('T')[0],
        observation: ''
      });
    } else {
      setFormData({
        studentId: '',
        value: '',
        gradeType: '',
        date: new Date().toISOString().split('T')[0],
        observation: ''
      });
    }
  }, [student, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar nota
      const gradeValue = parseFloat(formData.value);
      if (gradeValue < 0 || gradeValue > 10) {
        alert('A nota deve estar entre 0 e 10');
        return;
      }

      // Aqui você faria a chamada para a API
      console.log('Salvando nota:', { 
        ...formData, 
        diaryId,
        value: gradeValue
      });
      
      // Simular sucesso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Lançar Nota</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aluno
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!!student}
              >
                <option value="">Selecione um aluno</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Avaliação
              </label>
              <select
                value={formData.gradeType}
                onChange={(e) => setFormData({ ...formData, gradeType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione o tipo</option>
                {gradeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nota (0 a 10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 8.5"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data da Avaliação
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observação (Opcional)
              </label>
              <textarea
                value={formData.observation}
                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Observações sobre a avaliação"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Lançar Nota'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}