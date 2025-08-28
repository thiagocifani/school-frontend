'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, ChevronLeft, Calendar, Clock, Users, 
  CheckCircle, XCircle, Edit, Eye, Play, Square, UserCheck, TrendingUp, Save, X
} from 'lucide-react';
import { diaryApi } from '@/lib/api';
import { Diary, Lesson } from '@/types/diary';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DiaryLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const diaryId = Number(params.id);
  
  const [diary, setDiary] = useState<Diary | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewLessonModal, setShowNewLessonModal] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [lessonFormData, setLessonFormData] = useState({
    topic: '',
    content: '',
    homework: '',
    date: new Date().toISOString().split('T')[0],
    durationMinutes: 50
  });

  useEffect(() => {
    loadData();
  }, [diaryId]);

  const loadData = async () => {
    try {
      const [diaryRes, lessonsRes] = await Promise.all([
        diaryApi.getById(diaryId),
        diaryApi.getLessons(diaryId)
      ]);
      
      setDiary(diaryRes.data);
      setLessons(lessonsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async (lessonId: number) => {
    try {
      await diaryApi.completeLesson(diaryId, lessonId);
      loadData(); // Reload to update status
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const handleCancelLesson = async (lessonId: number) => {
    try {
      await diaryApi.cancelLesson(diaryId, lessonId);
      loadData(); // Reload to update status
    } catch (error) {
      console.error('Error cancelling lesson:', error);
    }
  };

  const handleNewLesson = () => {
    setLessonFormData({
      topic: '',
      content: '',
      homework: '',
      date: new Date().toISOString().split('T')[0],
      durationMinutes: 50
    });
    setShowNewLessonModal(true);
  };

  const handleSaveLesson = async () => {
    if (!lessonFormData.topic.trim()) {
      toast.error('Tópico da aula é obrigatório');
      return;
    }

    setSavingLesson(true);
    try {
      await diaryApi.createLesson(diaryId, {
        topic: lessonFormData.topic,
        content: lessonFormData.content,
        homework: lessonFormData.homework,
        date: lessonFormData.date,
        duration_minutes: lessonFormData.durationMinutes,
        status: 'planned'
      });
      
      toast.success('Aula criada com sucesso!');
      setShowNewLessonModal(false);
      
      // Reload data to get updated lesson list
      await loadData();
    } catch (error: any) {
      console.error('Error creating lesson:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao criar aula';
      toast.error(errorMessage);
    } finally {
      setSavingLesson(false);
    }
  };

  const handleCancelNewLesson = () => {
    setShowNewLessonModal(false);
    setLessonFormData({
      topic: '',
      content: '',
      homework: '',
      date: new Date().toISOString().split('T')[0],
      durationMinutes: 50
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'planned': return 'Planejada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'planned': return Clock;
      case 'cancelled': return XCircle;
      default: return Clock;
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
  
  if (!diary) {
    return (
      <div className="container mx-auto px-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Diário não encontrado</p>
        </div>
      </div>
    );
  }

  const completedLessons = lessons.filter(l => l.status === 'completed').length;
  const plannedLessons = lessons.filter(l => l.status === 'planned').length;
  const cancelledLessons = lessons.filter(l => l.status === 'cancelled').length;
  const progressPercentage = lessons.length > 0 ? (completedLessons / lessons.length * 100) : 0;

  return (
    <div className="container mx-auto px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Aulas - {diary.name}</h1>
            <p className="text-sm sm:text-base text-gray-600">
              {diary.schoolClass.name} {diary.schoolClass.section} • {diary.subject.name}
            </p>
          </div>
        </div>
        <Button 
          onClick={handleNewLesson}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 border border-indigo-300 cursor-pointer w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Aula
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total de Aulas</p>
                <p className="text-3xl font-bold text-gray-900">{lessons.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Concluídas</p>
                <p className="text-3xl font-bold text-gray-900">{completedLessons}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Planejadas</p>
                <p className="text-3xl font-bold text-gray-900">{plannedLessons}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Progresso</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(progressPercentage)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        {lessons.length > 0 ? (
          lessons.map((lesson) => {
            const StatusIcon = getStatusIcon(lesson.status);
            
            return (
              <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600">
                        <span className="text-lg font-bold text-white">
                          {lesson.lessonNumber}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{lesson.topic}</h3>
                          <Badge className={getStatusColor(lesson.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getStatusLabel(lesson.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {lesson.content}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(lesson.date).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {lesson.durationMinutes} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {lesson.attendanceSummary.present_percentage}% presença
                          </div>
                        </div>
                        
                        {lesson.homework && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            <strong>Tarefa:</strong> {lesson.homework}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-2">
                      {lesson.status === 'planned' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteLesson(lesson.id)}
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                      )}
                      
                      {lesson.status === 'planned' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelLesson(lesson.id)}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <Square className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => router.push(`/dashboard/diaries/${diaryId}/lessons/${lesson.id}/attendance`)}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-transparent cursor-pointer"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Presença
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => router.push(`/dashboard/diaries/${diaryId}/lessons/${lesson.id}`)}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-transparent cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => router.push(`/dashboard/diaries/${diaryId}/lessons/${lesson.id}/edit`)}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-transparent cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                    
                    {/* Mobile Actions - Primary actions only, icons only */}
                    <div className="flex lg:hidden items-center gap-1">
                      {lesson.status === 'planned' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteLesson(lesson.id)}
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50 p-2"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => router.push(`/dashboard/diaries/${diaryId}/lessons/${lesson.id}/attendance`)}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-2"
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => router.push(`/dashboard/diaries/${diaryId}/lessons/${lesson.id}`)}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-2"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => router.push(`/dashboard/diaries/${diaryId}/lessons/${lesson.id}/edit`)}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma aula cadastrada
              </h3>
              <p className="text-gray-500 mb-4">
                Comece criando a primeira aula deste diário.
              </p>
              <Button 
                onClick={handleNewLesson}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 border border-indigo-300 cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Aula
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Lesson Modal */}
      <Dialog open={showNewLessonModal} onOpenChange={setShowNewLessonModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nova Aula
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tópico da Aula *
              </label>
              <Input
                value={lessonFormData.topic}
                onChange={(e) => setLessonFormData({ ...lessonFormData, topic: e.target.value })}
                placeholder="Ex: Introdução aos números decimais"
                className="w-full"
                required
              />
            </div>

            {/* Date and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Data da Aula *
                </label>
                <Input
                  type="date"
                  value={lessonFormData.date}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, date: e.target.value })}
                  className="w-full"
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
                  value={lessonFormData.durationMinutes}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, durationMinutes: Number(e.target.value) })}
                  placeholder="50"
                  min="1"
                  max="300"
                  className="w-full"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo da Aula
              </label>
              <Textarea
                value={lessonFormData.content}
                onChange={(e) => setLessonFormData({ ...lessonFormData, content: e.target.value })}
                placeholder="Descreva o conteúdo que será abordado na aula..."
                rows={4}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Detalhe os tópicos e conceitos que serão trabalhados
              </p>
            </div>

            {/* Homework */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarefa de Casa (opcional)
              </label>
              <Textarea
                value={lessonFormData.homework}
                onChange={(e) => setLessonFormData({ ...lessonFormData, homework: e.target.value })}
                placeholder="Descreva a tarefa de casa para os alunos..."
                rows={3}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Atividades e exercícios para reforçar o aprendizado
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCancelNewLesson}
              className="cursor-pointer"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSaveLesson}
              disabled={savingLesson}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 border border-indigo-300 cursor-pointer"
            >
              {savingLesson ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Aula
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}