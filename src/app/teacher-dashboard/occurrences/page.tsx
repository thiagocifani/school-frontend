'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  AlertTriangle,
  Plus,
  Search,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';
import { OccurrenceModal } from '@/components/teacher/occurrence-modal';

interface TeacherOccurrence {
  id: number;
  studentId: number;
  studentName: string;
  studentClass: string;
  type: string;
  title: string;
  description: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
  notifiedGuardians: boolean;
}

export default function TeacherOccurrencesPage() {
  const { user } = useAuth();
  const [occurrences, setOccurrences] = useState<TeacherOccurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [occurrenceModalOpen, setOccurrenceModalOpen] = useState(false);

  // Lista simulada de estudantes das turmas do professor
  const students = [
    { id: 1, name: 'Ana Silva', class: '5º Ano A' },
    { id: 2, name: 'João Santos', class: '5º Ano A' },
    { id: 3, name: 'Maria Oliveira', class: '5º Ano A' },
    { id: 4, name: 'Pedro Costa', class: '5º Ano B' },
    { id: 5, name: 'Laura Fernandes', class: '5º Ano B' }
  ];

  useEffect(() => {
    loadOccurrences();
  }, []);

  const loadOccurrences = async () => {
    try {
      setLoading(true);
      
      // Dados simulados - no backend, buscar ocorrências das turmas do professor
      const mockOccurrences: TeacherOccurrence[] = [
        {
          id: 1,
          studentId: 2,
          studentName: 'João Santos',
          studentClass: '5º Ano A',
          type: 'disciplinary',
          title: 'Conversa excessiva',
          description: 'Aluno conversando durante a explicação da matéria, mesmo após advertência verbal.',
          date: '2024-01-17',
          severity: 'low',
          notifiedGuardians: true
        },
        {
          id: 2,
          studentId: 4,
          studentName: 'Pedro Costa',
          studentClass: '5º Ano B',
          type: 'behavioral',
          title: 'Desrespeito com colega',
          description: 'Aluno fez comentário inadequado com colega durante a aula.',
          date: '2024-01-16',
          severity: 'medium',
          notifiedGuardians: false
        },
        {
          id: 3,
          studentId: 1,
          studentName: 'Ana Silva',
          studentClass: '5º Ano A',
          type: 'positive',
          title: 'Excelente participação',
          description: 'Aluna demonstrou grande interesse e ajudou colegas com dificuldades.',
          date: '2024-01-15',
          severity: 'low',
          notifiedGuardians: true
        }
      ];
      
      setOccurrences(mockOccurrences);
    } catch (error) {
      console.error('Erro ao carregar ocorrências:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOccurrences = occurrences.filter(occurrence => {
    const matchesSearch = occurrence.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         occurrence.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         occurrence.studentClass.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = !filterSeverity || occurrence.severity === filterSeverity;
    
    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      low: 'Leve',
      medium: 'Moderada',
      high: 'Grave'
    };

    return (
      <Badge className={colors[severity as keyof typeof colors]}>
        {labels[severity as keyof typeof labels]}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      disciplinary: 'bg-red-100 text-red-800',
      behavioral: 'bg-orange-100 text-orange-800',
      academic: 'bg-blue-100 text-blue-800',
      positive: 'bg-green-100 text-green-800',
      medical: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      disciplinary: 'Disciplinar',
      behavioral: 'Comportamental',
      academic: 'Acadêmica',
      positive: 'Positiva',
      medical: 'Médica',
      other: 'Outra'
    };

    return (
      <Badge className={colors[type as keyof typeof colors]}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  const getOccurrenceStats = () => {
    const total = occurrences.length;
    const thisMonth = occurrences.filter(occ => {
      const occDate = new Date(occ.date);
      const now = new Date();
      return occDate.getMonth() === now.getMonth() && occDate.getFullYear() === now.getFullYear();
    }).length;
    
    const positive = occurrences.filter(occ => occ.type === 'positive').length;
    const pending = occurrences.filter(occ => !occ.notifiedGuardians).length;
    
    return { total, thisMonth, positive, pending };
  };

  const stats = getOccurrenceStats();

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ocorrências</h1>
          <p className="text-gray-600">Gerencie as ocorrências dos seus alunos</p>
        </div>
        
        <Button onClick={() => setOccurrenceModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Ocorrência
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total de Ocorrências</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Este Mês</p>
                <p className="text-3xl font-bold text-blue-600">{stats.thisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Ocorrências Positivas</p>
                <p className="text-3xl font-bold text-green-600">{stats.positive}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Pendente Notificação</p>
                <p className="text-3xl font-bold text-red-600">{stats.pending}</p>
              </div>
              <Users className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por aluno, título ou turma..."
            className="pl-10 pr-4 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as gravidades</option>
          <option value="low">Leve</option>
          <option value="medium">Moderada</option>
          <option value="high">Grave</option>
        </select>
      </div>

      {/* Occurrences List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ocorrências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOccurrences.map((occurrence) => (
              <div key={occurrence.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{occurrence.title}</h3>
                      {getTypeBadge(occurrence.type)}
                      {getSeverityBadge(occurrence.severity)}
                      {!occurrence.notifiedGuardians && (
                        <Badge className="bg-orange-100 text-orange-800">
                          Pendente Notificação
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Aluno</p>
                        <p className="font-medium">{occurrence.studentName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Turma</p>
                        <p className="font-medium">{occurrence.studentClass}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{occurrence.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {new Date(occurrence.date).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      
                      {!occurrence.notifiedGuardians && (
                        <Button size="sm" variant="outline">
                          Notificar Responsáveis
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredOccurrences.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterSeverity ? 'Nenhuma ocorrência encontrada' : 'Nenhuma ocorrência registrada'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || filterSeverity 
                    ? 'Tente alterar os filtros de busca'
                    : 'Registre ocorrências para acompanhar o comportamento dos alunos'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <OccurrenceModal
        isOpen={occurrenceModalOpen}
        onClose={() => setOccurrenceModalOpen(false)}
        students={students}
        onSuccess={loadOccurrences}
      />
    </div>
  );
}