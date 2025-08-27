'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, BookOpen, Users, Calendar } from 'lucide-react';
import { diaryApi, teacherApi, classApi, subjectApi, academicTermApi } from '@/lib/api';
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
      setLoading(true);
      console.log('🚀 Starting to load form data...');
      
      // Load data from real APIs with individual error handling
      let teachersResponse, classesResponse, subjectsResponse, academicTermsResponse;
      
      try {
        console.log('📞 Calling teacherApi.getAll()...');
        teachersResponse = await teacherApi.getAll();
        console.log('✅ teacherApi.getAll() response:', teachersResponse);
      } catch (err) {
        console.error('❌ teacherApi.getAll() failed:', err);
        teachersResponse = { data: [] };
      }

      try {
        console.log('📞 Calling classApi.getAll()...');
        classesResponse = await classApi.getAll();
        console.log('✅ classApi.getAll() response:', classesResponse);
      } catch (err) {
        console.error('❌ classApi.getAll() failed:', err);
        classesResponse = { data: [] };
      }

      try {
        console.log('📞 Calling subjectApi.getAll()...');
        subjectsResponse = await subjectApi.getAll();
        console.log('✅ subjectApi.getAll() response:', subjectsResponse);
      } catch (err) {
        console.error('❌ subjectApi.getAll() failed:', err);
        subjectsResponse = { data: [] };
      }

      try {
        console.log('📞 Calling academicTermApi.getAll()...');
        academicTermsResponse = await academicTermApi.getAll();
        console.log('✅ academicTermApi.getAll() response:', academicTermsResponse);
      } catch (err) {
        console.error('❌ academicTermApi.getAll() failed:', err);
        academicTermsResponse = { data: [] };
      }

      console.log('✅ All API calls completed');
      console.log('🧪 DEBUG - Full API Responses:', {
        teachers: {
          status: teachersResponse?.status,
          data: teachersResponse?.data,
          dataType: Array.isArray(teachersResponse?.data) ? 'Array' : typeof teachersResponse?.data,
          length: teachersResponse?.data?.length
        },
        classes: {
          status: classesResponse?.status,
          data: classesResponse?.data,
          dataType: Array.isArray(classesResponse?.data) ? 'Array' : typeof classesResponse?.data,
          length: classesResponse?.data?.length
        },
        subjects: {
          status: subjectsResponse?.status,
          data: subjectsResponse?.data,
          dataType: Array.isArray(subjectsResponse?.data) ? 'Array' : typeof subjectsResponse?.data,
          length: subjectsResponse?.data?.length
        },
        terms: {
          status: academicTermsResponse?.status,
          data: academicTermsResponse?.data,
          dataType: Array.isArray(academicTermsResponse?.data) ? 'Array' : typeof academicTermsResponse?.data,
          length: academicTermsResponse?.data?.length
        }
      });

      // Safe transformation with detailed debugging
      const teachersData = (teachersResponse?.data || []).map((teacher: any) => {
        console.log('🐛 DEBUG - Raw teacher data:', teacher);
        const transformed = {
          id: teacher.id,
          name: teacher.user?.name || teacher.name || 'Professor',
          email: teacher.user?.email || teacher.email || ''
        };
        console.log('🔄 DEBUG - Transformed teacher:', transformed);
        return transformed;
      });

      const classesData = (classesResponse?.data || []).map((schoolClass: any) => {
        console.log('🐛 DEBUG - Raw class data:', schoolClass);
        const transformed = {
          id: schoolClass.id,
          name: schoolClass.name || `Turma ${schoolClass.id}`,
          section: schoolClass.section || ''
        };
        console.log('🔄 DEBUG - Transformed class:', transformed);
        return transformed;
      });

      const subjectsData = (subjectsResponse?.data || []).map((subject: any) => {
        console.log('🐛 DEBUG - Raw subject data:', subject);
        const transformed = {
          id: subject.id,
          name: subject.name || 'Matéria',
          code: subject.code || subject.name?.substring(0, 3).toUpperCase() || 'MAT'
        };
        console.log('🔄 DEBUG - Transformed subject:', transformed);
        return transformed;
      });

      const academicTermsData = (academicTermsResponse?.data || []).map((term: any) => {
        console.log('🐛 DEBUG - Raw term data:', term);
        const transformed = {
          id: term.id,
          name: term.name || `Período ${term.id}`,
          year: term.year || new Date().getFullYear()
        };
        console.log('🔄 DEBUG - Transformed term:', transformed);
        return transformed;
      });

      console.log('🔄 Final transformed data:', {
        teachersData,
        classesData,
        subjectsData,
        academicTermsData
      });

      setTeachers(teachersData);
      setSchoolClasses(classesData);
      setSubjects(subjectsData);
      setAcademicTerms(academicTermsData);

      console.log('📊 Form data loaded successfully:', {
        teachers: teachersData.length,
        classes: classesData.length,
        subjects: subjectsData.length,
        terms: academicTermsData.length
      });

    } catch (error) {
      console.error('❌ Error loading form data:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data
      });
      toast.error('Erro ao carregar dados do formulário');
      
      // Fallback to empty arrays
      console.log('⚠️ Setting fallback empty arrays for all form data');
      setTeachers([]);
      setSchoolClasses([]);
      setSubjects([]);
      setAcademicTerms([]);
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