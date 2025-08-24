'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { diaryApi, occurrenceApi } from '@/lib/api';
import { Diary, DiaryStudent } from '@/types/diary';
import { Occurrence } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Plus, AlertTriangle, MessageSquare, 
  Calendar, Trash2, Save, Heart, Frown
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';

interface StudentOccurrences {
  student: DiaryStudent;
  occurrences: Occurrence[];
}

interface NewOccurrenceForm {
  studentId: number;
  title: string;
  description: string;
  occurrenceType: string;
  severity: string;
  date: string;
}

const defaultOccurrenceForm: NewOccurrenceForm = {
  studentId: 0,
  title: '',
  description: '',
  occurrenceType: '',
  severity: '',
  date: new Date().toISOString().split('T')[0],
};

const occurrenceTypes = [
  { value: 'disciplinary', label: 'Disciplinar', icon: AlertTriangle },
  { value: 'medical', label: 'Médica', icon: Heart },
  { value: 'positive', label: 'Positiva', icon: Heart },
  { value: 'other', label: 'Outras', icon: MessageSquare },
];

const severityLevels = [
  { value: 'low', label: 'Baixa', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-800' },
];

export default function DiaryOccurrencesPage() {
  const params = useParams();
  const router = useRouter();
  const diaryId = Number(params.id);
  
  const [diary, setDiary] = useState<Diary | null>(null);
  const [students, setStudents] = useState<DiaryStudent[]>([]);
  const [studentOccurrences, setStudentOccurrences] = useState<StudentOccurrences[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewOccurrenceForm, setShowNewOccurrenceForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<DiaryStudent | null>(null);
  const [newOccurrenceForm, setNewOccurrenceForm] = useState<NewOccurrenceForm>(defaultOccurrenceForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [diaryId]);

  const loadData = async () => {
    try {
      const [diaryRes, studentsRes] = await Promise.all([
        diaryApi.getById(diaryId),
        diaryApi.getStudents(diaryId)
      ]);
      
      setDiary(diaryRes.data);
      setStudents(studentsRes.data);
      
      // Load occurrences for all students
      await loadStudentOccurrences(studentsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados do diário');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentOccurrences = async (studentsList: DiaryStudent[]) => {
    try {
      const occurrencesPromises = studentsList.map(async (student) => {
        const { data: occurrences } = await occurrenceApi.getAll({
          student_id: student.id,
        });
        
        return {
          student,
          occurrences,
        };
      });
      
      const studentOccurrencesData = await Promise.all(occurrencesPromises);
      setStudentOccurrences(studentOccurrencesData);
    } catch (error) {
      console.error('Error loading student occurrences:', error);
    }
  };

  const handleOpenNewOccurrenceForm = (student: DiaryStudent) => {
    setSelectedStudent(student);
    setNewOccurrenceForm({
      ...defaultOccurrenceForm,
      studentId: student.id,
    });
    setShowNewOccurrenceForm(true);
  };

  const handleCloseNewOccurrenceForm = () => {
    setShowNewOccurrenceForm(false);
    setSelectedStudent(null);
    setNewOccurrenceForm(defaultOccurrenceForm);
  };

  const handleSaveOccurrence = async () => {
    if (!newOccurrenceForm.title.trim() || !newOccurrenceForm.description.trim() || 
        !newOccurrenceForm.occurrenceType || !newOccurrenceForm.severity) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      await occurrenceApi.create({
        studentId: newOccurrenceForm.studentId,
        title: newOccurrenceForm.title,
        description: newOccurrenceForm.description,
        occurrenceType: newOccurrenceForm.occurrenceType,
        severity: newOccurrenceForm.severity,
        date: newOccurrenceForm.date,
        // We need to pass the teacher ID - this should come from the current user
        teacherId: diary?.teacher.id,
      });
      
      toast.success('Ocorrência cadastrada com sucesso!');
      handleCloseNewOccurrenceForm();
      
      // Reload occurrences
      await loadStudentOccurrences(students);
    } catch (error: any) {
      console.error('Error saving occurrence:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao cadastrar ocorrência';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOccurrence = async (occurrenceId: number) => {
    if (!confirm('Deseja realmente excluir esta ocorrência?')) return;

    try {
      await occurrenceApi.delete(occurrenceId);
      toast.success('Ocorrência excluída com sucesso!');
      
      // Reload occurrences
      await loadStudentOccurrences(students);
    } catch (error: any) {
      console.error('Error deleting occurrence:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao excluir ocorrência';
      toast.error(errorMessage);
    }
  };

  const getOccurrenceTypeInfo = (type: string) => {
    return occurrenceTypes.find(ot => ot.value === type) || occurrenceTypes[3];
  };

  const getSeverityInfo = (severity: string) => {
    return severityLevels.find(sl => sl.value === severity) || severityLevels[0];
  };

  const getOccurrenceTypeColor = (type: string) => {
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
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!diary) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-muted-foreground">Diário não encontrado</p>
        </div>
      </div>
    );
  }

  const totalOccurrences = studentOccurrences.reduce((sum, so) => sum + so.occurrences.length, 0);
  const disciplinaryCount = studentOccurrences.reduce((sum, so) => 
    sum + so.occurrences.filter(o => o.occurrenceType === 'disciplinary').length, 0);
  const positiveCount = studentOccurrences.reduce((sum, so) => 
    sum + so.occurrences.filter(o => o.occurrenceType === 'positive').length, 0);

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
        <div>
          <h1 className="text-2xl font-bold">Ocorrências - {diary.name}</h1>
          <p className="text-muted-foreground">
            {diary.schoolClass.name} {diary.schoolClass.section} • {diary.subject.name}
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Ocorrências</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOccurrences}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disciplinares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{disciplinaryCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Positivas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{positiveCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Students and Occurrences */}
      <div className="space-y-4">
        {studentOccurrences.map((studentData) => (
          <Card key={studentData.student.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600">
                    <span className="text-lg font-bold text-white">
                      {studentData.student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">{studentData.student.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {studentData.student.registrationNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    {studentData.occurrences.length} ocorrências
                  </Badge>
                  
                  <Button
                    size="sm"
                    onClick={() => handleOpenNewOccurrenceForm(studentData.student)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nova Ocorrência
                  </Button>
                </div>
              </div>

              {/* Occurrences List */}
              <div className="space-y-3">
                {studentData.occurrences.length > 0 ? (
                  studentData.occurrences.map((occurrence) => {
                    const typeInfo = getOccurrenceTypeInfo(occurrence.occurrenceType);
                    const severityInfo = getSeverityInfo(occurrence.severity);
                    const TypeIcon = typeInfo.icon;
                    
                    return (
                      <div
                        key={occurrence.id}
                        className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100">
                            <TypeIcon className="h-4 w-4 text-indigo-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{occurrence.title}</h4>
                              <Badge className={getOccurrenceTypeColor(occurrence.occurrenceType)}>
                                {typeInfo.label}
                              </Badge>
                              <Badge className={severityInfo.color}>
                                {severityInfo.label}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {occurrence.description}
                            </p>
                            
                            <div className="text-xs text-muted-foreground flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(occurrence.date).toLocaleDateString('pt-BR')}
                              </span>
                              {occurrence.notifiedGuardians && (
                                <span className="text-blue-600">
                                  Responsáveis notificados
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteOccurrence(occurrence.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma ocorrência registrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Occurrence Modal */}
      {showNewOccurrenceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Nova Ocorrência - {selectedStudent?.name}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Título *
                </label>
                <Input
                  value={newOccurrenceForm.title}
                  onChange={(e) =>
                    setNewOccurrenceForm(prev => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Ex: Comportamento inadequado em sala"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tipo *
                </label>
                <Select
                  value={newOccurrenceForm.occurrenceType}
                  onValueChange={(value) =>
                    setNewOccurrenceForm(prev => ({ ...prev, occurrenceType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {occurrenceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Gravidade *
                </label>
                <Select
                  value={newOccurrenceForm.severity}
                  onValueChange={(value) =>
                    setNewOccurrenceForm(prev => ({ ...prev, severity: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a gravidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {severityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Data
                </label>
                <Input
                  type="date"
                  value={newOccurrenceForm.date}
                  onChange={(e) =>
                    setNewOccurrenceForm(prev => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrição *
                </label>
                <Textarea
                  rows={4}
                  value={newOccurrenceForm.description}
                  onChange={(e) =>
                    setNewOccurrenceForm(prev => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Descreva em detalhes o que aconteceu..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={handleCloseNewOccurrenceForm}>
                Cancelar
              </Button>
              <Button onClick={handleSaveOccurrence} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Ocorrência
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}