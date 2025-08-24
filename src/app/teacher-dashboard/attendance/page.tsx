'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  ClipboardCheck,
  Calendar,
  Users,
  Search,
  Save,
  Clock
} from 'lucide-react';

interface AttendanceSession {
  id: number;
  date: string;
  subject: {
    name: string;
    code: string;
  };
  schoolClass: {
    name: string;
    gradeLevel: {
      name: string;
    };
  };
  students: Array<{
    id: number;
    name: string;
    status: 'present' | 'absent' | 'late' | 'justified';
  }>;
}

interface TeacherClass {
  id: number;
  subject: {
    name: string;
    code: string;
  };
  schoolClass: {
    name: string;
    gradeLevel: {
      name: string;
    };
  };
  students: Array<{
    id: number;
    name: string;
    registrationNumber: string;
  }>;
}

export default function TeacherAttendancePage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<TeacherClass | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTeacherClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadAttendanceForDate();
    }
  }, [selectedClass, selectedDate]);

  const loadTeacherClasses = async () => {
    try {
      setLoading(true);
      
      // Dados simulados - no backend, buscar as turmas do professor
      const mockClasses: TeacherClass[] = [
        {
          id: 1,
          subject: { name: 'Matemática', code: 'MAT' },
          schoolClass: {
            name: 'A',
            gradeLevel: { name: '5º Ano' }
          },
          students: [
            { id: 1, name: 'Ana Silva', registrationNumber: '2024001' },
            { id: 2, name: 'João Santos', registrationNumber: '2024002' },
            { id: 3, name: 'Maria Oliveira', registrationNumber: '2024003' },
            { id: 4, name: 'Pedro Costa', registrationNumber: '2024004' },
            { id: 5, name: 'Laura Fernandes', registrationNumber: '2024005' }
          ]
        },
        {
          id: 2,
          subject: { name: 'Matemática', code: 'MAT' },
          schoolClass: {
            name: 'B',
            gradeLevel: { name: '5º Ano' }
          },
          students: [
            { id: 6, name: 'Carlos Mendes', registrationNumber: '2024006' },
            { id: 7, name: 'Beatriz Lima', registrationNumber: '2024007' },
            { id: 8, name: 'Lucas Pereira', registrationNumber: '2024008' }
          ]
        }
      ];
      
      setClasses(mockClasses);
      if (mockClasses.length > 0) {
        setSelectedClass(mockClasses[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceForDate = async () => {
    if (!selectedClass) return;

    try {
      // Simulação de dados de frequência já registrados
      // No backend, buscar a frequência já registrada para a data
      const existingAttendance: {[key: number]: string} = {};
      
      // Inicializar todos como presente por padrão
      selectedClass.students.forEach(student => {
        existingAttendance[student.id] = 'present';
      });
      
      setAttendanceData(existingAttendance);
    } catch (error) {
      console.error('Erro ao carregar frequência:', error);
    }
  };

  const updateAttendance = (studentId: number, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const saveAttendance = async () => {
    if (!selectedClass) return;

    setSaving(true);
    try {
      // Aqui você faria a chamada para a API
      const attendancePayload = {
        classId: selectedClass.id,
        date: selectedDate,
        attendances: Object.entries(attendanceData).map(([studentId, status]) => ({
          studentId: parseInt(studentId),
          status
        }))
      };
      
      console.log('Salvando frequência:', attendancePayload);
      
      // Simular sucesso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Frequência salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar frequência:', error);
      alert('Erro ao salvar frequência');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      justified: 'bg-blue-100 text-blue-800'
    };
    
    const labels = {
      present: 'Presente',
      absent: 'Ausente',
      late: 'Atrasado',
      justified: 'Justificado'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getAttendanceStats = () => {
    if (!selectedClass) return { present: 0, absent: 0, late: 0, justified: 0 };
    
    const stats = { present: 0, absent: 0, late: 0, justified: 0 };
    Object.values(attendanceData).forEach(status => {
      stats[status as keyof typeof stats]++;
    });
    
    return stats;
  };

  const filteredStudents = selectedClass?.students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = getAttendanceStats();

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Registro de Frequência</h1>
        <p className="text-gray-600">Marque a presença dos seus alunos</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Turma
          </label>
          <select
            value={selectedClass?.id || ''}
            onChange={(e) => {
              const classId = parseInt(e.target.value);
              const foundClass = classes.find(c => c.id === classId);
              setSelectedClass(foundClass || null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.subject.name} - {cls.schoolClass.gradeLevel.name} {cls.schoolClass.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data da Aula
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-end">
          <Button onClick={saveAttendance} disabled={saving || !selectedClass} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Frequência'}
          </Button>
        </div>
      </div>

      {selectedClass && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Presentes</p>
                    <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                  </div>
                  <ClipboardCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ausentes</p>
                    <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                  </div>
                  <Users className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Atrasados</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Justificados</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.justified}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar aluno por nome ou matrícula..."
                className="pl-10 pr-4 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Attendance List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Lista de Frequência - {selectedClass.subject.name} - {selectedClass.schoolClass.gradeLevel.name} {selectedClass.schoolClass.name}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {new Date(selectedDate).toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">Matrícula: {student.registrationNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusBadge(attendanceData[student.id] || 'present')}
                      
                      <select
                        value={attendanceData[student.id] || 'present'}
                        onChange={(e) => updateAttendance(student.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="present">Presente</option>
                        <option value="absent">Ausente</option>
                        <option value="late">Atrasado</option>
                        <option value="justified">Justificado</option>
                      </select>
                    </div>
                  </div>
                ))}

                {filteredStudents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>
                      {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno na turma'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newData: {[key: number]: string} = {};
                      selectedClass.students.forEach(student => {
                        newData[student.id] = 'present';
                      });
                      setAttendanceData(newData);
                    }}
                  >
                    Marcar Todos Presentes
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newData: {[key: number]: string} = {};
                      selectedClass.students.forEach(student => {
                        newData[student.id] = 'absent';
                      });
                      setAttendanceData(newData);
                    }}
                  >
                    Marcar Todos Ausentes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}