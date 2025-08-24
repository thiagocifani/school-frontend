'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGradeLevels } from '@/hooks/useGradeLevels';
import { useEducationLevels } from '@/hooks/useEducationLevels';
import { GradeLevelModal } from '@/components/forms/grade-level-modal';
import { BookOpen, Plus, Search, Edit, Trash2, GraduationCap } from 'lucide-react';
import { GradeLevel } from '@/types';
import { gradeLevelApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function GradeLevelsPage() {
  const { data: grades, isLoading: gradesLoading, refetch } = useGradeLevels();
  const { data: educationLevels, isLoading: levelsLoading } = useEducationLevels();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<string>('all');

  const filteredGrades = grades?.filter(grade => {
    const matchesSearch = grade.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedEducationLevel === 'all' || 
                        grade.educationLevel.id.toString() === selectedEducationLevel;
    return matchesSearch && matchesLevel;
  }) || [];

  const handleNewGrade = () => {
    setSelectedGrade(null);
    setModalOpen(true);
  };

  const handleEditGrade = (grade: GradeLevel) => {
    setSelectedGrade(grade);
    setModalOpen(true);
  };

  const handleDeleteGrade = async (grade: GradeLevel) => {
    if (!confirm(`Tem certeza que deseja remover a série "${grade.name}"?`)) {
      return;
    }

    setDeleteLoading(grade.id);
    try {
      await gradeLevelApi.delete(grade.id);
      toast.success('Série removida com sucesso!');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao remover série');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleModalSuccess = () => {
    refetch();
  };

  if (gradesLoading || levelsLoading) {
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

  // Agrupar séries por nível de ensino
  const gradesByLevel = grades?.reduce((acc, grade) => {
    const levelName = grade.educationLevel.name;
    if (!acc[levelName]) {
      acc[levelName] = [];
    }
    acc[levelName].push(grade);
    return acc;
  }, {} as Record<string, GradeLevel[]>) || {};

  return (
    <div className="container mx-auto px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Séries</h1>
          <p className="text-gray-600">Gerencie as séries e anos escolares</p>
        </div>
        <Button 
          onClick={handleNewGrade}
          className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Série
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar séries..."
            className="pl-10 pr-4 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={selectedEducationLevel}
          onChange={(e) => setSelectedEducationLevel(e.target.value)}
          className="px-3 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">Todos os níveis</option>
          {educationLevels?.map(level => (
            <option key={level.id} value={level.id.toString()}>
              {level.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total de Séries</p>
                <p className="text-3xl font-bold text-gray-900">{grades?.length || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Níveis de Ensino</p>
                <p className="text-3xl font-bold text-gray-900">{educationLevels?.length || 0}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Séries Filtradas</p>
                <p className="text-3xl font-bold text-gray-900">{filteredGrades.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grades by Education Level */}
      {selectedEducationLevel === 'all' ? (
        <div className="space-y-8">
          {Object.entries(gradesByLevel).map(([levelName, levelGrades]) => (
            <Card key={levelName}>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  {levelName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {levelGrades
                    .filter(grade => grade.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .sort((a, b) => a.order - b.order)
                    .map((grade) => (
                    <Card key={grade.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{grade.name}</h3>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGrade(grade)}
                              className="h-8 w-8 p-0 hover:bg-transparent text-indigo-600 hover:text-indigo-700"
                              title="Editar série"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGrade(grade)}
                              disabled={deleteLoading === grade.id}
                              className="h-8 w-8 p-0 hover:bg-transparent text-red-600 hover:text-red-700"
                              title="Remover série"
                            >
                              {deleteLoading === grade.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">Ordem: {grade.order}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {levelGrades.filter(grade => grade.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma série encontrada neste nível
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {Object.keys(gradesByLevel).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma série cadastrada
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              {educationLevels?.find(l => l.id.toString() === selectedEducationLevel)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredGrades
                .sort((a, b) => a.order - b.order)
                .map((grade) => (
                <Card key={grade.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{grade.name}</h3>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGrade(grade)}
                          className="h-8 w-8 p-0 hover:bg-transparent text-indigo-600 hover:text-indigo-700"
                          title="Editar série"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGrade(grade)}
                          disabled={deleteLoading === grade.id}
                          className="h-8 w-8 p-0 hover:bg-transparent text-red-600 hover:text-red-700"
                          title="Remover série"
                        >
                          {deleteLoading === grade.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Ordem: {grade.order}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredGrades.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Nenhuma série encontrada' : 'Nenhuma série cadastrada neste nível'}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <GradeLevelModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        grade={selectedGrade}
        educationLevels={educationLevels || []}
      />
    </div>
  );
}