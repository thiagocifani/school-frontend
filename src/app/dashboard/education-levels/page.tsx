'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEducationLevels } from '@/hooks/useEducationLevels';
import { EducationLevelModal } from '@/components/forms/education-level-modal';
import { GraduationCap, Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react';
import { EducationLevel } from '@/types';
import { educationLevelApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function EducationLevelsPage() {
  const { data: levels, isLoading, refetch } = useEducationLevels();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const filteredLevels = levels?.filter(level =>
    level.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    level.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleNewLevel = () => {
    setSelectedLevel(null);
    setModalOpen(true);
  };

  const handleEditLevel = (level: EducationLevel) => {
    setSelectedLevel(level);
    setModalOpen(true);
  };

  const handleDeleteLevel = async (level: EducationLevel) => {
    if (!confirm(`Tem certeza que deseja remover o nível "${level.name}"?`)) {
      return;
    }

    setDeleteLoading(level.id);
    try {
      await educationLevelApi.delete(level.id);
      toast.success('Nível de ensino removido com sucesso!');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao remover nível de ensino');
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

  return (
    <div className="container mx-auto px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Níveis de Ensino</h1>
          <p className="text-gray-600">Gerencie os níveis educacionais da escola</p>
        </div>
        <Button 
          onClick={handleNewLevel}
          className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Nível
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar níveis de ensino..."
            className="pl-10 pr-4 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total de Níveis</p>
                <p className="text-3xl font-bold text-gray-900">{levels?.length || 0}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Níveis Ativos</p>
                <p className="text-3xl font-bold text-gray-900">{levels?.length || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Levels List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Lista de Níveis de Ensino</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLevels.map((level) => (
              <Card key={level.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{level.name}</h3>
                        {level.ageRange && (
                          <p className="text-sm text-gray-500">{level.ageRange}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditLevel(level)}
                        className="h-8 w-8 p-0 hover:bg-transparent text-indigo-600 hover:text-indigo-700"
                        title="Editar nível"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLevel(level)}
                        disabled={deleteLoading === level.id}
                        className="h-8 w-8 p-0 hover:bg-transparent text-red-600 hover:text-red-700"
                        title="Remover nível"
                      >
                        {deleteLoading === level.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {level.description && (
                    <p className="text-sm text-gray-600">{level.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredLevels.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhum nível de ensino encontrado' : 'Nenhum nível de ensino cadastrado'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <EducationLevelModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        level={selectedLevel}
      />
    </div>
  );
}