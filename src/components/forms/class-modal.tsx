'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { classApi } from '@/lib/api';
import { useTeachers } from '@/hooks/useTeachers';
import { useGradeLevels } from '@/hooks/useGradeLevels';
import { useAcademicTerms } from '@/hooks/useAcademicTerms';
import { useSubjects } from '@/hooks/useSubjects';
import { SchoolClass } from '@/types';
import toast from 'react-hot-toast';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolClass?: SchoolClass | null;
}

export function ClassModal({ isOpen, onClose, onSuccess, schoolClass }: ClassModalProps) {
  const { data: teachers } = useTeachers();
  const { data: gradeLevels } = useGradeLevels();
  const { data: academicTerms } = useAcademicTerms();
  const { data: subjects } = useSubjects();

  // Debug logs
  console.log("🐛 DEBUG - ClassModal gradeLevels:", gradeLevels);
  console.log("🐛 DEBUG - ClassModal academicTerms:", academicTerms);
  console.log("🐛 DEBUG - ClassModal teachers:", teachers?.length || 0, "teachers");
  console.log("🐛 DEBUG - ClassModal subjects:", subjects?.length || 0, "subjects");

  const [formData, setFormData] = useState({
    name: '',
    section: '',
    gradeLevelId: '',
    academicTermId: '',
    mainTeacherId: '',
    maxStudents: '25',
    period: 'morning',
    selectedSubjects: [] as Array<{ subjectId: number; teacherId: number; weeklyHours: number }>,
  });
  const [loading, setLoading] = useState(false);

  // Atualizar form quando o schoolClass mudar
  useEffect(() => {
    if (schoolClass) {
      setFormData({
        name: schoolClass.name || '',
        section: schoolClass.section || '',
        gradeLevelId: schoolClass.gradeLevel?.id.toString() || '',
        academicTermId: schoolClass.academicTerm?.id.toString() || '',
        mainTeacherId: schoolClass.mainTeacher?.id.toString() || '',
        maxStudents: schoolClass.maxStudents.toString() || '25',
        period: schoolClass.period || 'morning',
        selectedSubjects: schoolClass.subjects?.map(cs => ({
          subjectId: cs.subject.id,
          teacherId: cs.teacher.id,
          weeklyHours: cs.weeklyHours,
        })) || [],
      });
    } else {
      resetForm();
    }
  }, [schoolClass, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        section: formData.section,
        grade_level_id: parseInt(formData.gradeLevelId),
        academic_term_id: parseInt(formData.academicTermId),
        main_teacher_id: formData.mainTeacherId ? parseInt(formData.mainTeacherId) : null,
        max_students: parseInt(formData.maxStudents),
        period: formData.period,
        class_subjects_attributes: formData.selectedSubjects.map(cs => ({
          subject_id: cs.subjectId,
          teacher_id: cs.teacherId,
          weekly_hours: cs.weeklyHours,
        })),
      };

      if (schoolClass) {
        await classApi.update(schoolClass.id, payload);
        toast.success('Turma atualizada com sucesso!');
      } else {
        await classApi.create(payload);
        toast.success('Turma criada com sucesso!');
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar turma');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      section: '',
      gradeLevelId: '',
      academicTermId: '',
      mainTeacherId: '',
      maxStudents: '25',
      period: 'morning',
      selectedSubjects: [],
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: [...prev.selectedSubjects, { subjectId: 0, teacherId: 0, weeklyHours: 2 }]
    }));
  };

  const removeSubject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.filter((_, i) => i !== index)
    }));
  };

  const updateSubject = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.map((subject, i) => 
        i === index ? { ...subject, [field]: value } : subject
      )
    }));
  };

  const activeTerms = academicTerms?.filter(term => term.active) || [];
  const activeTeachers = teachers?.filter(teacher => teacher.status === 'active') || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {schoolClass ? 'Editar Turma' : 'Nova Turma'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                  Nome da Turma *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: 1º Ano, Infantil I"
                  required
                  className="w-full placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-900 mb-2">
                  Seção *
                </label>
                <Input
                  id="section"
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  placeholder="A, B, C"
                  required
                  className="w-full placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="gradeLevelId" className="block text-sm font-medium text-gray-900 mb-2">
                  Série *
                </label>
                <select
                  id="gradeLevelId"
                  value={formData.gradeLevelId}
                  onChange={(e) => setFormData({ ...formData, gradeLevelId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Selecione uma série</option>
                  {gradeLevels?.map(grade => (
                    <option key={grade.id} value={grade.id.toString()}>
                      {grade.name} - {grade.educationLevel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="academicTermId" className="block text-sm font-medium text-gray-900 mb-2">
                  Etapa Acadêmica *
                </label>
                <select
                  id="academicTermId"
                  value={formData.academicTermId}
                  onChange={(e) => setFormData({ ...formData, academicTermId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Selecione uma etapa</option>
                  {activeTerms.map(term => (
                    <option key={term.id} value={term.id.toString()}>
                      {term.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="mainTeacherId" className="block text-sm font-medium text-gray-900 mb-2">
                  Professor Principal
                </label>
                <select
                  id="mainTeacherId"
                  value={formData.mainTeacherId}
                  onChange={(e) => setFormData({ ...formData, mainTeacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Sem professor principal</option>
                  {activeTeachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id.toString()}>
                      {teacher.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-900 mb-2">
                  Máx. Alunos *
                </label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                  placeholder="25"
                  required
                  min="1"
                  max="50"
                  className="w-full placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="period" className="block text-sm font-medium text-gray-900 mb-2">
                  Período *
                </label>
                <select
                  id="period"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="morning">Manhã</option>
                  <option value="afternoon">Tarde</option>
                  <option value="evening">Noite</option>
                </select>
              </div>
            </div>

            {/* Disciplinas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-900">
                  Disciplinas
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSubject}
                  className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                >
                  Adicionar Disciplina
                </Button>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {formData.selectedSubjects.map((classSubject, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                    <div className="col-span-5">
                      <label className="block text-xs text-gray-600 mb-1">Disciplina</label>
                      <select
                        value={classSubject.subjectId}
                        onChange={(e) => updateSubject(index, 'subjectId', parseInt(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 bg-transparent text-gray-900 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value={0}>Selecione</option>
                        {subjects?.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-span-4">
                      <label className="block text-xs text-gray-600 mb-1">Professor</label>
                      <select
                        value={classSubject.teacherId}
                        onChange={(e) => updateSubject(index, 'teacherId', parseInt(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 bg-transparent text-gray-900 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value={0}>Selecione</option>
                        {activeTeachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Horas/Sem</label>
                      <input
                        type="number"
                        value={classSubject.weeklyHours}
                        onChange={(e) => updateSubject(index, 'weeklyHours', parseInt(e.target.value))}
                        min="1"
                        max="10"
                        className="w-full px-2 py-1 text-sm border border-gray-300 bg-transparent text-gray-900 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubject(index)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-transparent"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
                
                {formData.selectedSubjects.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Nenhuma disciplina adicionada
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? 'Salvando...' : (schoolClass ? 'Atualizar' : 'Criar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}