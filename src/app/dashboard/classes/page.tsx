'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  const totalStudents = classes?.reduce((sum, cls) => sum + (cls.studentsCount || 0), 0) || 0;
  const morningClasses = classes?.filter(cls => cls.period === 'morning').length || 0;
  const afternoonClasses = classes?.filter(cls => cls.period === 'afternoon').length || 0;
  const eveningClasses = classes?.filter(cls => cls.period === 'evening').length || 0;

  return (
    <div className="container mx-auto px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Turmas</h1>
          <p className="text-gray-600">Gerencie as turmas da escola</p>
        </div>
        <Button 
          onClick={handleNewClass}
          className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Turma
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar turmas..."
            className="pl-10 pr-4 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">Todos os períodos</option>
          <option value="morning">Manhã</option>
          <option value="afternoon">Tarde</option>
          <option value="evening">Noite</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total de Turmas</p>
                <p className="text-3xl font-bold text-gray-900">{classes?.length || 0}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total de Alunos</p>
                <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Manhã / Tarde / Noite</p>
                <p className="text-xl font-bold text-gray-900">{morningClasses} / {afternoonClasses} / {eveningClasses}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Turmas Filtradas</p>
                <p className="text-3xl font-bold text-gray-900">{filteredClasses.length}</p>
              </div>
              <Search className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((schoolClass) => (
          <Card key={schoolClass.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {schoolClass.name} {schoolClass.section}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {schoolClass.gradeLevel?.name} - {schoolClass.gradeLevel?.educationLevel.name}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClass(schoolClass)}
                    className="h-8 w-8 p-0 hover:bg-transparent text-indigo-600 hover:text-indigo-700"
                    title="Editar turma"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClass(schoolClass)}
                    disabled={deleteLoading === schoolClass.id}
                    className="h-8 w-8 p-0 hover:bg-transparent text-red-600 hover:text-red-700"
                    title="Remover turma"
                  >
                    {deleteLoading === schoolClass.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Professor */}
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {schoolClass.mainTeacher ? schoolClass.mainTeacher.user.name : 'Sem professor'}
                  </span>
                </div>

                {/* Período */}
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {schoolClass.period === 'morning' ? 'Manhã' :
                     schoolClass.period === 'afternoon' ? 'Tarde' : 'Noite'}
                  </span>
                </div>

                {/* Alunos */}
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {schoolClass.studentsCount || 0} / {schoolClass.maxStudents} alunos
                  </span>
                </div>

                {/* Etapa */}
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {schoolClass.academicTerm ? schoolClass.academicTerm.name : 'Sem etapa'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(((schoolClass.studentsCount || 0) / schoolClass.maxStudents) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                
                {/* Disciplinas */}
                {schoolClass.subjects && schoolClass.subjects.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Disciplinas:</p>
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
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || periodFilter !== 'all' ? 'Nenhuma turma encontrada' : 'Nenhuma turma cadastrada'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || periodFilter !== 'all' ? 
              'Tente ajustar os filtros de busca.' : 
              'Comece criando uma nova turma para a escola.'
            }
          </p>
        </div>
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