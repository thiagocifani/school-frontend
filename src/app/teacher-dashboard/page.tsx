'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  GraduationCap,
  AlertTriangle,
  Calendar,
  Clock,
  TrendingUp
} from 'lucide-react';
import { teacherApi, diaryApi, gradeApi, occurrenceApi } from '@/lib/api';

interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  todayLessons: number;
  pendingGrades: number;
  recentOccurrences: number;
  upcomingLessons: any[];
  recentActivities: any[];
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TeacherStats>({
    totalClasses: 0,
    totalStudents: 0,
    todayLessons: 0,
    pendingGrades: 0,
    recentOccurrences: 0,
    upcomingLessons: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeacherStats();
  }, [user]);

  const loadTeacherStats = async () => {
    try {
      setLoading(true);
      
      if (!user?.teacher?.id) {
        console.warn('Teacher ID not found');
        setLoading(false);
        return;
      }
      
      // Buscar dados reais do professor
      const { data: teacherData } = await teacherApi.getById(user.teacher.id);
      
      // Calcular estatísticas baseadas nos dados reais
      const totalClasses = (teacherData.classes || []).length;
      const totalStudents = (teacherData.classes || []).reduce(
        (sum: number, cls: any) => sum + (cls.students_count || 0), 0
      );
      
      // Buscar diários do professor
      const { data: diariesData } = await diaryApi.getAll({ teacher_id: user.teacher.id });
      
      // Buscar aulas de hoje
      const today = new Date().toISOString().split('T')[0];
      const upcomingLessons: any[] = [];
      
      for (const diary of diariesData || []) {
        try {
          const { data: lessonsData } = await diaryApi.getLessons(diary.id, { date: today });
          for (const lesson of lessonsData || []) {
            upcomingLessons.push({
              id: lesson.id,
              subject: diary.subject?.name || 'Disciplina',
              class: `${diary.schoolClass?.gradeLevel?.name || ''} ${diary.schoolClass?.name || ''}`.trim(),
              time: lesson.time || '08:00',
              topic: lesson.topic || 'Aula do dia'
            });
          }
        } catch (err) {
          console.warn('Erro ao carregar aulas do diário', diary.id);
        }
      }
      
      // Buscar atividades recentes (últimas 7 dias)
      const recentActivities: any[] = [];
      
      try {
        // Buscar notas recentes
        const { data: gradesData } = await gradeApi.getAll({ 
          teacher_id: user.teacher.id,
          limit: 5
        });
        
        (gradesData || []).forEach((grade: any) => {
          recentActivities.push({
            id: `grade_${grade.id}`,
            type: 'grade',
            description: `Nota lançada para ${grade.student?.name || 'aluno'} - ${grade.subject?.name || 'disciplina'}`,
            time: grade.created_at ? new Date(grade.created_at).toLocaleDateString('pt-BR') : 'Recente'
          });
        });
      } catch (err) {
        console.warn('Erro ao carregar notas recentes');
      }
      
      try {
        // Buscar ocorrências recentes
        const { data: occurrencesData } = await occurrenceApi.getAll({ 
          teacher_id: user.teacher.id,
          limit: 5
        });
        
        (occurrencesData || []).forEach((occurrence: any) => {
          recentActivities.push({
            id: `occurrence_${occurrence.id}`,
            type: 'occurrence',
            description: `Ocorrência registrada - ${occurrence.student?.name || 'aluno'}`,
            time: occurrence.date ? new Date(occurrence.date).toLocaleDateString('pt-BR') : 'Recente'
          });
        });
      } catch (err) {
        console.warn('Erro ao carregar ocorrências recentes');
      }
      
      // Ordenar atividades por data (mais recentes primeiro)
      recentActivities.sort((a, b) => {
        const dateA = new Date(a.time);
        const dateB = new Date(b.time);
        return dateB.getTime() - dateA.getTime();
      });
      
      setStats({
        totalClasses,
        totalStudents,
        todayLessons: upcomingLessons.length,
        pendingGrades: 0, // Será calculado baseado em aulas sem notas
        recentOccurrences: recentActivities.filter(a => a.type === 'occurrence').length,
        upcomingLessons: upcomingLessons.slice(0, 5),
        recentActivities: recentActivities.slice(0, 10)
      });
      
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Aqui está um resumo das suas atividades de hoje
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Turmas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalClasses}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total de Alunos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Aulas Hoje</p>
                <p className="text-3xl font-bold text-gray-900">{stats.todayLessons}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Notas Pendentes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingGrades}</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Aulas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Aulas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingLessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{lesson.subject}</p>
                    <p className="text-sm text-gray-600">{lesson.class}</p>
                    <p className="text-sm text-gray-500">Tópico: {lesson.topic}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{lesson.time}</p>
                  </div>
                </div>
              ))}
              {stats.upcomingLessons.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma aula programada para hoje
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'grade' ? (
                      <GraduationCap className="h-5 w-5 text-green-600" />
                    ) : activity.type === 'occurrence' ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
              {stats.recentActivities.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma atividade recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">Criar Aula</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <ClipboardCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium">Lançar Frequência</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <GraduationCap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium">Lançar Notas</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="font-medium">Registrar Ocorrência</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}