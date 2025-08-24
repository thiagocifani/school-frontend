'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, Users, Calendar, TrendingUp, Plus, 
  ChevronLeft, Edit, BarChart3, GraduationCap, AlertTriangle, Save, X, Clock
} from 'lucide-react';
import { diaryApi, gradeApi } from '@/lib/api';
import { Diary, DiaryStudent, DiaryStatistics } from '@/types/diary';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DiaryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const diaryId = params.id ? Number(params.id) : null;
  
  const [diary, setDiary] = useState<Diary | null>(null);
  const [students, setStudents] = useState<DiaryStudent[]>([]);
  const [statistics, setStatistics] = useState<DiaryStatistics | null>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewLessonModal, setShowNewLessonModal] = useState(false);
  const [showNewGradeModal, setShowNewGradeModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [savingGrade, setSavingGrade] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [lessonFormData, setLessonFormData] = useState({
    topic: '',
    content: '',
    homework: '',
    date: new Date().toISOString().split('T')[0],
    durationMinutes: 50
  });
  const [gradeFormData, setGradeFormData] = useState({
    studentId: '',
    value: '',
    gradeType: '',
    date: new Date().toISOString().split('T')[0],
    observation: ''
  });

  const gradeTypes = [
    'Avaliação 1',
    'Avaliação 2', 
    'Trabalho',
    'Participação',
    'Projeto',
    'Recuperação',
    'Prova Final'
  ];

  useEffect(() => {
    if (diaryId && !isNaN(diaryId)) {
      loadDiaryData();
    } else {
      setLoading(false);
    }
  }, [diaryId]);

  const loadDiaryData = async () => {
    try {
      const [diaryRes, studentsRes, statsRes] = await Promise.all([
        diaryApi.getById(diaryId),
        diaryApi.getStudents(diaryId),
        diaryApi.getStatistics(diaryId)
      ]);
      
      setDiary(diaryRes.data);
      setStudents(studentsRes.data);
      setStatistics(statsRes.data);
      
      // Load grades for the diary
      try {
        const gradesRes = await diaryApi.getGrades(diaryId);
        setGrades(gradesRes.data);
      } catch (error) {
        console.error('Error loading grades:', error);
        setGrades([]);
      }
      
      // Update form data with loaded diary
      setFormData({
        name: diaryRes.data.name || '',
        description: diaryRes.data.description || '',
        status: diaryRes.data.status || 'active'
      });
    } catch (error) {
      console.error('Error loading diary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'completed': return 'Concluído';
      case 'archived': return 'Arquivado';
      default: return status;
    }
  };

  const handleCreateGrade = async () => {
    if (!gradeFormData.studentId || !gradeFormData.value || !gradeFormData.gradeType) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const gradeValue = parseFloat(gradeFormData.value);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 10) {
      toast.error('A nota deve ser um número entre 0 e 10');
      return;
    }

    setSavingGrade(true);
    try {
      const gradeData = {
        student_id: Number(gradeFormData.studentId),
        value: gradeValue,
        grade_type: gradeFormData.gradeType,
        date: gradeFormData.date,
        observation: gradeFormData.observation,
        diary_id: diaryId,
        academic_term_id: diary?.academicTermId || 1, // fallback para o primeiro termo acadêmico
      };
      
      console.log('Sending grade data:', gradeData);
      console.log('Diary data:', diary);
      
      await gradeApi.create(gradeData);
      
      toast.success('Nota criada com sucesso!');
      setShowNewGradeModal(false);
      
      // Reset form
      setGradeFormData({
        studentId: '',
        value: '',
        gradeType: '',
        date: new Date().toISOString().split('T')[0],
        observation: ''
      });
      
      // Reload grades
      const gradesRes = await diaryApi.getGrades(diaryId);
      setGrades(gradesRes.data);
    } catch (error: any) {
      console.error('Error creating grade:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.errors?.join(', ') || 'Erro ao criar nota';
      toast.error(errorMessage);
    } finally {
      setSavingGrade(false);
    }
  };

  const handleOpenNewGradeModal = () => {
    setGradeFormData({
      studentId: '',
      value: '',
      gradeType: '',
      date: new Date().toISOString().split('T')[0],
      observation: ''
    });
    setShowNewGradeModal(true);
  };

  const handleEditClick = () => {
    if (diary) {
      setFormData({
        name: diary.name || '',
        description: diary.description || '',
        status: diary.status || 'active'
      });
      setShowEditModal(true);
    }
  };

  const handleSave = async () => {
    if (!diaryId) return;

    setSaving(true);
    try {
      const response = await diaryApi.update(diaryId, formData);
      setDiary(response.data);
      setShowEditModal(false);
      
      // Reload data to get updated statistics
      await loadDiaryData();
    } catch (error) {
      console.error('Error updating diary:', error);
      alert('Erro ao salvar diário');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowEditModal(false);
    if (diary) {
      setFormData({
        name: diary.name || '',
        description: diary.description || '',
        status: diary.status || 'active'
      });
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
    if (!diaryId) return;

    if (!lessonFormData.topic.trim()) {
      alert('Tópico da aula é obrigatório');
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
      
      setShowNewLessonModal(false);
      
      // Reload data to get updated lesson list
      await loadDiaryData();
    } catch (error) {
      console.error('Error creating lesson:', error);
      alert('Erro ao criar aula');
    } finally {
      setSavingLesson(false);
    }
  };

  const handleCancelLesson = () => {
    setShowNewLessonModal(false);
    setLessonFormData({
      topic: '',
      content: '',
      homework: '',
      date: new Date().toISOString().split('T')[0],
      durationMinutes: 50
    });
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

  if (!diaryId || isNaN(diaryId)) {
    return (
      <div className="container mx-auto px-6">
        <div className="text-center py-12">
          <p className="text-gray-500">ID do diário inválido</p>
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{diary.name}</h1>
            <p className="text-gray-600">
              {diary.schoolClass.name} {diary.schoolClass.section} • Prof. {diary.teacher.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(diary.status)}>
            {getStatusLabel(diary.status)}
          </Badge>
          <Button 
            variant="outline" 
            className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 cursor-pointer"
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Total de Aulas</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics.totalLessons}</p>
                  <p className="text-xs text-gray-500">
                    {statistics.completedLessons} concluídas
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Alunos</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics.totalStudents}</p>
                  <p className="text-xs text-gray-500">
                    {statistics.averageAttendance}% presença média
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Notas</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics.gradesCount}</p>
                  <p className="text-xs text-gray-500">notas lançadas</p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Progresso</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics.progressPercentage}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${statistics.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="overview" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900">Visão Geral</TabsTrigger>
          <TabsTrigger value="lessons" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900">Aulas</TabsTrigger>
          <TabsTrigger value="students" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900">Alunos</TabsTrigger>
          <TabsTrigger value="grades" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900">Notas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Informações do Diário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Detalhes</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Matéria:</span>
                      <span className="text-gray-900">{diary.subject.name} ({diary.subject.code})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Turma:</span>
                      <span className="text-gray-900">{diary.schoolClass.name} {diary.schoolClass.section}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Professor:</span>
                      <span className="text-gray-900">{diary.teacher.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Período:</span>
                      <span className="text-gray-900">{diary.academicTerm.name}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Progresso</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Aulas Concluídas</span>
                      <span className="text-gray-900">{diary.completedLessons}/{diary.totalLessons}</span>
                    </div>
                    <Progress value={diary.progressPercentage} className="h-2" />
                    <p className="text-xs text-gray-500">
                      {diary.progressPercentage}% do cronograma concluído
                    </p>
                  </div>
                </div>
              </div>

              {diary.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                  <p className="text-sm text-gray-600">{diary.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Últimas Aulas</CardTitle>
            </CardHeader>
            <CardContent>
              {diary.lessons && diary.lessons.length > 0 ? (
                <div className="space-y-2">
                  {diary.lessons.slice(0, 5).map((lesson) => (
                    <div key={lesson.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Aula {lesson.lessonNumber}</p>
                        <p className="text-xs text-gray-500">{lesson.topic}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(lesson.date).toLocaleDateString('pt-BR')}
                        </p>
                        <Badge variant={lesson.status === 'completed' ? 'default' : 'secondary'}>
                          {lesson.status === 'completed' ? 'Concluída' : 'Planejada'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhuma aula cadastrada ainda.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-900">Aulas do Diário</CardTitle>
              <Button 
                onClick={handleNewLesson}
                variant="outline" 
                className="border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Aula
              </Button>
            </CardHeader>
            <CardContent>
              {diary.lessons && diary.lessons.length > 0 ? (
                <div className="space-y-4">
                  {diary.lessons.map((lesson) => (
                    <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600">
                              <span className="text-sm font-medium text-white">
                                {lesson.lessonNumber}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{lesson.topic}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(lesson.date).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {lesson.durationMinutes} min
                                </div>
                                <Badge variant={lesson.status === 'completed' ? 'default' : 'secondary'} className={lesson.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                  {lesson.status === 'completed' ? 'Concluída' : 'Planejada'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {lesson.content && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {lesson.content}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/diaries/${diary.id}/lessons/${lesson.id}`)}
                            className="h-8 w-8 p-0 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700"
                            title="Ver detalhes"
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/diaries/${diary.id}/lessons/${lesson.id}/edit`)}
                            className="h-8 w-8 p-0 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700"
                            title="Editar aula"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/diaries/${diary.id}/lessons/${lesson.id}/attendance`)}
                            className="h-8 w-8 p-0 hover:bg-green-50 text-green-600 hover:text-green-700"
                            title="Registrar presença"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">
                    Nenhuma aula cadastrada ainda
                  </p>
                  <Button 
                    onClick={handleNewLesson}
                    variant="outline" 
                    className="border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 cursor-pointer"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Aula
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Desempenho dos Alunos</CardTitle>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-500">
                          Matrícula: {student.registrationNumber}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-500">Média</p>
                          <p className="font-bold text-lg text-gray-900">
                            {student.average > 0 ? student.average.toFixed(1) : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Presença</p>
                          <p className="font-bold text-lg text-gray-900">{student.attendancePercentage}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Notas</p>
                          <p className="font-bold text-lg text-gray-900">{student.gradesCount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Nenhum aluno matriculado nesta turma.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-900">Notas dos Alunos</CardTitle>
              <Button 
                onClick={handleOpenNewGradeModal}
                variant="outline" 
                className="border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Nota
              </Button>
            </CardHeader>
            <CardContent>
              {grades && grades.length > 0 ? (
                <div className="space-y-4">
                  {grades.map((grade) => (
                    <div key={grade.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600">
                              <span className="text-sm font-medium text-white">
                                {grade.value}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{grade.student.name}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <GraduationCap className="h-4 w-4" />
                                  {grade.grade_type}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(grade.date).toLocaleDateString('pt-BR')}
                                </div>
                                <Badge className={grade.value >= 7 ? 'bg-green-100 text-green-800' : grade.value >= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                                  {grade.value >= 7 ? 'Aprovado' : grade.value >= 5 ? 'Recuperação' : 'Reprovado'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {grade.observation && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Observação:</strong> {grade.observation}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/diaries/${diary.id}/grades/${grade.id}/edit`)}
                            className="h-8 w-8 p-0 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700"
                            title="Editar nota"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">
                    Nenhuma nota lançada ainda
                  </p>
                  <Button 
                    onClick={handleOpenNewGradeModal}
                    variant="outline" 
                    className="border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Lançar Primeira Nota
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
              onClick={handleCancelLesson}
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

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Editar Diário
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Diário
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Digite o nome do diário"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Digite uma descrição para o diário"
                rows={3}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="active">Ativo</option>
                <option value="completed">Concluído</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>

            {/* Read-only information */}
            {diary && (
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Matéria
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-700 text-sm">
                      {diary.subject.name} ({diary.subject.code})
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Turma
                      </label>
                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-700 text-sm">
                        {diary.schoolClass.name} {diary.schoolClass.section}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Professor
                      </label>
                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-700 text-sm">
                        {diary.teacher.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="cursor-pointer"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 border border-indigo-300 cursor-pointer"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Grade Modal */}
      <Dialog open={showNewGradeModal} onOpenChange={setShowNewGradeModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Nova Nota
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aluno <span className="text-red-500">*</span>
              </label>
              <Select 
                value={gradeFormData.studentId} 
                onValueChange={(value) => setGradeFormData({...gradeFormData, studentId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grade Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Avaliação <span className="text-red-500">*</span>
              </label>
              <Select 
                value={gradeFormData.gradeType} 
                onValueChange={(value) => setGradeFormData({...gradeFormData, gradeType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {gradeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grade Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nota <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={gradeFormData.value}
                onChange={(e) => setGradeFormData({...gradeFormData, value: e.target.value})}
                placeholder="0.0 a 10.0"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data da Avaliação <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={gradeFormData.date}
                onChange={(e) => setGradeFormData({...gradeFormData, date: e.target.value})}
              />
            </div>

            {/* Observation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observação
              </label>
              <Textarea
                value={gradeFormData.observation}
                onChange={(e) => setGradeFormData({...gradeFormData, observation: e.target.value})}
                placeholder="Observações sobre a avaliação (opcional)"
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowNewGradeModal(false)}
              className="cursor-pointer"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleCreateGrade}
              disabled={savingGrade}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 border border-indigo-300 cursor-pointer"
            >
              <Save className="h-4 w-4 mr-2" />
              {savingGrade ? 'Salvando...' : 'Salvar Nota'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}