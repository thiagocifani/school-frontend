'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  GraduationCap,
  Clock,
  AlertTriangle,
  BookOpen,
  Calendar,
  Award,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  FileText,
  BarChart3,
  Target,
  Heart
} from 'lucide-react';

interface StudentDetail {
  id: number;
  name: string;
  registrationNumber: string;
  class: string;
  grade: string;
  averageGrade: number;
  attendancePercentage: number;
  birthDate: string;
  status: string;
  subjects: Array<{
    id: number;
    name: string;
    teacher: string;
    averageGrade: number;
    totalGrades: number;
    lastGrade?: {
      value: number;
      type: string;
      date: string;
    };
  }>;
  grades: Array<{
    id: number;
    subject: string;
    value: number;
    type: string;
    date: string;
    teacher: string;
  }>;
  occurrences: Array<{
    id: number;
    date: string;
    type: 'positive' | 'negative' | 'medical' | 'academic';
    title: string;
    description: string;
    teacher: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  attendance: {
    totalClasses: number;
    presentClasses: number;
    absentClasses: number;
    lateClasses: number;
    justifiedAbsences: number;
    monthlyData: Array<{
      month: string;
      total: number;
      present: number;
      percentage: number;
    }>;
  };
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = params.id as string;
  const initialTab = searchParams.get('tab') || 'overview';
  
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Dados simulados - no backend, buscar dados completos do aluno
      const mockStudent: StudentDetail = {
        id: parseInt(studentId),
        name: studentId === '1' ? 'Ana Silva' : 'Pedro Silva',
        registrationNumber: studentId === '1' ? '2024001' : '2024002',
        class: studentId === '1' ? '5º Ano A' : '3º Ano B',
        grade: studentId === '1' ? '5º Ano' : '3º Ano',
        averageGrade: studentId === '1' ? 8.5 : 7.2,
        attendancePercentage: studentId === '1' ? 95 : 88,
        birthDate: studentId === '1' ? '2014-03-15' : '2016-07-22',
        status: 'active',
        subjects: [
          {
            id: 1,
            name: 'Matemática',
            teacher: 'Prof. João Silva',
            averageGrade: 8.7,
            totalGrades: 5,
            lastGrade: { value: 9.0, type: 'Prova', date: '2024-01-18' }
          },
          {
            id: 2,
            name: 'Português',
            teacher: 'Prof. Maria Santos',
            averageGrade: 8.2,
            totalGrades: 4,
            lastGrade: { value: 8.5, type: 'Trabalho', date: '2024-01-20' }
          },
          {
            id: 3,
            name: 'Ciências',
            teacher: 'Prof. Carlos Lima',
            averageGrade: 8.8,
            totalGrades: 3,
            lastGrade: { value: 9.2, type: 'Projeto', date: '2024-01-16' }
          },
          {
            id: 4,
            name: 'História',
            teacher: 'Prof. Ana Costa',
            averageGrade: 8.0,
            totalGrades: 3
          }
        ],
        grades: [
          {
            id: 1,
            subject: 'Matemática',
            value: 9.0,
            type: 'Prova',
            date: '2024-01-18',
            teacher: 'Prof. João Silva'
          },
          {
            id: 2,
            subject: 'Português',
            value: 8.5,
            type: 'Trabalho',
            date: '2024-01-20',
            teacher: 'Prof. Maria Santos'
          },
          {
            id: 3,
            subject: 'Ciências',
            value: 9.2,
            type: 'Projeto',
            date: '2024-01-16',
            teacher: 'Prof. Carlos Lima'
          }
        ],
        occurrences: studentId === '1' ? [] : [
          {
            id: 1,
            date: '2024-01-19',
            type: 'negative',
            title: 'Conversa durante a aula',
            description: 'Aluno estava conversando durante a explicação da matéria.',
            teacher: 'Prof. João Silva',
            severity: 'low'
          }
        ],
        attendance: {
          totalClasses: 120,
          presentClasses: studentId === '1' ? 114 : 106,
          absentClasses: studentId === '1' ? 6 : 14,
          lateClasses: studentId === '1' ? 2 : 3,
          justifiedAbsences: studentId === '1' ? 1 : 2,
          monthlyData: [
            { month: 'Janeiro', total: 20, present: 19, percentage: 95 },
            { month: 'Dezembro', total: 22, present: 21, percentage: 95.5 },
            { month: 'Novembro', total: 21, present: 20, percentage: 95.2 }
          ]
        }
      };
      
      setStudent(mockStudent);
    } catch (error) {
      console.error('Erro ao carregar dados do aluno:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 8) return 'text-green-600';
    if (grade >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOccurrenceIcon = (type: string) => {
    const icons = {
      positive: CheckCircle,
      negative: XCircle,
      medical: Heart,
      academic: BookOpen
    };
    return icons[type as keyof typeof icons] || AlertTriangle;
  };

  const getOccurrenceColor = (type: string, severity: string) => {
    if (type === 'positive') return 'bg-green-100 text-green-800 border-green-200';
    if (type === 'medical') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (severity === 'high') return 'bg-red-100 text-red-800 border-red-200';
    if (severity === 'medium') return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

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

  if (!student) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">Aluno não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-slate-600 to-emerald-600 flex items-center justify-center">
                  <span className="text-lg font-medium text-white">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
                  <p className="text-sm text-gray-600">{student.class} • Mat: {student.registrationNumber}</p>
                </div>
              </div>
            </div>
            
            <Badge className="bg-green-100 text-green-800">
              {student.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Média Geral</p>
                  <p className={`text-3xl font-bold ${getGradeColor(student.averageGrade)}`}>
                    {student.averageGrade.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{student.subjects.length} matérias</p>
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
                  <p className="text-sm font-medium text-gray-600">Frequência</p>
                  <p className={`text-3xl font-bold ${student.attendancePercentage >= 90 ? 'text-green-600' : student.attendancePercentage >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {student.attendancePercentage}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {student.attendance.presentClasses}/{student.attendance.totalClasses} aulas
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
                  <p className="text-sm font-medium text-gray-600">Matérias</p>
                  <p className="text-3xl font-bold text-slate-700">{student.subjects.length}</p>
                  <p className="text-xs text-gray-500 mt-1">{student.grades.length} notas lançadas</p>
                </div>
                <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-slate-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ocorrências</p>
                  <p className={`text-3xl font-bold ${student.occurrences.length === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {student.occurrences.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {student.occurrences.length === 0 ? 'Nenhuma ocorrência' : 'Este período'}
                  </p>
                </div>
                <div className={`h-12 w-12 ${student.occurrences.length === 0 ? 'bg-green-100' : 'bg-orange-100'} rounded-lg flex items-center justify-center`}>
                  {student.occurrences.length === 0 ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Matérias
            </TabsTrigger>
            <TabsTrigger value="grades" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Notas
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Frequência
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Grades */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Notas Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {student.grades.slice(0, 5).map((grade) => (
                      <div key={grade.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{grade.subject}</p>
                          <p className="text-sm text-gray-600">{grade.type}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(grade.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getGradeColor(grade.value)}`}>
                            {grade.value.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Occurrences */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Ocorrências
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {student.occurrences.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-green-600 font-medium">Parabéns!</p>
                      <p className="text-gray-600 text-sm">Nenhuma ocorrência registrada</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {student.occurrences.map((occurrence) => {
                        const Icon = getOccurrenceIcon(occurrence.type);
                        return (
                          <div key={occurrence.id} className={`p-4 rounded-lg border ${getOccurrenceColor(occurrence.type, occurrence.severity)}`}>
                            <div className="flex items-start gap-3">
                              <Icon className="h-5 w-5 mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium">{occurrence.title}</p>
                                <p className="text-sm mt-1">{occurrence.description}</p>
                                <p className="text-xs mt-2">
                                  {occurrence.teacher} • {new Date(occurrence.date).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {student.subjects.map((subject) => (
                <Card key={subject.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <Badge className={`${getGradeColor(subject.averageGrade).replace('text-', 'bg-').replace('-600', '-100')} ${getGradeColor(subject.averageGrade).replace('-600', '-800')}`}>
                        Média: {subject.averageGrade.toFixed(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{subject.teacher}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total de notas:</span>
                        <span className="font-medium">{subject.totalGrades}</span>
                      </div>
                      
                      {subject.lastGrade && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-medium text-blue-900">Última Avaliação</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-blue-800">{subject.lastGrade.type}</span>
                            <span className={`font-bold ${getGradeColor(subject.lastGrade.value)}`}>
                              {subject.lastGrade.value.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-xs text-blue-700 mt-1">
                            {new Date(subject.lastGrade.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Grades Tab */}
          <TabsContent value="grades" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Histórico de Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Matéria</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tipo</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Professor</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nota</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {student.grades.map((grade) => (
                        <tr key={grade.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {new Date(grade.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {grade.subject}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {grade.type}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {grade.teacher}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`text-lg font-bold ${getGradeColor(grade.value)}`}>
                              {grade.value.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Resumo de Frequência</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-900">Presenças</p>
                        <p className="text-2xl font-bold text-green-600">{student.attendance.presentClasses}</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-medium text-red-900">Ausências</p>
                        <p className="text-2xl font-bold text-red-600">{student.attendance.absentClasses}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm font-medium text-yellow-900">Atrasos</p>
                        <p className="text-2xl font-bold text-yellow-600">{student.attendance.lateClasses}</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-900">Justificadas</p>
                        <p className="text-2xl font-bold text-blue-600">{student.attendance.justifiedAbsences}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Frequência Geral</span>
                        <span className={`text-lg font-bold ${student.attendancePercentage >= 90 ? 'text-green-600' : student.attendancePercentage >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {student.attendancePercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${student.attendancePercentage >= 90 ? 'bg-green-500' : student.attendancePercentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${student.attendancePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Data */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Frequência por Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {student.attendance.monthlyData.map((month, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{month.month}</span>
                          <span className={`font-bold ${month.percentage >= 90 ? 'text-green-600' : month.percentage >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {month.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>{month.present} presentes</span>
                          <span>{month.total} aulas</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${month.percentage >= 90 ? 'bg-green-500' : month.percentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${month.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}