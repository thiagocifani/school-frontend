'use client';

import { useState } from 'react';
import { ResponsiveCard, ResponsiveCardContent, ResponsiveCardHeader, ResponsiveCardTitle } from '@/components/ui/responsive-card';
import { ResponsiveButton, ResponsiveButtonGroup } from '@/components/ui/responsive-button';
import { ResponsiveTable } from '@/components/ui/responsive-table';
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

  const teachersTableColumns = [
    {
      key: 'name',
      label: 'Professor',
      priority: 5,
      render: (value: any, teacher: Teacher) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-medium text-white">
              {teacher.user?.name?.charAt(0)?.toUpperCase() || 'P'}
            </span>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium">{teacher.user?.name || 'Nome não disponível'}</div>
            <div className="text-xs text-gray-500">{teacher.user?.phone || ''}</div>
          </div>
        </div>
      ),
      mobileRender: (value: any, teacher: Teacher) => (
        <span className="font-medium">{teacher.user?.name || 'Nome não disponível'}</span>
      )
    },
    {
      key: 'email',
      label: 'Email',
      priority: 3,
      render: (value: any, teacher: Teacher) => teacher.user?.email || 'Email não disponível'
    },
    {
      key: 'specialization',
      label: 'Especialização',
      priority: 2,
      render: (value: string) => value || 'N/A'
    },
    {
      key: 'salary',
      label: 'Salário',
      priority: 4,
      render: (value: number) => `R$ ${(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    },
    {
      key: 'status',
      label: 'Status',
      priority: 4,
      render: (value: string, teacher: Teacher) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          (teacher.status || 'active') === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {(teacher.status || 'active') === 'active' ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      priority: 1,
      render: (value: any, teacher: Teacher) => (
        <ResponsiveButtonGroup spacing="sm">
          <ResponsiveButton
            size="sm"
            variant="ghost"
            onClick={() => handleViewTeacher(teacher)}
            icon={Eye}
            className="text-green-600 hover:text-green-700"
          >
            <span className="sr-only">Ver</span>
          </ResponsiveButton>
          <ResponsiveButton
            size="sm"
            variant="ghost"
            onClick={() => handleEditTeacher(teacher)}
            icon={Edit}
            className="text-indigo-600 hover:text-indigo-700"
          >
            <span className="sr-only">Editar</span>
          </ResponsiveButton>
          <ResponsiveButton
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteTeacher(teacher)}
            disabled={deleteLoading === teacher.id}
            loading={deleteLoading === teacher.id}
            icon={Trash2}
            className="text-red-600 hover:text-red-700"
          >
            <span className="sr-only">Excluir</span>
          </ResponsiveButton>
        </ResponsiveButtonGroup>
      )
    }
  ];

  if (isLoading) {
    return <ResponsiveTable data={[]} columns={teachersTableColumns} loading={true} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            Professores
          </h1>
          <p className="text-sm sm:text-base mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Gerencie os professores da escola
          </p>
        </div>
        <ResponsiveButton 
          onClick={handleNewTeacher}
          icon={Plus}
          iconPosition="left"
          size="md"
        >
          Novo Professor
        </ResponsiveButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <ResponsiveCard>
          <ResponsiveCardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  Total de Professores
                </p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {teachers?.length || 0}
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
                  Professores Ativos
                </p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {teachers?.filter(t => (t.status || 'active') === 'active').length || 0}
                </p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
        
        <ResponsiveCard className="sm:col-span-2 lg:col-span-1">
          <ResponsiveCardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  Professores Inativos
                </p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {teachers?.filter(t => (t.status || 'active') === 'inactive').length || 0}
                </p>
              </div>
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
      </div>

      {/* Teachers Table */}
      <ResponsiveCard>
        <ResponsiveCardHeader>
          <ResponsiveCardTitle>Lista de Professores</ResponsiveCardTitle>
        </ResponsiveCardHeader>
        <ResponsiveCardContent>
          <ResponsiveTable
            data={filteredTeachers.filter(teacher => teacher && teacher.id)}
            columns={teachersTableColumns}
            searchable
            onSearch={setSearchTerm}
            emptyMessage={searchTerm ? 'Nenhum professor encontrado' : 'Nenhum professor cadastrado'}
            mobileCardView={true}
          />
        </ResponsiveCardContent>
      </ResponsiveCard>

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