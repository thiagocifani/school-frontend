'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Plus,
  BookOpen,
  Users,
  ClipboardCheck,
  GraduationCap,
  AlertTriangle,
  Calendar,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  TrendingUp,
  Target,
  Award,
  BarChart3
} from 'lucide-react';
import { LessonModal } from '@/components/teacher/lesson-modal';
import { GradeModal } from '@/components/teacher/grade-modal';
import { OccurrenceModal } from '@/components/teacher/occurrence-modal';
import { AttendanceModal } from '@/components/teacher/attendance-modal';

interface DiaryDetails {
  id: number;
  subject: {
    name: string;
    code: string;
  };
  schoolClass: {
    id: number;
    name: string;
    gradeLevel: {
      name: string;
    };
  };
  academicTerm: {
    name: string;
  };
  students: Array<{
    id: number;
    name: string;
    registrationNumber: string;
    averageGrade?: number;
    attendancePercentage?: number;
  }>;
  lessons: Array<{
    id: number;
    date: string;
    topic: string;
    content: string;
    homework?: string;
    status: 'planned' | 'completed' | 'cancelled';
    attendances?: Array<{
      studentId: number;
      status: 'present' | 'absent' | 'late' | 'justified';
    }>;
    studentsPresent?: number;
    totalStudents?: number;
  }>;
  grades: Array<{
    id: number;
    studentId: number;
    studentName: string;
    value: number;
    gradeType: string;
    date: string;
    lessonId?: number;
  }>;
  occurrences: Array<{
    id: number;
    studentId: number;
    studentName: string;
    type: string;
    title: string;
    description: string;
    date: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export default function DiaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const diaryId = params.id as string;
  
  const [diary, setDiary] = useState<DiaryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  
  // Modals
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [occurrenceModalOpen, setOccurrenceModalOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);

  useEffect(() => {
    loadDiaryDetails();
  }, [diaryId]);

  const loadDiaryDetails = async () => {
    try {
      setLoading(true);
      
      // Dados simulados mais ricos
      const mockDiary: DiaryDetails = {
        id: parseInt(diaryId),
        subject: { name: 'Matemática', code: 'MAT' },
        schoolClass: {
          id: 1,
          name: 'A',
          gradeLevel: { name: '5º Ano' }
        },
        academicTerm: { name: '1º Bimestre 2024' },
        students: [
          { 
            id: 1, 
            name: 'Ana Silva', 
            registrationNumber: '2024001',
            averageGrade: 8.5,
            attendancePercentage: 95
          },
          { 
            id: 2, 
            name: 'João Santos', 
            registrationNumber: '2024002',
            averageGrade: 7.2,
            attendancePercentage: 88
          },
          { 
            id: 3, 
            name: 'Maria Oliveira', 
            registrationNumber: '2024003',
            averageGrade: 9.1,
            attendancePercentage: 98
          },
          { 
            id: 4, 
            name: 'Pedro Costa', 
            registrationNumber: '2024004',
            averageGrade: 6.8,
            attendancePercentage: 92
          },
          { 
            id: 5, 
            name: 'Laura Fernandes', 
            registrationNumber: '2024005',
            averageGrade: 8.9,
            attendancePercentage: 94
          }
        ],
        lessons: [
          {
            id: 1,
            date: '2024-01-15',
            topic: 'Frações - Conceitos básicos',
            content: 'Introdução às frações, tipos de frações e representação gráfica',
            homework: 'Exercícios 1 a 10 da página 45',
            status: 'completed',
            studentsPresent: 4,
            totalStudents: 5,
            attendances: [
              { studentId: 1, status: 'present' },
              { studentId: 2, status: 'present' },
              { studentId: 3, status: 'present' },
              { studentId: 4, status: 'absent' },
              { studentId: 5, status: 'present' }
            ]
          },
          {
            id: 2,
            date: '2024-01-17',
            topic: 'Frações equivalentes',
            content: 'Como identificar e criar frações equivalentes',
            status: 'completed',
            studentsPresent: 5,
            totalStudents: 5
          },
          {
            id: 3,
            date: '2024-01-19',
            topic: 'Operações com frações - Adição',
            content: 'Regras para soma de frações com denominadores iguais e diferentes',
            status: 'planned',
            studentsPresent: 0,
            totalStudents: 5
          }
        ],
        grades: [
          { id: 1, studentId: 1, studentName: 'Ana Silva', value: 8.5, gradeType: 'Prova', date: '2024-01-16', lessonId: 1 },
          { id: 2, studentId: 2, studentName: 'João Santos', value: 7.0, gradeType: 'Prova', date: '2024-01-16', lessonId: 1 },
          { id: 3, studentId: 3, studentName: 'Maria Oliveira', value: 9.0, gradeType: 'Prova', date: '2024-01-16', lessonId: 1 },
          { id: 4, studentId: 1, studentName: 'Ana Silva', value: 9.5, gradeType: 'Trabalho', date: '2024-01-18' }
        ],
        occurrences: [
          {
            id: 1,
            studentId: 2,
            studentName: 'João Santos',
            type: 'disciplinary',
            title: 'Conversa excessiva',
            description: 'Aluno conversando durante a explicação da matéria',
            date: '2024-01-17',
            severity: 'low'
          }
        ]
      };
      
      setDiary(mockDiary);
    } catch (error) {
      console.error('Erro ao carregar detalhes do diário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/teacher-dashboard/diaries');
  };

  const handleLessonAttendance = (lesson: any) => {
    setSelectedLesson(lesson);
    setAttendanceModalOpen(true);
  };

  const handleNewLesson = () => {
    setSelectedLesson(null);
    setLessonModalOpen(true);
  };

  const handleEditLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    setLessonModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      planned: { color: 'bg-blue-100 text-blue-800', label: 'Planejada', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', label: 'Realizada', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelada', icon: XCircle }
    };
    
    const { color, label, icon: Icon } = config[status as keyof typeof config];
    
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getGradeColor = (value: number) => {
    if (value >= 8) return 'text-green-600';
    if (value >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceStats = () => {
    if (!diary) return { totalLessons: 0, avgAttendance: 0, totalPresences: 0 };
    
    const completedLessons = diary.lessons.filter(l => l.status === 'completed');
    const totalLessons = completedLessons.length;
    const totalPresences = completedLessons.reduce((sum, lesson) => sum + (lesson.studentsPresent || 0), 0);
    const totalPossible = totalLessons * diary.students.length;
    const avgAttendance = totalPossible > 0 ? (totalPresences / totalPossible) * 100 : 0;
    
    return { totalLessons, avgAttendance, totalPresences };
  };

  const getGradeStats = () => {
    if (!diary) return { average: 0, above7: 0, totalGrades: 0 };
    
    const totalGrades = diary.grades.length;
    const average = totalGrades > 0 ? diary.grades.reduce((sum, g) => sum + g.value, 0) / totalGrades : 0;
    const above7 = diary.grades.filter(g => g.value >= 7).length;
    
    return { average, above7, totalGrades };
  };

  const attendanceStats = getAttendanceStats();
  const gradeStats = getGradeStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!diary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Diário não encontrado</h1>
          <p className="text-gray-600 mb-4">O diário solicitado não foi encontrado.</p>
          <Button onClick={handleBack}>Voltar aos Diários</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBack} className="hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {diary.subject.name}
                </h1>
                <p className="text-gray-600">
                  {diary.schoolClass.gradeLevel.name} {diary.schoolClass.name} • {diary.academicTerm.name}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleNewLesson} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Aula
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
                  <p className="text-3xl font-bold text-gray-900">{diary.students.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Matriculados na turma</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aulas Ministradas</p>
                  <p className="text-3xl font-bold text-gray-900">{attendanceStats.totalLessons}</p>
                  <p className="text-xs text-gray-500 mt-1">de {diary.lessons.length} planejadas</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Frequência Média</p>
                  <p className="text-3xl font-bold text-gray-900">{attendanceStats.avgAttendance.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500 mt-1">{attendanceStats.totalPresences} presenças</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ClipboardCheck className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Média Geral</p>
                  <p className={`text-3xl font-bold ${getGradeColor(gradeStats.average)}`}>
                    {gradeStats.average.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{gradeStats.totalGrades} notas</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-yellow-600" />
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
            <TabsTrigger value="lessons" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Aulas
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Alunos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Análise
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Lessons */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Últimas Aulas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {diary.lessons.slice(-3).reverse().map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">{lesson.topic}</h3>
                            {getStatusBadge(lesson.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{lesson.content}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{new Date(lesson.date).toLocaleDateString('pt-BR')}</span>
                            {lesson.status === 'completed' && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {lesson.studentsPresent}/{lesson.totalStudents} presentes
                              </span>
                            )}
                          </div>
                        </div>
                        {lesson.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLessonAttendance(lesson)}
                            className="ml-4"
                          >
                            <ClipboardCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Grades */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Notas Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {diary.grades.slice(-5).reverse().map((grade) => (
                      <div key={grade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{grade.studentName}</p>
                          <p className="text-sm text-gray-600">{grade.gradeType}</p>
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
            </div>
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Cronograma de Aulas</CardTitle>
                  <Button onClick={handleNewLesson} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Aula
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {diary.lessons.map((lesson) => (
                    <Card key={lesson.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">{lesson.topic}</h3>
                              {getStatusBadge(lesson.status)}
                              <span className="text-sm text-gray-500">
                                {new Date(lesson.date).toLocaleDateString('pt-BR', { 
                                  weekday: 'short', 
                                  day: '2-digit', 
                                  month: '2-digit' 
                                })}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mb-3">{lesson.content}</p>
                            
                            {lesson.homework && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                <p className="text-sm font-medium text-blue-900 mb-1">Para casa:</p>
                                <p className="text-sm text-blue-800">{lesson.homework}</p>
                              </div>
                            )}
                            
                            {lesson.status === 'completed' && (
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {lesson.studentsPresent}/{lesson.totalStudents} presentes
                                </span>
                                <span className="flex items-center gap-1">
                                  <ClipboardCheck className="h-4 w-4" />
                                  {((lesson.studentsPresent || 0) / (lesson.totalStudents || 1) * 100).toFixed(0)}% frequência
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-4">
                            {lesson.status === 'planned' && (
                              <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                                <Play className="h-4 w-4 mr-1" />
                                Iniciar
                              </Button>
                            )}
                            
                            {lesson.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleLessonAttendance(lesson)}
                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              >
                                <ClipboardCheck className="h-4 w-4 mr-1" />
                                Frequência
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditLesson(lesson)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Desempenho dos Alunos</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setGradeModalOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Lançar Nota
                    </Button>
                    <Button 
                      onClick={() => setOccurrenceModalOpen(true)}
                      variant="outline"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Ocorrência
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Aluno</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Matrícula</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Média</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Frequência</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {diary.students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {student.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {student.registrationNumber}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`text-lg font-semibold ${getGradeColor(student.averageGrade || 0)}`}>
                              {student.averageGrade?.toFixed(1) || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${student.attendancePercentage || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">
                                {student.attendancePercentage?.toFixed(0) || 0}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Set selected student and open grade modal
                                  setGradeModalOpen(true);
                                }}
                                className="text-purple-600 border-purple-600 hover:bg-purple-50"
                              >
                                <GraduationCap className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Set selected student and open occurrence modal
                                  setOccurrenceModalOpen(true);
                                }}
                                className="text-orange-600 border-orange-600 hover:bg-orange-50"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Distribuição de Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { range: '9.0 - 10.0', count: diary.grades.filter(g => g.value >= 9).length, color: 'bg-green-500' },
                      { range: '7.0 - 8.9', count: diary.grades.filter(g => g.value >= 7 && g.value < 9).length, color: 'bg-blue-500' },
                      { range: '5.0 - 6.9', count: diary.grades.filter(g => g.value >= 5 && g.value < 7).length, color: 'bg-yellow-500' },
                      { range: '0.0 - 4.9', count: diary.grades.filter(g => g.value < 5).length, color: 'bg-red-500' }
                    ].map((item) => (
                      <div key={item.range} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded ${item.color}`}></div>
                          <span className="text-sm font-medium">{item.range}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${item.color}`}
                              style={{ width: `${gradeStats.totalGrades > 0 ? (item.count / gradeStats.totalGrades) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Frequência por Aula</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {diary.lessons.filter(l => l.status === 'completed').map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{lesson.topic}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(lesson.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${((lesson.studentsPresent || 0) / (lesson.totalStudents || 1)) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {lesson.studentsPresent}/{lesson.totalStudents}
                          </span>
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

      {/* Modals */}
      <LessonModal
        isOpen={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        lesson={selectedLesson}
        diaryId={diary.id}
        onSuccess={loadDiaryDetails}
      />

      <GradeModal
        isOpen={gradeModalOpen}
        onClose={() => setGradeModalOpen(false)}
        students={diary.students}
        diaryId={diary.id}
        onSuccess={loadDiaryDetails}
      />

      <OccurrenceModal
        isOpen={occurrenceModalOpen}
        onClose={() => setOccurrenceModalOpen(false)}
        students={diary.students}
        onSuccess={loadDiaryDetails}
      />

      <AttendanceModal
        isOpen={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        lesson={selectedLesson}
        students={diary.students}
        onSuccess={loadDiaryDetails}
      />
    </div>
  );
}