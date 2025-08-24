'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface OccurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: any;
  students: any[];
  onSuccess: () => void;
}

export function OccurrenceModal({ isOpen, onClose, student, students, onSuccess }: OccurrenceModalProps) {
  const [formData, setFormData] = useState({
    studentId: '',
    type: '',
    title: '',
    description: '',
    severity: 'low',
    date: ''
  });
  const [loading, setLoading] = useState(false);

  const occurrenceTypes = [
    { value: 'disciplinary', label: 'Disciplinar' },
    { value: 'academic', label: 'Acadêmica' },
    { value: 'behavioral', label: 'Comportamental' },
    { value: 'positive', label: 'Positiva' },
    { value: 'medical', label: 'Médica' },
    { value: 'other', label: 'Outra' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Leve' },
    { value: 'medium', label: 'Moderada' },
    { value: 'high', label: 'Grave' }
  ];

  useEffect(() => {
    if (student) {
      setFormData({
        studentId: student.id.toString(),
        type: '',
        title: '',
        description: '',
        severity: 'low',
        date: new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        studentId: '',
        type: '',
        title: '',
        description: '',
        severity: 'low',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [student, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aqui você faria a chamada para a API
      console.log('Salvando ocorrência:', formData);
      
      // Simular sucesso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar ocorrência:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Registrar Ocorrência</h2>
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
                Tipo de Ocorrência
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione o tipo</option>
                {occurrenceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gravidade
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {severityLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Ocorrência
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Conversa excessiva durante a aula"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição Detalhada
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Descreva em detalhes o que aconteceu"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data da Ocorrência
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Registrar Ocorrência'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}