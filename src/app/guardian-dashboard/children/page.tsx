'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { 
  Users,
  GraduationCap,
  Clock,
  AlertTriangle,
  Award,
  Search,
  Eye,
  Calendar,
  BookOpen,
  TrendingUp,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Student {
  id: number;
  name: string;
  registrationNumber: string;
  class: string;
  grade: string;
  averageGrade: number;
  attendancePercentage: number;
  totalSubjects: number;
  recentOccurrences: number;
  lastOccurrenceType?: 'positive' | 'negative' | 'medical';
  nextTest?: string;
  status: 'active' | 'inactive';
  photo?: string;
}

export default function GuardianChildrenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      
      // Dados simulados - no backend, buscar filhos do responsável
      const mockStudents: Student[] = [
        {
          id: 1,
          name: 'Ana Silva',
          registrationNumber: '2024001',
          class: '5º Ano A',
          grade: '5º Ano',
          averageGrade: 8.5,
          attendancePercentage: 95,
          totalSubjects: 8,
          recentOccurrences: 0,
          nextTest: 'Prova de Matemática - 25/01/2024',
          status: 'active'
        },
        {
          id: 2,
          name: 'Pedro Silva',
          registrationNumber: '2024002',
          class: '3º Ano B',
          grade: '3º Ano',
          averageGrade: 7.2,
          attendancePercentage: 88,
          totalSubjects: 6,
          recentOccurrences: 1,
          lastOccurrenceType: 'negative',
          nextTest: 'Apresentação de Ciências - 28/01/2024',
          status: 'active'
        }
      ];
      
      setStudents(mockStudents);
    } catch (error) {
      console.error('Erro ao carregar filhos:', error);
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

  const getOccurrenceBadge = (count: number, type?: string) => {
    if (count === 0) {
      return <Badge className="bg-green-100 text-green-800">Sem ocorrências</Badge>;
    }
    
    const colorMap = {
      positive: 'bg-blue-100 text-blue-800',
      negative: 'bg-red-100 text-red-800',
      medical: 'bg-yellow-100 text-yellow-800'
    };
    
    const color = type ? colorMap[type as keyof typeof colorMap] : 'bg-orange-100 text-orange-800';
    
    return (
      <Badge className={color}>
        {count} ocorrência{count !== 1 ? 's' : ''}
      </Badge>
    );
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.registrationNumber.includes(searchTerm);
    const matchesGrade = !filterGrade || student.grade === filterGrade;
    
    return matchesSearch && matchesGrade;
  });

  const grades = [...new Set(students.map(s => s.grade))];

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Meus Filhos</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe o desempenho de todos os seus filhos
          </p>
        </div>
        
        <Badge variant="outline" className="text-sm">
          {students.length} {students.length === 1 ? 'filho' : 'filhos'} matriculado{students.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou matrícula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">Todas as séries</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="border-0 shadow-sm hover:shadow-lg transition-all duration-200 group">
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
                    <p className="text-sm text-gray-500">Mat: {student.registrationNumber}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => router.push(`/guardian-dashboard/children/${student.id}`)}
                  className="bg-slate-700 hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Detalhes
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Award className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Média</span>
                  </div>
                  <p className={`text-xl font-bold ${getGradeColor(student.averageGrade)}`}>
                    {student.averageGrade.toFixed(1)}
                  </p>
                </div>
                
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Frequência</span>
                  </div>
                  <p className={`text-xl font-bold ${getAttendanceColor(student.attendancePercentage)}`}>
                    {student.attendancePercentage}%
                  </p>
                </div>
                
                <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <BookOpen className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-900">Matérias</span>
                  </div>
                  <p className="text-xl font-bold text-slate-600">
                    {student.totalSubjects}
                  </p>
                </div>
              </div>

              {/* Occurrences */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Ocorrências</span>
                </div>
                {getOccurrenceBadge(student.recentOccurrences, student.lastOccurrenceType)}
              </div>

              {/* Next Test */}
              {student.nextTest && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Calendar className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Próxima Avaliação</p>
                    <p className="text-sm text-yellow-800">{student.nextTest}</p>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/guardian-dashboard/children/${student.id}?tab=grades`)}
                  className="flex items-center gap-2"
                >
                  <GraduationCap className="h-4 w-4" />
                  Notas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/guardian-dashboard/children/${student.id}?tab=attendance`)}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Frequência
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && !loading && (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum filho encontrado</h3>
            <p className="text-gray-600">
              {searchTerm || filterGrade ? 
                'Tente ajustar os filtros de busca.' : 
                'Nenhum filho está matriculado no momento.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}