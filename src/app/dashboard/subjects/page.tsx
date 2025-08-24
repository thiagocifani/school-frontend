'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubjects } from '@/hooks/useSubjects';
import { SubjectModal } from '@/components/forms/subject-modal';
import { BookOpen, Plus, Search, Edit, Trash2, Clock } from 'lucide-react';
import { Subject } from '@/types';
import { subjectApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SubjectsPage() {
  const { data: subjects, isLoading, refetch } = useSubjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const filteredSubjects = subjects?.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleNewSubject = () => {
    setSelectedSubject(null);
    setModalOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setModalOpen(true);
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (!confirm(`Tem certeza que deseja remover a disciplina "${subject.name}"?`)) {
      return;
    }

    setDeleteLoading(subject.id);
    try {
      await subjectApi.delete(subject.id);
      toast.success('Disciplina removida com sucesso!');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao remover disciplina');
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

  const totalWorkload = subjects?.reduce((sum, subject) => sum + (subject.workload || 0), 0) || 0;

  return (
    <div className="container mx-auto px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Disciplinas</h1>
          <p className="text-gray-600">Gerencie as disciplinas da escola</p>
        </div>
        <Button 
          onClick={handleNewSubject}
          className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Disciplina
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar disciplinas..."
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
                <p className="text-sm font-medium text-gray-700">Total de Disciplinas</p>
                <p className="text-3xl font-bold text-gray-900">{subjects?.length || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Carga Horária Total</p>
                <p className="text-3xl font-bold text-gray-900">{totalWorkload}h</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Disciplinas Filtradas</p>
                <p className="text-3xl font-bold text-gray-900">{filteredSubjects.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Lista de Disciplinas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Disciplina
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Carga Horária
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {subject.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.workload ? `${subject.workload}h` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate">
                        {subject.description || 'Sem descrição'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSubject(subject)}
                          className="h-8 w-8 p-0 hover:bg-transparent text-indigo-600 hover:text-indigo-700"
                          title="Editar disciplina"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubject(subject)}
                          disabled={deleteLoading === subject.id}
                          className="h-8 w-8 p-0 hover:bg-transparent text-red-600 hover:text-red-700"
                          title="Remover disciplina"
                        >
                          {deleteLoading === subject.id ? (
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
            {filteredSubjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Nenhuma disciplina encontrada' : 'Nenhuma disciplina cadastrada'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <SubjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        subject={selectedSubject}
      />
    </div>
  );
}