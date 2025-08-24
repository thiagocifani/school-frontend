'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  BookOpen, 
  Users, 
  Clock,
  Calendar,
  Plus,
  Eye,
  Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TeacherDiary {
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
  studentsCount: number;
  lessonsCount: number;
  lastLesson?: {
    date: string;
    topic: string;
  };
}

export default function TeacherDiariesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [diaries, setDiaries] = useState<TeacherDiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTeacherDiaries();
  }, [user]);

  const loadTeacherDiaries = async () => {
    try {
      setLoading(true);
      
      // Por enquanto, vamos usar dados simulados
      // No backend, buscar apenas os diários onde o teacher_id = user.teacher.id
      const mockDiaries: TeacherDiary[] = [
        {
          id: 1,
          subject: { name: 'Matemática', code: 'MAT' },
          schoolClass: {
            id: 1,
            name: 'A',
            gradeLevel: { name: '5º Ano' }
          },
          academicTerm: { name: '1º Bimestre 2024' },
          studentsCount: 25,
          lessonsCount: 18,
          lastLesson: {
            date: '2024-01-15',
            topic: 'Frações - Conceitos básicos'
          }
        },
        {
          id: 2,
          subject: { name: 'Matemática', code: 'MAT' },
          schoolClass: {
            id: 2,
            name: 'B',
            gradeLevel: { name: '5º Ano' }
          },
          academicTerm: { name: '1º Bimestre 2024' },
          studentsCount: 23,
          lessonsCount: 16,
          lastLesson: {
            date: '2024-01-14',
            topic: 'Operações com números decimais'
          }
        },
        {
          id: 3,
          subject: { name: 'Português', code: 'POR' },
          schoolClass: {
            id: 3,
            name: 'A',
            gradeLevel: { name: '4º Ano' }
          },
          academicTerm: { name: '1º Bimestre 2024' },
          studentsCount: 27,
          lessonsCount: 20,
          lastLesson: {
            date: '2024-01-16',
            topic: 'Verbos - Tempo e modo'
          }
        }
      ];
      
      setDiaries(mockDiaries);
    } catch (error) {
      console.error('Erro ao carregar diários:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiaries = diaries.filter(diary =>
    diary.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diary.schoolClass.gradeLevel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diary.schoolClass.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDiary = (diaryId: number) => {
    router.push(`/teacher-dashboard/diaries/${diaryId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Diários</h1>
          <p className="text-gray-600">Gerencie suas turmas e disciplinas</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por disciplina ou turma..."
            className="pl-10 pr-4 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total de Diários</p>
                <p className="text-3xl font-bold text-gray-900">{diaries.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total de Alunos</p>
                <p className="text-3xl font-bold text-gray-900">
                  {diaries.reduce((sum, diary) => sum + diary.studentsCount, 0)}
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
                <p className="text-sm font-medium text-gray-700">Total de Aulas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {diaries.reduce((sum, diary) => sum + diary.lessonsCount, 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDiaries.map((diary) => (
          <Card key={diary.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {diary.subject.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {diary.schoolClass.gradeLevel.name} {diary.schoolClass.name}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {diary.subject.code}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Período</p>
                    <p className="font-medium">{diary.academicTerm.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Alunos</p>
                    <p className="font-medium">{diary.studentsCount}</p>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="text-gray-600">Aulas ministradas</p>
                  <p className="font-medium">{diary.lessonsCount} aulas</p>
                </div>

                {diary.lastLesson && (
                  <div className="text-sm">
                    <p className="text-gray-600">Última aula</p>
                    <p className="font-medium">{diary.lastLesson.topic}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(diary.lastLesson.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleViewDiary(diary.id)}
                    className="flex-1"
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Diário
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDiaries.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum diário encontrado' : 'Nenhum diário atribuído'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Tente buscar por outro termo'
              : 'Entre em contato com a coordenação para receber suas atribuições'
            }
          </p>
        </div>
      )}
    </div>
  );
}