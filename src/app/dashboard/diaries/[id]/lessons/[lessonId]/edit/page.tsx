'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { diaryApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const diaryId = Number(params.id);
  const lessonId = Number(params.lessonId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [homework, setHomework] = useState('');
  const [date, setDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');

  useEffect(() => {
    if (diaryId && lessonId) {
      loadLesson();
    }
  }, [diaryId, lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const { data } = await diaryApi.getLesson(diaryId, lessonId);
      setTopic(data.topic || '');
      setContent(data.content || '');
      setHomework(data.homework || '');
      setDurationMinutes(typeof data.durationMinutes === 'number' ? data.durationMinutes : '');
      // Convert ISO date to yyyy-MM-dd
      if (data.date) {
        const d = new Date(data.date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setDate(`${yyyy}-${mm}-${dd}`);
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      toast.error('Erro ao carregar a aula');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await diaryApi.updateLesson(diaryId, lessonId, {
        topic,
        content,
        homework,
        duration_minutes: typeof durationMinutes === 'number' ? durationMinutes : undefined,
        date: date ? new Date(date).toISOString() : undefined,
      });
      toast.success('Aula atualizada com sucesso!');
      router.push(`/dashboard/diaries/${diaryId}/lessons/${lessonId}`);
    } catch (error: any) {
      console.error('Error updating lesson:', error);
      const msg = error?.response?.data?.message || 'Erro ao atualizar a aula';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="container mx-auto px-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/diaries/${diaryId}/lessons/${lessonId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Aula</h1>
          <p className="text-gray-600">Atualize as informações desta aula</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Aula</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tópico *</label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ex: Frações - Introdução" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
              <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Detalhe o conteúdo abordado" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tarefa de Casa</label>
              <Textarea rows={3} value={homework} onChange={(e) => setHomework(e.target.value)} placeholder="Descreva a tarefa de casa (se houver)" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duração (min)</label>
                <Input
                  type="number"
                  min={0}
                  value={durationMinutes === '' ? '' : durationMinutes}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDurationMinutes(val === '' ? '' : Number(val));
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/diaries/${diaryId}/lessons/${lessonId}`)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 border border-indigo-300">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
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


