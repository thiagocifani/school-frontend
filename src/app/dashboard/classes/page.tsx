'use client';

import { useState } from 'react';
import { ResponsiveCard, ResponsiveCardContent, ResponsiveCardHeader, ResponsiveCardTitle } from '@/components/ui/responsive-card';
import { ResponsiveButton, ResponsiveButtonGroup } from '@/components/ui/responsive-button';
import { ResponsiveInput, ResponsiveSelect } from '@/components/ui/responsive-form';
import { useClasses } from '@/hooks/useClasses';
import { ClassModal } from '@/components/forms/class-modal';
import { Users, Plus, Search, Edit, Trash2, Clock, GraduationCap, User } from 'lucide-react';
import { SchoolClass } from '@/types';
import { classApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ClassesPage() {
  const { data: classes, isLoading, refetch } = useClasses();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  const filteredClasses = classes?.filter(schoolClass => {
    const matchesSearch = schoolClass.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schoolClass.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schoolClass.mainTeacher?.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPeriod = periodFilter === 'all' || schoolClass.period === periodFilter;
    return matchesSearch && matchesPeriod;
  }) || [];

  const handleNewClass = () => {
    setSelectedClass(null);
    setModalOpen(true);
  };

  const handleEditClass = (schoolClass: SchoolClass) => {
    setSelectedClass(schoolClass);
    setModalOpen(true);
  };

  const handleDeleteClass = async (schoolClass: SchoolClass) => {
    if (!confirm(`Tem certeza que deseja remover a turma "${schoolClass.name} ${schoolClass.section}"?`)) {
      return;
    }

    setDeleteLoading(schoolClass.id);
    try {
      await classApi.delete(schoolClass.id);
      toast.success('Turma removida com sucesso!');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao remover turma');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleModalSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
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

  const totalStudents = classes?.reduce((sum, cls) => sum + (cls.studentsCount || 0), 0) || 0;
  const morningClasses = classes?.filter(cls => cls.period === 'morning').length || 0;
  const afternoonClasses = classes?.filter(cls => cls.period === 'afternoon').length || 0;
  const eveningClasses = classes?.filter(cls => cls.period === 'evening').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            Turmas
          </h1>
          <p className="text-sm sm:text-base mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Gerencie as turmas da escola
          </p>
        </div>
        <ResponsiveButton 
          onClick={handleNewClass}
          icon={Plus}
          iconPosition="left"
          size="md"
        >
          Nova Turma
        </ResponsiveButton>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <ResponsiveInput
            type="text"
            placeholder="Buscar turmas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <ResponsiveSelect
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          options={[
            { value: 'all', label: 'Todos os períodos' },
            { value: 'morning', label: 'Manhã' },
            { value: 'afternoon', label: 'Tarde' },
            { value: 'evening', label: 'Noite' }
          ]}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ResponsiveCard>
          <ResponsiveCardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  Total de Turmas
                </p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {classes?.length || 0}
                </p>
              </div>
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
        
        <ResponsiveCard>
          <ResponsiveCardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  Total de Alunos
                </p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {totalStudents}
                </p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
        
        <ResponsiveCard>
          <ResponsiveCardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  Períodos
                </p>
                <p className="text-lg sm:text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {morningClasses} / {afternoonClasses} / {eveningClasses}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  M / T / N
                </p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
        
        <ResponsiveCard>
          <ResponsiveCardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  Turmas Filtradas
                </p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {filteredClasses.length}
                </p>
              </div>
              <Search className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredClasses.map((schoolClass) => (
          <ResponsiveCard key={schoolClass.id} className="hover:shadow-lg transition-all duration-200">
            <ResponsiveCardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <ResponsiveCardTitle className="text-lg font-semibold">
                    {schoolClass.name} {schoolClass.section}
                  </ResponsiveCardTitle>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    {schoolClass.gradeLevel?.name} - {schoolClass.gradeLevel?.educationLevel.name}
                  </p>
                </div>
                <ResponsiveButtonGroup spacing="xs">
                  <ResponsiveButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClass(schoolClass)}
                    icon={Edit}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    <span className="sr-only">Editar turma</span>
                  </ResponsiveButton>
                  <ResponsiveButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClass(schoolClass)}
                    disabled={deleteLoading === schoolClass.id}
                    loading={deleteLoading === schoolClass.id}
                    icon={Trash2}
                    className="text-red-600 hover:text-red-700"
                  >
                    <span className="sr-only">Remover turma</span>
                  </ResponsiveButton>
                </ResponsiveButtonGroup>
              </div>
            </ResponsiveCardHeader>
            <ResponsiveCardContent>
              <div className="space-y-3">
                {/* Professor */}
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                  <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    {schoolClass.mainTeacher ? schoolClass.mainTeacher.user.name : 'Sem professor'}
                  </span>
                </div>

                {/* Período */}
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                  <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    {schoolClass.period === 'morning' ? 'Manhã' :
                     schoolClass.period === 'afternoon' ? 'Tarde' : 'Noite'}
                  </span>
                </div>

                {/* Alunos */}
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                  <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    {schoolClass.studentsCount || 0} / {schoolClass.maxStudents} alunos
                  </span>
                </div>

                {/* Etapa */}
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                  <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    {schoolClass.academicTerm ? schoolClass.academicTerm.name : 'Sem etapa'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${Math.min(((schoolClass.studentsCount || 0) / schoolClass.maxStudents) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                
                {/* Disciplinas */}
                {schoolClass.subjects && schoolClass.subjects.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Disciplinas:</p>
                    <div className="flex flex-wrap gap-1">
                      {schoolClass.subjects.slice(0, 3).map((classSubject) => (
                        <span 
                          key={classSubject.id}
                          className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                        >
                          {classSubject.subject.name}
                        </span>
                      ))}
                      {schoolClass.subjects.length > 3 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{schoolClass.subjects.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ResponsiveCardContent>
          </ResponsiveCard>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <ResponsiveCard>
          <ResponsiveCardContent>
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                {searchTerm || periodFilter !== 'all' ? 'Nenhuma turma encontrada' : 'Nenhuma turma cadastrada'}
              </h3>
              <p style={{ color: 'var(--muted-foreground)' }}>
                {searchTerm || periodFilter !== 'all' ? 
                  'Tente ajustar os filtros de busca.' : 
                  'Comece criando uma nova turma para a escola.'
                }
              </p>
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
      )}

      {/* Modal */}
      <ClassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        schoolClass={selectedClass}
      />
    </div>
  );
}