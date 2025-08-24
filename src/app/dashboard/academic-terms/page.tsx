'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAcademicTerms } from '@/hooks/useAcademicTerms';
import { AcademicTermModal } from '@/components/forms/academic-term-modal';
import { Calendar, Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { AcademicTerm } from '@/types';
import { academicTermApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AcademicTermsPage() {
  const { data: terms, isLoading, refetch } = useAcademicTerms();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<AcademicTerm | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [activateLoading, setActivateLoading] = useState<number | null>(null);

  const filteredTerms = terms?.filter(term =>
    term.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleNewTerm = () => {
    setSelectedTerm(null);
    setModalOpen(true);
  };

  const handleEditTerm = (term: AcademicTerm) => {
    setSelectedTerm(term);
    setModalOpen(true);
  };

  const handleDeleteTerm = async (term: AcademicTerm) => {
    if (!confirm(`Tem certeza que deseja remover a etapa "${term.name}"?`)) {
      return;
    }

    setDeleteLoading(term.id);
    try {
      await academicTermApi.delete(term.id);
      toast.success('Etapa removida com sucesso!');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao remover etapa');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSetActive = async (term: AcademicTerm) => {
    setActivateLoading(term.id);
    try {
      await academicTermApi.setActive(term.id);
      toast.success('Etapa ativada com sucesso!');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao ativar etapa');
    } finally {
      setActivateLoading(null);
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

  const activeTerm = terms?.find(term => term.active);
  const currentYear = new Date().getFullYear();
  const currentYearTerms = terms?.filter(term => term.year === currentYear) || [];

  return (
    <div className="container mx-auto px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Etapas Acadêmicas</h1>
          <p className="text-gray-600">Gerencie bimestres, trimestres e semestres</p>
        </div>
        <Button 
          onClick={handleNewTerm}
          className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Etapa
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar etapas..."
            className="pl-10 pr-4 py-2 border border-gray-300 bg-transparent text-gray-900 rounded-md w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total de Etapas</p>
                <p className="text-3xl font-bold text-gray-900">{terms?.length || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Etapa Ativa</p>
                <p className="text-lg font-bold text-gray-900">
                  {activeTerm ? activeTerm.name : 'Nenhuma'}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Etapas {currentYear}</p>
                <p className="text-3xl font-bold text-gray-900">{currentYearTerms.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terms List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Lista de Etapas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Ano
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
                {filteredTerms.map((term) => (
                  <tr key={term.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{term.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {term.termType === 'bimester' ? 'Bimestre' :
                       term.termType === 'quarter' ? 'Trimestre' : 'Semestre'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(term.startDate).toLocaleDateString('pt-BR')} - {new Date(term.endDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {term.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          term.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {term.active ? 'Ativa' : 'Inativa'}
                        </span>
                        {!term.active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetActive(term)}
                            disabled={activateLoading === term.id}
                            className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-transparent"
                            title="Ativar etapa"
                          >
                            {activateLoading === term.id ? '...' : 'Ativar'}
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTerm(term)}
                          className="h-8 w-8 p-0 hover:bg-transparent text-indigo-600 hover:text-indigo-700"
                          title="Editar etapa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTerm(term)}
                          disabled={deleteLoading === term.id || term.active}
                          className="h-8 w-8 p-0 hover:bg-transparent text-red-600 hover:text-red-700 disabled:opacity-50"
                          title={term.active ? "Não é possível excluir etapa ativa" : "Remover etapa"}
                        >
                          {deleteLoading === term.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTerms.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Nenhuma etapa encontrada' : 'Nenhuma etapa cadastrada'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <AcademicTermModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        term={selectedTerm}
      />
    </div>
  );
}