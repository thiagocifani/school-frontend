'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  Users,
  GraduationCap,
  Calendar,
  AlertTriangle,
  Clock,
  Award,
  BookOpen,
  TrendingUp,
  Heart,
  Bell,
  CheckCircle,
  XCircle,
  Eye,
  CreditCard
} from 'lucide-react';
import { adminApi, gradeApi, attendanceApi, occurrenceApi } from '@/lib/api';

interface StudentSummary {
  id: number;
  name: string;
  class: string;
  averageGrade: number;
  attendancePercentage: number;
  recentOccurrences: number;
  nextEvents: string[];
  photo?: string;
}

export default function GuardianDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentSummary[]>([]);

  useEffect(() => {
    loadStudentsData();
  }, [user]);

  const loadStudentsData = async () => {
    try {
      setLoading(true);
      
      if (!user?.guardian?.id) {
        console.warn('Guardian ID not found');
        setLoading(false);
        return;
      }
      
      // Buscar filhos do responsável
      const { data: studentsData } = await adminApi.guardians.getStudents(user.guardian.id);
      
      // Processar dados de cada filho
      const studentsWithData: StudentSummary[] = await Promise.all(
        (studentsData || []).map(async (student: any) => {
          try {
            // Buscar notas do aluno
            const { data: gradesData } = await gradeApi.getAll({ student_id: student.id });
            const grades = gradesData || [];
            const averageGrade = grades.length > 0 
              ? grades.reduce((sum: number, grade: any) => sum + (grade.value || 0), 0) / grades.length
              : 0;
            
            // Buscar frequência do aluno
            const { data: attendancesData } = await attendanceApi.getAll({ student_id: student.id });
            const attendances = attendancesData || [];
            const totalClasses = attendances.length;
            const presentClasses = attendances.filter((att: any) => att.status === 'present').length;
            const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
            
            // Buscar ocorrências recentes (últimos 30 dias)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const { data: occurrencesData } = await occurrenceApi.getAll({ 
              student_id: student.id,
              start_date: thirtyDaysAgo.toISOString().split('T')[0]
            });
            const recentOccurrences = (occurrencesData || []).length;
            
            // Próximos eventos (simulado por enquanto - pode ser implementado com calendário escolar)
            const nextEvents: string[] = [];
            // TODO: Implementar busca de eventos do calendário escolar quando disponível
            
            return {
              id: student.id,
              name: student.name,
              class: student.schoolClass?.name || student.class || 'Sem turma',
              averageGrade: Number(averageGrade.toFixed(1)),
              attendancePercentage: Number(attendancePercentage.toFixed(0)),
              recentOccurrences,
              nextEvents
            };
          } catch (err) {
            console.warn('Erro ao carregar dados do aluno', student.id, err);
            // Retornar dados básicos em caso de erro
            return {
              id: student.id,
              name: student.name,
              class: student.schoolClass?.name || student.class || 'Sem turma',
              averageGrade: 0,
              attendancePercentage: 0,
              recentOccurrences: 0,
              nextEvents: []
            };
          }
        })
      );
      
      setStudents(studentsWithData);
    } catch (error) {
      console.error('Erro ao carregar dados dos filhos:', error);
      // Em caso de erro, deixar lista vazia ao invés de dados mock
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 8) return 'text-green-600';
    if (grade >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOverallStats = () => {
    if (students.length === 0) return { averageGrade: 0, averageAttendance: 0, totalOccurrences: 0 };
    
    const averageGrade = students.reduce((sum, student) => sum + student.averageGrade, 0) / students.length;
    const averageAttendance = students.reduce((sum, student) => sum + student.attendancePercentage, 0) / students.length;
    const totalOccurrences = students.reduce((sum, student) => sum + student.recentOccurrences, 0);
    
    return { averageGrade, averageAttendance, totalOccurrences };
  };

  const stats = getOverallStats();

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Acompanhe o desenvolvimento dos seus filhos
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={() => router.push('/guardian-dashboard/children')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Users className="h-4 w-4 mr-2" />
            Ver Todos os Filhos
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Filhos Matriculados</p>
                <p className="text-3xl font-bold text-gray-900">{students.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Média Geral</p>
                <p className={`text-3xl font-bold ${getGradeColor(stats.averageGrade)}`}>
                  {stats.averageGrade.toFixed(1)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Frequência Média</p>
                <p className={`text-3xl font-bold ${getAttendanceColor(stats.averageAttendance)}`}>
                  {stats.averageAttendance.toFixed(0)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ocorrências</p>
                <p className={`text-3xl font-bold ${stats.totalOccurrences > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {stats.totalOccurrences}
                </p>
              </div>
              <div className={`h-12 w-12 ${stats.totalOccurrences > 0 ? 'bg-orange-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                {stats.totalOccurrences > 0 ? (
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Seus Filhos</h2>
          <Badge variant="outline" className="text-sm">
            {students.length} {students.length === 1 ? 'filho' : 'filhos'} matriculado{students.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {students.map((student) => (
            <Card key={student.id} className="border-0 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-slate-600 to-emerald-600 flex items-center justify-center shadow-lg">
                      <span className="text-lg font-medium text-white">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-gray-600">{student.class}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/guardian-dashboard/children/${student.id}`)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalhes
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-900">Média</p>
                    <p className={`text-2xl font-bold ${getGradeColor(student.averageGrade)}`}>
                      {student.averageGrade.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">Frequência</p>
                    <p className={`text-2xl font-bold ${getAttendanceColor(student.attendancePercentage)}`}>
                      {student.attendancePercentage}%
                    </p>
                  </div>
                </div>

                {/* Recent Events */}
                {student.nextEvents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Próximos Eventos
                    </p>
                    {student.nextEvents.slice(0, 2).map((event, index) => (
                      <div key={index} className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                        {event}
                      </div>
                    ))}
                  </div>
                )}

                {/* Occurrences Alert */}
                {student.recentOccurrences > 0 && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-800">
                      {student.recentOccurrences} nova{student.recentOccurrences !== 1 ? 's' : ''} ocorrência{student.recentOccurrences !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-slate-700" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-slate-50"
              onClick={() => router.push('/guardian-dashboard/calendar')}
            >
              <Calendar className="h-6 w-6 text-slate-600" />
              <span>Ver Calendário</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-blue-50"
              onClick={() => router.push('/guardian-dashboard/announcements')}
            >
              <Bell className="h-6 w-6 text-blue-600" />
              <span>Comunicados</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-emerald-50"
              onClick={() => router.push('/guardian-dashboard/children')}
            >
              <Users className="h-6 w-6 text-emerald-600" />
              <span>Todos os Filhos</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-slate-50"
              onClick={() => router.push('/guardian-dashboard/tuitions')}
            >
              <CreditCard className="h-6 w-6 text-slate-700" />
              <span>Mensalidades</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}