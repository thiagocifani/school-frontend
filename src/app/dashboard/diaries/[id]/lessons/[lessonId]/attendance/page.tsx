'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { diaryApi } from '@/lib/api';
import { Lesson, LessonAttendance } from '@/types/diary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Save, Users, Calendar, Clock, 
  UserCheck, UserX, UserMinus, CheckCircle 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'justified';

interface AttendanceRecord extends LessonAttendance {
  tempObservation?: string;
}

export default function LessonAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const diaryId = Number(params.id);
  const lessonId = Number(params.lessonId);
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [diaryId, lessonId]);

  const loadData = async () => {
    try {
      const [lessonRes, attendancesRes] = await Promise.all([
        diaryApi.getLessons(diaryId), // Get all lessons to find the current one
        diaryApi.getLessonAttendances(diaryId, lessonId)
      ]);
      
      const currentLesson = lessonRes.data.find(l => l.id === lessonId);
      setLesson(currentLesson || null);
      
      // Initialize attendances with temp observation field
      const attendancesWithTemp = attendancesRes.data.map((att: LessonAttendance) => ({
        ...att,
        tempObservation: att.observation || '',
      }));
      
      setAttendances(attendancesWithTemp);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados da aula');
    } finally {
      setLoading(false);
    }
  };

  const updateAttendanceStatus = (studentId: number, status: AttendanceStatus) => {
    setAttendances(prev =>
      prev.map(att =>
        att.student.id === studentId
          ? { ...att, status }
          : att
      )
    );
  };

  const updateAttendanceObservation = (studentId: number, observation: string) => {
    setAttendances(prev =>
      prev.map(att =>
        att.student.id === studentId
          ? { ...att, tempObservation: observation }
          : att
      )
    );
  };

  const handleSaveAttendances = async () => {
    setSaving(true);
    try {
      const updates = attendances.map(att => ({
        id: att.id,
        status: att.status,
        observation: att.tempObservation || null,
      }));

      console.log('Salvando presenças:', { diaryId, lessonId, updates });
      await diaryApi.updateAttendances(diaryId, lessonId, updates);
      
      toast.success('Presenças salvas com sucesso!');
      
      // Reload data to get updated summary
      await loadData();
    } catch (error: any) {
      console.error('Error saving attendances:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao salvar presenças';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return UserCheck;
      case 'absent': return UserX;
      case 'late': return UserMinus;
      case 'justified': return CheckCircle;
      default: return UserCheck;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'justified': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'Presente';
      case 'absent': return 'Ausente';
      case 'late': return 'Atrasado';
      case 'justified': return 'Justificado';
      default: return status;
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
        </div>
      </div>
    );
  }

  const presentCount = attendances.filter(a => a.status === 'present').length;
  const absentCount = attendances.filter(a => a.status === 'absent').length;
  const lateCount = attendances.filter(a => a.status === 'late').length;
  const justifiedCount = attendances.filter(a => a.status === 'justified').length;
  const attendancePercentage = attendances.length > 0 ? (presentCount / attendances.length * 100) : 0;

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/dashboard/diaries/${diaryId}/lessons`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registro de Presença</h1>
          <p className="text-gray-700">
            Aula {lesson.lessonNumber}: {lesson.topic}
          </p>
        </div>
      </div>

      {/* Lesson Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Informações da Aula</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">{new Date(lesson.date).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">{lesson.durationMinutes} minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">{attendances.length} alunos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{presentCount}</div>
              <p className="text-xs text-gray-700">Presentes</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{absentCount}</div>
              <p className="text-xs text-gray-700">Ausentes</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
              <p className="text-xs text-gray-700">Atrasados</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(attendancePercentage)}%</div>
              <p className="text-xs text-gray-700">Presença</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Lista de Presença</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendances.map((attendance) => {
              const StatusIcon = getStatusIcon(attendance.status);
              
              return (
                <div
                  key={attendance.student.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600">
                      <span className="text-sm font-medium text-white">
                        {attendance.student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-900">{attendance.student.name}</div>
                      <div className="text-sm text-gray-700">
                        {attendance.student.registrationNumber}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(attendance.status)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {getStatusLabel(attendance.status)}
                    </Badge>

                    <Select
                      value={attendance.status}
                      onValueChange={(value: AttendanceStatus) =>
                        updateAttendanceStatus(attendance.student.id, value)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            Presente
                          </div>
                        </SelectItem>
                        <SelectItem value="absent">
                          <div className="flex items-center gap-2">
                            <UserX className="h-4 w-4" />
                            Ausente
                          </div>
                        </SelectItem>
                        <SelectItem value="late">
                          <div className="flex items-center gap-2">
                            <UserMinus className="h-4 w-4" />
                            Atrasado
                          </div>
                        </SelectItem>
                        <SelectItem value="justified">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Justificado
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="w-48">
                      <Textarea
                        placeholder="Observação..."
                        value={attendance.tempObservation || ''}
                        onChange={(e) =>
                          updateAttendanceObservation(attendance.student.id, e.target.value)
                        }
                        rows={1}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button 
              onClick={handleSaveAttendances} 
              disabled={saving} 
              variant="ghost"
              className="text-indigo-600 hover:text-indigo-700 hover:bg-transparent"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Presenças
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}