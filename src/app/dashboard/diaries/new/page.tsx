'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, BookOpen, Users, Calendar } from 'lucide-react';
import { diaryApi } from '@/lib/api';
import { studentApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Teacher {
  id: number;
  name: string;
  email: string;
}

interface SchoolClass {
  id: number;
  name: string;
  section: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface AcademicTerm {
  id: number;
  name: string;
  year: number;
}

interface NewDiaryForm {
  name: string;
  description: string;
  teacherId: number | null;
  schoolClassId: number | null;
  subjectId: number | null;
  academicTermId: number | null;
}

const defaultForm: NewDiaryForm = {
  name: '',
  description: '',
  teacherId: null,
  schoolClassId: null,
  subjectId: null,
  academicTermId: null,
};

export default function NewDiaryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewDiaryForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Options data
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicTerms, setAcademicTerms] = useState<AcademicTerm[]>([]);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      // For now, we'll use mock data since we don't have these APIs yet
      // In a real implementation, you'd load these from your APIs
      setTeachers([
        { id: 1, name: 'Prof. Maria Silva', email: 'maria@escola.com' },
        { id: 2, name: 'Prof. João Santos', email: 'joao@escola.com' },
        { id: 3, name: 'Prof. Ana Costa', email: 'ana@escola.com' },
      ]);

      setSchoolClasses([
        { id: 1, name: 'Infantil I', section: 'A' },
        { id: 2, name: 'Infantil II', section: 'A' },
        { id: 3, name: '1º Ano', section: 'A' },
        { id: 4, name: '2º Ano', section: 'A' },
      ]);

      setSubjects([
        { id: 1, name: 'Português', code: 'PORT' },
        { id: 2, name: 'Matemática', code: 'MAT' },
        { id: 3, name: 'Artes', code: 'ART' },
        { id: 4, name: 'Educação Física', code: 'EDF' },
      ]);

      setAcademicTerms([
        { id: 1, name: '1º Bimestre 2024', year: 2024 },
        { id: 2, name: '2º Bimestre 2024', year: 2024 },
        { id: 3, name: '3º Bimestre 2024', year: 2024 },
        { id: 4, name: '4º Bimestre 2024', year: 2024 },
      ]);

    } catch (error) {
      console.error('Error loading form data:', error);
      toast.error('Erro ao carregar dados do formulário');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof NewDiaryForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome do diário é obrigatório');
      return;
    }
    
    if (!formData.teacherId) {
      toast.error('Professor é obrigatório');
      return;
    }
    
    if (!formData.schoolClassId) {
      toast.error('Turma é obrigatória');
      return;
    }
    
    if (!formData.subjectId) {
      toast.error('Matéria é obrigatória');
      return;
    }

    if (!formData.academicTermId) {
      toast.error('Período letivo é obrigatório');
      return;
    }

    setSaving(true);
    try {
      await diaryApi.create({
        name: formData.name,
        description: formData.description,
        teacher_id: formData.teacherId,
        school_class_id: formData.schoolClassId,
        subject_id: formData.subjectId,
        academic_term_id: formData.academicTermId,
      });
      
      toast.success('Diário criado com sucesso!');
      router.push('/dashboard/diaries');
    } catch (error: any) {
      console.error('Error creating diary:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao criar diário';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push('/dashboard/diaries')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Diário Eletrônico</h1>
          <p className="text-gray-600">Crie um novo diário para uma disciplina e turma</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Informações do Diário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Diário *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Diário de Matemática - 1º Ano A"
                required
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nome identificativo para o diário eletrônico
              </p>
            </div>

            {/* Teacher, Class, Subject Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-2" />
                  Professor *
                </label>
                <Select
                  value={formData.teacherId?.toString() || ''}
                  onValueChange={(value) => handleInputChange('teacherId', Number(value))}
                >
                  <SelectTrigger className="border-gray-300 focus:border-indigo-500">
                    <SelectValue placeholder="Selecione o professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-2" />
                  Turma *
                </label>
                <Select
                  value={formData.schoolClassId?.toString() || ''}
                  onValueChange={(value) => handleInputChange('schoolClassId', Number(value))}
                >
                  <SelectTrigger className="border-gray-300 focus:border-indigo-500">
                    <SelectValue placeholder="Selecione a turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolClasses.map((schoolClass) => (
                      <SelectItem key={schoolClass.id} value={schoolClass.id.toString()}>
                        {schoolClass.name} {schoolClass.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="inline h-4 w-4 mr-2" />
                  Matéria *
                </label>
                <Select
                  value={formData.subjectId?.toString() || ''}
                  onValueChange={(value) => handleInputChange('subjectId', Number(value))}
                >
                  <SelectTrigger className="border-gray-300 focus:border-indigo-500">
                    <SelectValue placeholder="Selecione a matéria" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Academic Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-2" />
                Período Letivo *
              </label>
              <Select
                value={formData.academicTermId?.toString() || ''}
                onValueChange={(value) => handleInputChange('academicTermId', Number(value))}
              >
                <SelectTrigger className="w-full md:w-64 border-gray-300 focus:border-indigo-500">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {academicTerms.map((term) => (
                    <SelectItem key={term.id} value={term.id.toString()}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição (opcional)
              </label>
              <Textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva os objetivos e conteúdo programático do diário..."
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Informações adicionais sobre o diário e seus objetivos
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/diaries')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Criar Diário
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}