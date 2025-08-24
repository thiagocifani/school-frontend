'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { diaryApi } from '@/lib/api';
import { Diary } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Calendar, Clock, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewLessonPage() {
  const params = useParams();
  const router = useRouter();
  const diaryId = Number(params.id);
  
  const [diary, setDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Today's date
    topic: '',
    content: '',
    homework: '',
    durationMinutes: 50, // Default class duration
  });

  useEffect(() => {
    loadDiary();
  }, [diaryId]);

  const loadDiary = async () => {
    try {
      const { data } = await diaryApi.getById(diaryId);
      setDiary(data);
    } catch (error) {
      console.error('Error loading diary:', error);
      toast.error('Erro ao carregar diário');
      router.push('/dashboard/diaries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic.trim()) {
      toast.error('Tópico da aula é obrigatório');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Conteúdo da aula é obrigatório');
      return;
    }

    setSaving(true);
    try {
      await diaryApi.createLesson(diaryId, formData);
      toast.success('Aula criada com sucesso!');
      router.push(`/dashboard/diaries/${diaryId}/lessons`);
    } catch (error: any) {
      console.error('Error creating lesson:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao criar aula';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!diary) {
    return (
      <div className="container mx-auto px-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Diário não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/dashboard/diaries/${diaryId}/lessons`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nova Aula</h1>
          <p className="text-gray-600">
            {diary.subject.name} - {diary.schoolClass.name} {diary.schoolClass.section}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Informações da Aula
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Duration Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Data da Aula
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Duração (minutos)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="300"
                  value={formData.durationMinutes}
                  onChange={(e) => handleInputChange('durationMinutes', Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tópico da Aula *
              </label>
              <Input
                value={formData.topic}
                onChange={(e) => handleInputChange('topic', e.target.value)}
                placeholder="Ex: Introdução aos números naturais"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Descreva o assunto principal que será abordado na aula
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Conteúdo da Aula *
              </label>
              <Textarea
                rows={6}
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Descreva detalhadamente o que será ensinado nesta aula..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Detalhe os conceitos, atividades e métodos que serão utilizados
              </p>
            </div>

            {/* Homework */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tarefa de Casa (opcional)
              </label>
              <Textarea
                rows={3}
                value={formData.homework}
                onChange={(e) => handleInputChange('homework', e.target.value)}
                placeholder="Descreva as atividades que os alunos devem fazer em casa..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Liste exercícios, leituras ou projetos para serem feitos pelos alunos
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/diaries/${diaryId}/lessons`)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Criar Aula
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}