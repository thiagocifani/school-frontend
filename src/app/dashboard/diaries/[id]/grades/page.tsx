'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { diaryApi, gradeApi } from '@/lib/api';
import { Diary, DiaryStudent } from '@/types/diary';
import { Grade } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Plus, GraduationCap, TrendingUp, 
  Calendar, Award, Edit, Trash2, Save
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';

interface StudentGrade {
  student: DiaryStudent;
  grades: Grade[];
  average: number;
}

interface NewGradeForm {
  studentId: number;
  value: string;
  gradeType: string;
  date: string;
  observation: string;
}

const defaultGradeForm: NewGradeForm = {
  studentId: 0,
  value: '',
  gradeType: '',
  date: new Date().toISOString().split('T')[0],
  observation: '',
};

const gradeTypes = [
  'Avaliação 1',
  'Avaliação 2',
  'Trabalho',
  'Participação',
  'Projeto',
  'Recuperação',
  'Prova Final'
];

export default function DiaryGradesPage() {
  const params = useParams();
  const router = useRouter();
  const diaryId = Number(params.id);
  
  const [diary, setDiary] = useState<Diary | null>(null);
  const [students, setStudents] = useState<DiaryStudent[]>([]);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewGradeForm, setShowNewGradeForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<DiaryStudent | null>(null);
  const [newGradeForm, setNewGradeForm] = useState<NewGradeForm>(defaultGradeForm);
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
      
      // Load grades for all students
      await loadStudentGrades(studentsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados do diário');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentGrades = async (studentsList: DiaryStudent[]) => {
    try {
      const gradesPromises = studentsList.map(async (student) => {
        // Get grades for this student in this diary's subject
        const { data: grades } = await gradeApi.getAll({
          student_id: student.id,
          // We would need to filter by subject or diary, but for now get all grades
        });
        
        const studentAverage = grades.length > 0 
          ? grades.reduce((sum: number, grade: Grade) => sum + grade.value, 0) / grades.length 
          : 0;
        
        return {
          student,
          grades,
          average: studentAverage,
        };
      });
      
      const studentGradesData = await Promise.all(gradesPromises);
      setStudentGrades(studentGradesData);
    } catch (error) {
      console.error('Error loading student grades:', error);
    }
  };

  const handleOpenNewGradeForm = (student: DiaryStudent) => {
    setSelectedStudent(student);
    setNewGradeForm({
      ...defaultGradeForm,
      studentId: student.id,
    });
    setShowNewGradeForm(true);
  };

  const handleCloseNewGradeForm = () => {
    setShowNewGradeForm(false);
    setSelectedStudent(null);
    setNewGradeForm(defaultGradeForm);
  };

  const handleSaveGrade = async () => {
    if (!newGradeForm.value || !newGradeForm.gradeType) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const gradeValue = parseFloat(newGradeForm.value);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 10) {
      toast.error('A nota deve ser um número entre 0 e 10');
      return;
    }

    setSaving(true);
    try {
      await gradeApi.create({
        studentId: newGradeForm.studentId,
        value: gradeValue,
        gradeType: newGradeForm.gradeType,
        date: newGradeForm.date,
        observation: newGradeForm.observation,
        diaryId: diaryId,
        academicTermId: diary?.academicTermId,
        classSubjectId: diary?.classSubjectId,
      });
      
      toast.success('Nota cadastrada com sucesso!');
      handleCloseNewGradeForm();
      
      // Reload grades
      await loadStudentGrades(students);
    } catch (error: any) {
      console.error('Error saving grade:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao cadastrar nota';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGrade = async (gradeId: number) => {
    if (!confirm('Deseja realmente excluir esta nota?')) return;

    try {
      await gradeApi.delete(gradeId);
      toast.success('Nota excluída com sucesso!');
      
      // Reload grades
      await loadStudentGrades(students);
    } catch (error: any) {
      console.error('Error deleting grade:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao excluir nota';
      toast.error(errorMessage);
    }
  };

  const getGradeColor = (value: number) => {
    if (value >= 8) return 'text-green-600';
    if (value >= 6) return 'text-blue-600';
    if (value >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAverageColor = (average: number) => {
    if (average >= 7) return 'bg-green-100 text-green-800';
    if (average >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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

  const classAverage = studentGrades.length > 0 
    ? studentGrades.reduce((sum, sg) => sum + sg.average, 0) / studentGrades.length 
    : 0;

  const totalGrades = studentGrades.reduce((sum, sg) => sum + sg.grades.length, 0);

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
          <h1 className="text-2xl font-bold">Notas - {diary.name}</h1>
          <p className="text-muted-foreground">
            {diary.schoolClass.name} {diary.schoolClass.section} • {diary.subject.name}
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Média da Turma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getGradeColor(classAverage)}`}>
              {classAverage ? Number(classAverage).toFixed(1) : '0.0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGrades}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alunos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Students and Grades */}
      <div className="space-y-4">
        {studentGrades.map((studentData) => (
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
                  <Badge className={getAverageColor(studentData.average)}>
                    <Award className="h-3 w-3 mr-1" />
                    Média: {studentData.average ? Number(studentData.average).toFixed(1) : '0.0'}
                  </Badge>
                  
                  <Button
                    size="sm"
                    onClick={() => handleOpenNewGradeForm(studentData.student)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Nota
                  </Button>
                </div>
              </div>

              {/* Grades List */}
              <div className="space-y-2">
                {studentData.grades.length > 0 ? (
                  studentData.grades.map((grade) => (
                    <div
                      key={grade.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`text-xl font-bold ${getGradeColor(grade.value)}`}>
                          {grade.value ? Number(grade.value).toFixed(1) : '0.0'}
                        </div>
                        
                        <div>
                          <div className="font-medium">{grade.gradeType}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(grade.date).toLocaleDateString('pt-BR')}
                            </span>
                            {grade.observation && (
                              <span>Obs: {grade.observation}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteGrade(grade.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma nota cadastrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Grade Modal */}
      {showNewGradeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Adicionar Nota - {selectedStudent?.name}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tipo de Avaliação *
                </label>
                <Select
                  value={newGradeForm.gradeType}
                  onValueChange={(value) =>
                    setNewGradeForm(prev => ({ ...prev, gradeType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nota (0 a 10) *
                </label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={newGradeForm.value}
                  onChange={(e) =>
                    setNewGradeForm(prev => ({ ...prev, value: e.target.value }))
                  }
                  placeholder="Ex: 8.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Data
                </label>
                <Input
                  type="date"
                  value={newGradeForm.date}
                  onChange={(e) =>
                    setNewGradeForm(prev => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Observação (opcional)
                </label>
                <Textarea
                  rows={3}
                  value={newGradeForm.observation}
                  onChange={(e) =>
                    setNewGradeForm(prev => ({ ...prev, observation: e.target.value }))
                  }
                  placeholder="Observações sobre a avaliação..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={handleCloseNewGradeForm}>
                Cancelar
              </Button>
              <Button onClick={handleSaveGrade} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Nota
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