'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Edit, Users, Calendar, Clock, BookOpen, 
  CheckCircle, Play, XCircle, AlertTriangle, UserCheck, UserX, UserMinus, Heart
} from 'lucide-react';
import { diaryApi } from '@/lib/api';
import { Lesson, LessonAttendance } from '@/types/diary';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LessonDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const diaryId = Number(params.id);
  const lessonId = Number(params.lessonId);
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [attendances, setAttendances] = useState<LessonAttendance[]>([]);
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (diaryId && lessonId) {
      loadLessonData();
    }
  }, [diaryId, lessonId]);

  const loadLessonData = async () => {
    try {
      const [lessonRes, attendancesRes] = await Promise.all([
        diaryApi.getLesson(diaryId, lessonId),
        diaryApi.getLessonAttendances(diaryId, lessonId)
      ]);
      
      setLesson(lessonRes.data);
      setAttendances(attendancesRes.data);
      
      // Load occurrences for the lesson date
      if (lessonRes.data?.date) {
        try {
          const occurrencesRes = await diaryApi.getOccurrences(diaryId, lessonRes.data.date);
          setOccurrences(occurrencesRes.data);
        } catch (error) {
          console.error('Error loading occurrences:', error);
          setOccurrences([]);
        }
      }
    } catch (error) {
      console.error('Error loading lesson data:', error);
      toast.error('Erro ao carregar dados da aula');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!lesson) return;
    
    try {
      await diaryApi.completeLesson(diaryId, lessonId);
      toast.success('Aula marcada como concluída!');
      await loadLessonData();
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('Erro ao concluir aula');
    }
  };

  const handleCancelLesson = async () => {
    if (!lesson) return;
    
    if (confirm('Deseja realmente cancelar esta aula?')) {
      try {
        await diaryApi.cancelLesson(diaryId, lessonId);
        toast.success('Aula cancelada!');
        await loadLessonData();
      } catch (error) {
        console.error('Error canceling lesson:', error);
        toast.error('Erro ao cancelar aula');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      case 'planned': return 'Planejada';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      case 'planned': return Play;
      default: return AlertTriangle;
    }
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'present': return UserCheck;
      case 'absent': return UserX;
      case 'late': return UserMinus;
      case 'justified': return CheckCircle;
      default: return UserCheck;
    }
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'justified': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceLabel = (status: string) => {
    switch (status) {
      case 'present': return 'Presente';
      case 'absent': return 'Ausente';
      case 'late': return 'Atrasado';
      case 'justified': return 'Justificado';
      default: return status;
    }
  };

  const getOccurrenceIcon = (type: string) => {
    switch (type) {
      case 'disciplinary': return AlertTriangle;
      case 'medical': return Heart;
      case 'positive': return CheckCircle;
      default: return AlertTriangle;
    }
  };

  const getOccurrenceColor = (type: string) => {
    switch (type) {
      case 'disciplinary': return 'bg-red-100 text-red-800';
      case 'medical': return 'bg-blue-100 text-blue-800';
      case 'positive': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-600">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-gray-900">Aula não encontrada</p>
          <Button 
            variant="outline" 
            onClick={() => router.push(`/dashboard/diaries/${diaryId}`)}
            className="mt-4"
          >
            Voltar ao Diário
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(lesson.status);
  const presentCount = attendances.filter(a => a.status === 'present').length;
  const absentCount = attendances.filter(a => a.status === 'absent').length;
  const attendancePercentage = attendances.length > 0 ? (presentCount / attendances.length * 100) : 0;

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/dashboard/diaries/${diaryId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Aula {lesson.lessonNumber}: {lesson.topic}
          </h1>
          <p className="text-gray-600">
            {new Date(lesson.date).toLocaleDateString('pt-BR')} • {lesson.durationMinutes} minutos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(lesson.status)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {getStatusLabel(lesson.status)}
          </Badge>
          <Link href={`/dashboard/diaries/${diaryId}/lessons/${lessonId}/edit`}>
            <Button variant="outline" className="border-indigo-300 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lesson Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Detalhes da Aula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Data</p>
                    <p className="font-medium text-gray-900">
                      {new Date(lesson.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Duração</p>
                    <p className="font-medium text-gray-900">{lesson.durationMinutes} minutos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Número</p>
                    <p className="font-medium text-gray-900">Aula {lesson.lessonNumber}</p>
                  </div>
                </div>
              </div>

              {lesson.content && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Conteúdo</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{lesson.content}</p>
                </div>
              )}

              {lesson.homework && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tarefa de Casa</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{lesson.homework}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Details */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-900">Presença dos Alunos</CardTitle>
              <Link href={`/dashboard/diaries/${diaryId}/lessons/${lessonId}/attendance`}>
                <Button variant="outline" className="border-green-300 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800">
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Presença
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {/* Summary Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                  <p className="text-xs text-gray-600">Presentes</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                  <p className="text-xs text-gray-600">Ausentes</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{attendances.length}</div>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{Math.round(attendancePercentage)}%</div>
                  <p className="text-xs text-gray-600">Presença</p>
                </div>
              </div>

              {/* Attendance List */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 mb-3">Lista de Presença</h4>
                {attendances.map((attendance) => {
                  const AttendanceIcon = getAttendanceIcon(attendance.status);
                  
                  return (
                    <div key={attendance.student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600">
                          <span className="text-sm font-medium text-white">
                            {attendance.student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{attendance.student.name}</p>
                          <p className="text-sm text-gray-500">{attendance.student.registrationNumber}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={getAttendanceColor(attendance.status)}>
                          <AttendanceIcon className="h-3 w-3 mr-1" />
                          {getAttendanceLabel(attendance.status)}
                        </Badge>
                        {attendance.observation && (
                          <div className="text-sm text-gray-600 max-w-48 truncate" title={attendance.observation}>
                            {attendance.observation}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Occurrences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Ocorrências do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              {occurrences && occurrences.length > 0 ? (
                <div className="space-y-3">
                  {occurrences.map((occurrence) => {
                    const OccurrenceIcon = getOccurrenceIcon(occurrence.occurrence_type);
                    
                    return (
                      <div key={occurrence.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                            <OccurrenceIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{occurrence.title}</h4>
                              <Badge className={getOccurrenceColor(occurrence.occurrence_type)}>
                                {occurrence.occurrence_type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{occurrence.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Aluno: {occurrence.student.name}</span>
                              <span>Professor: {occurrence.teacher.name}</span>
                              <span>Data: {new Date(occurrence.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhuma ocorrência registrada para esta data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lesson.status !== 'completed' && (
                <Button 
                  onClick={handleCompleteLesson}
                  variant="outline" 
                  className="w-full border-green-300 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Concluída
                </Button>
              )}
              
              {lesson.status !== 'cancelled' && (
                <Button 
                  onClick={handleCancelLesson}
                  variant="outline" 
                  className="w-full border-red-300 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar Aula
                </Button>
              )}
              
              <Link href={`/dashboard/diaries/${diaryId}/lessons/${lessonId}/attendance`}>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Registrar Presença
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className={getStatusColor(lesson.status)}>
                  {getStatusLabel(lesson.status)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Presença:</span>
                <span className="font-medium text-gray-900">{Math.round(attendancePercentage)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Alunos:</span>
                <span className="font-medium text-gray-900">{attendances.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}