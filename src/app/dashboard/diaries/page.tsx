'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, BookOpen, Users, Calendar, TrendingUp, Save, X } from 'lucide-react';
import { diaryApi } from '@/lib/api';
import { Diary } from '@/types/diary';
import toast from 'react-hot-toast';
import Link from 'next/link';

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

export default function DiariesPage() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal states
  const [showNewDiaryModal, setShowNewDiaryModal] = useState(false);
  const [formData, setFormData] = useState<NewDiaryForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  
  // Options data
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicTerms, setAcademicTerms] = useState<AcademicTerm[]>([]);

  useEffect(() => {
    loadDiaries();
  }, [statusFilter]);

  const loadDiaries = async () => {
    try {
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const { data } = await diaryApi.getAll(params);
      setDiaries(data);
    } catch (error) {
      console.error('Error loading diaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiaries = diaries.filter(diary =>
    diary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diary.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diary.schoolClass.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'completed': return 'Concluído';
      case 'archived': return 'Arquivado';
      default: return status;
    }
  };

  const loadFormData = async () => {
    try {
      // Mock data - In a real implementation, you'd load these from your APIs
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
    }
  };

  const handleNewDiary = () => {
    setFormData(defaultForm);
    loadFormData();
    setShowNewDiaryModal(true);
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
      setShowNewDiaryModal(false);
      loadDiaries(); // Reload the list
    } catch (error: any) {
      console.error('Error creating diary:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao criar diário';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowNewDiaryModal(false);
    setFormData(defaultForm);
  };

  const totalDiaries = diaries.length;
  const activeDiaries = diaries.filter(d => d.status === 'active').length;
  const completedDiaries = diaries.filter(d => d.status === 'completed').length;
  const averageProgress = diaries.length > 0 
    ? Math.round(diaries.reduce((sum, d) => sum + d.progressPercentage, 0) / diaries.length)
    : 0;

  if (loading) {
    return (
      <div className="container mx-auto px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Diários Eletrônicos</h1>
          <p className="text-gray-600">Gerencie os diários de suas disciplinas</p>
        </div>
        <Button 
          onClick={handleNewDiary}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 border border-indigo-300 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Novo Diário
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total de Diários</p>
                <p className="text-3xl font-bold text-gray-900">{totalDiaries}</p>
              </div>
              <BookOpen className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Diários Ativos</p>
                <p className="text-3xl font-bold text-gray-900">{activeDiaries}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Diários Concluídos</p>
                <p className="text-3xl font-bold text-gray-900">{completedDiaries}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Progresso Médio</p>
                <p className="text-3xl font-bold text-gray-900">{averageProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <BookOpen className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar diários..."
            className="pl-10 pr-4 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="all" className="text-gray-900 hover:bg-gray-50">Todos os status</SelectItem>
              <SelectItem value="active" className="text-gray-900 hover:bg-gray-50">Ativo</SelectItem>
              <SelectItem value="completed" className="text-gray-900 hover:bg-gray-50">Concluído</SelectItem>
              <SelectItem value="archived" className="text-gray-900 hover:bg-gray-50">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Diaries List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Lista de Diários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Diário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Turma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Professor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Progresso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDiaries.map((diary) => (
                  <tr key={diary.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {diary.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{diary.name}</div>
                          <div className="text-sm text-gray-500">{diary.subject.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {diary.schoolClass.name} {diary.schoolClass.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {diary.teacher.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {diary.completedLessons}/{diary.totalLessons} aulas
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${diary.progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">{diary.progressPercentage}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(diary.status)}`}>
                        {getStatusLabel(diary.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = `/dashboard/diaries/${diary.id}`}
                          className="h-8 w-8 p-0 hover:bg-transparent text-indigo-600 hover:text-indigo-700"
                          title="Ver diário"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = `/dashboard/diaries/${diary.id}/lessons`}
                          className="h-8 w-8 p-0 hover:bg-transparent text-green-600 hover:text-green-700"
                          title="Ver aulas"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDiaries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Nenhum diário encontrado' : 'Nenhum diário cadastrado'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* New Diary Modal */}
      <Dialog open={showNewDiaryModal} onOpenChange={setShowNewDiaryModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Novo Diário Eletrônico
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
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
                className="w-full"
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
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Selecione o professor" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()} className="text-gray-900 hover:bg-gray-50">
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
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Selecione a turma" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {schoolClasses.map((schoolClass) => (
                      <SelectItem key={schoolClass.id} value={schoolClass.id.toString()} className="text-gray-900 hover:bg-gray-50">
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
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Selecione a matéria" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()} className="text-gray-900 hover:bg-gray-50">
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
                <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {academicTerms.map((term) => (
                    <SelectItem key={term.id} value={term.id.toString()} className="text-gray-900 hover:bg-gray-50">
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
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva os objetivos e conteúdo programático do diário..."
                className="w-full"
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
                onClick={handleCancel}
                className="cursor-pointer"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={saving} 
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 border border-indigo-300 cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
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
        </DialogContent>
      </Dialog>

    </div>
  );
}