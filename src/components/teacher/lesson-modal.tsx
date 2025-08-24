'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Calendar, 
  BookOpen, 
  Target, 
  FileText, 
  Home, 
  Settings,
  Plus,
  Trash2
} from 'lucide-react';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson?: any;
  diaryId: number;
  onSuccess: () => void;
}

export function LessonModal({ isOpen, onClose, lesson, diaryId, onSuccess }: LessonModalProps) {
  const [formData, setFormData] = useState({
    date: '',
    topic: '',
    content: '',
    homework: '',
    status: 'planned',
    objectives: [''],
    resources: [''],
    duration: '45',
    methodology: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (lesson) {
      setFormData({
        date: lesson.date || '',
        topic: lesson.topic || '',
        content: lesson.content || '',
        homework: lesson.homework || '',
        status: lesson.status || 'planned',
        objectives: lesson.objectives || [''],
        resources: lesson.resources || [''],
        duration: lesson.duration || '45',
        methodology: lesson.methodology || ''
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        topic: '',
        content: '',
        homework: '',
        status: 'planned',
        objectives: [''],
        resources: [''],
        duration: '45',
        methodology: ''
      });
    }
  }, [lesson, isOpen]);

  const addObjective = () => {
    setFormData({ ...formData, objectives: [...formData.objectives, ''] });
  };

  const removeObjective = (index: number) => {
    const newObjectives = formData.objectives.filter((_, i) => i !== index);
    setFormData({ ...formData, objectives: newObjectives.length ? newObjectives : [''] });
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData({ ...formData, objectives: newObjectives });
  };

  const addResource = () => {
    setFormData({ ...formData, resources: [...formData.resources, ''] });
  };

  const removeResource = (index: number) => {
    const newResources = formData.resources.filter((_, i) => i !== index);
    setFormData({ ...formData, resources: newResources.length ? newResources : [''] });
  };

  const updateResource = (index: number, value: string) => {
    const newResources = [...formData.resources];
    newResources[index] = value;
    setFormData({ ...formData, resources: newResources });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty objectives and resources
      const cleanedData = {
        ...formData,
        objectives: formData.objectives.filter(obj => obj.trim() !== ''),
        resources: formData.resources.filter(res => res.trim() !== '')
      };

      console.log('Salvando aula:', { ...cleanedData, diaryId });
      
      // Simular sucesso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar aula:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      planned: { color: 'bg-blue-100 text-blue-800', label: 'Planejada' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Realizada' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelada' }
    };
    
    const { color, label } = config[status as keyof typeof config];
    return <Badge className={color}>{label}</Badge>;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {lesson ? 'Editar Aula' : 'Nova Aula'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {lesson ? 'Atualize as informações da aula' : 'Crie uma nova aula para o diário'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 sticky top-0 bg-white z-10 border-b">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Básico
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Conteúdo
                </TabsTrigger>
                <TabsTrigger value="planning" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Planejamento
                </TabsTrigger>
                <TabsTrigger value="homework" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Tarefa
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data da Aula *
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
                      Duração (minutos)
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="50">50 min</option>
                      <option value="60">1 hora</option>
                      <option value="90">1h 30min</option>
                      <option value="120">2 horas</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tópico da Aula *
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Frações - Conceitos básicos"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status da Aula
                  </label>
                  <div className="flex gap-4">
                    {['planned', 'completed', 'cancelled'].map((status) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={formData.status === status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="text-blue-600"
                        />
                        {getStatusBadge(status)}
                      </label>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conteúdo da Aula *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="Descreva o conteúdo que foi ou será ministrado na aula..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metodologia
                  </label>
                  <textarea
                    value={formData.methodology}
                    onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Como o conteúdo será ou foi apresentado? (ex: aula expositiva, atividades práticas, discussão em grupo...)"
                  />
                </div>
              </TabsContent>

              {/* Planning Tab */}
              <TabsContent value="planning" className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Objetivos da Aula
                    </label>
                    <Button type="button" size="sm" onClick={addObjective} variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.objectives.map((objective, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={objective}
                          onChange={(e) => updateObjective(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Objetivo ${index + 1}`}
                        />
                        {formData.objectives.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeObjective(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Recursos Necessários
                    </label>
                    <Button type="button" size="sm" onClick={addResource} variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.resources.map((resource, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={resource}
                          onChange={(e) => updateResource(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Recurso ${index + 1} (ex: quadro, projetor, livro...)`}
                        />
                        {formData.resources.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeResource(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Homework Tab */}
              <TabsContent value="homework" className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarefa para Casa
                  </label>
                  <textarea
                    value={formData.homework}
                    onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="Descreva a tarefa para casa (exercícios, leituras, pesquisas...)"
                  />
                </div>

                {formData.homework && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Preview da Tarefa:</h4>
                    <p className="text-sm text-blue-800">{formData.homework}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                * Campos obrigatórios
              </div>
              
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Salvando...' : (lesson ? 'Atualizar Aula' : 'Criar Aula')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}