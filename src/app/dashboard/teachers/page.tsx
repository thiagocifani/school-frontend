'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTeachers } from '@/hooks/useTeachers';
import { TeacherModal } from '@/components/forms/teacher-modal';
import { Users, Plus, Search, Edit, Trash2, AlertCircle, GraduationCap, Eye } from 'lucide-react';
import { Teacher } from '@/types';
import { useRouter } from 'next/navigation';
import { teacherApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function TeachersPage() {
  const { data: teachers, isLoading, refetch } = useTeachers();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Debug log
  console.log('Teachers data:', teachers);

  const filteredTeachers = teachers?.filter(teacher =>
    teacher.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleNewTeacher = () => {
    setSelectedTeacher(null);
    setModalOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setModalOpen(true);
  };

  const handleViewTeacher = (teacher: Teacher) => {
    router.push(`/dashboard/teachers/${teacher.id}`);
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (!confirm(`Tem certeza que deseja remover o professor "${teacher.user?.name || 'este professor'}"?`)) {
      return;
    }

    setDeleteLoading(teacher.id);
    try {
      await teacherApi.delete(teacher.id);
      toast.success('Professor removido com sucesso!');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao remover professor');
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
          <h1 className="text-3xl font-bold text-gray-900">Professores</h1>
          <p className="text-gray-600">Gerencie os professores da escola</p>
        </div>
        <Button 
          onClick={handleNewTeacher}
          className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Professor
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar professores..."
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
                <p className="text-sm font-medium text-gray-700">Total de Professores</p>
                <p className="text-3xl font-bold text-gray-900">{teachers?.length || 0}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Professores Ativos</p>
                <p className="text-3xl font-bold text-gray-900">
                  {teachers?.filter(t => (t.status || 'active') === 'active').length || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Professores Inativos</p>
                <p className="text-3xl font-bold text-gray-900">
                  {teachers?.filter(t => (t.status || 'active') === 'inactive').length || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Lista de Professores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Professor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Especialização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Salário
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
                {filteredTeachers.filter(teacher => teacher && teacher.id).map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {teacher.user?.name?.charAt(0)?.toUpperCase() || 'P'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{teacher.user?.name || 'Nome não disponível'}</div>
                          <div className="text-sm text-gray-500">{teacher.user?.phone || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.user?.email || 'Email não disponível'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.specialization || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {(teacher.salary || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        (teacher.status || 'active') === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {(teacher.status || 'active') === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTeacher(teacher)}
                          className="h-8 w-8 p-0 hover:bg-transparent text-green-600 hover:text-green-700"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTeacher(teacher)}
                          className="h-8 w-8 p-0 hover:bg-transparent text-indigo-600 hover:text-indigo-700"
                          title="Editar professor"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTeacher(teacher)}
                          disabled={deleteLoading === teacher.id}
                          className="h-8 w-8 p-0 hover:bg-transparent text-red-600 hover:text-red-700"
                          title="Remover professor"
                        >
                          {deleteLoading === teacher.id ? (
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
            {filteredTeachers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Nenhum professor encontrado' : 'Nenhum professor cadastrado'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <TeacherModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        teacher={selectedTeacher}
      />
    </div>
  );
}