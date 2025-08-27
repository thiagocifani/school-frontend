'use client';

import { useState, useEffect } from 'react';
import { ResponsiveCard, ResponsiveCardContent, ResponsiveCardHeader, ResponsiveCardTitle } from '@/components/ui/responsive-card';
import { ResponsiveButton, ResponsiveButtonGroup } from '@/components/ui/responsive-button';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { useStudents } from '@/hooks/useStudents';
import { StudentForm } from '@/components/forms/student-form';
import { Users, Plus, Search, Edit, Trash2, AlertCircle, Eye } from 'lucide-react';
import { Student } from '@/types';
import { useRouter } from 'next/navigation';
import { studentApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function StudentsPage() {
  const { data: students, isLoading, refetch } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const filteredStudents = students?.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleNewStudent = () => {
    setSelectedStudent(null);
    setModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const handleViewStudent = (student: Student) => {
    router.push(`/dashboard/students/${student.id}`);
  };

  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`Tem certeza que deseja remover o aluno "${student.name}"?`)) {
      return;
    }

    setDeleteLoading(student.id);
    try {
      await studentApi.delete(student.id);
      toast.success('Aluno removido com sucesso!');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao remover aluno');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleModalSuccess = () => {
    refetch();
  };

  const studentsTableColumns = [
    {
      key: 'name',
      label: 'Nome',
      priority: 5,
      render: (value: string, student: Student) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center" 
               style={{ background: 'var(--primary)' }}>
            <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--primary-foreground)' }}>
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium">{value}</div>
          </div>
        </div>
      ),
      mobileRender: (value: string) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'registrationNumber',
      label: 'Matrícula',
      priority: 3,
      render: (value: string) => value || 'N/A'
    },
    {
      key: 'schoolClass',
      label: 'Turma',
      priority: 2,
      render: (value: any, student: Student) => {
        const schoolClass = student.schoolClass || student.school_class;
        return schoolClass?.name || 'Sem turma';
      }
    },
    {
      key: 'status',
      label: 'Status',
      priority: 4,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value === 'active' ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      priority: 1,
      render: (value: any, student: Student) => (
        <ResponsiveButtonGroup spacing="sm">
          <ResponsiveButton
            size="sm"
            variant="ghost"
            onClick={() => handleViewStudent(student)}
            icon={Eye}
            className="text-green-600 hover:text-green-700"
          >
            <span className="sr-only">Ver</span>
          </ResponsiveButton>
          <ResponsiveButton
            size="sm"
            variant="ghost"
            onClick={() => handleEditStudent(student)}
            icon={Edit}
            className="text-indigo-600 hover:text-indigo-700"
          >
            <span className="sr-only">Editar</span>
          </ResponsiveButton>
          <ResponsiveButton
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteStudent(student)}
            disabled={deleteLoading === student.id}
            loading={deleteLoading === student.id}
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
    return <ResponsiveTable data={[]} columns={studentsTableColumns} loading={true} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            Alunos
          </h1>
          <p className="text-sm sm:text-base mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Gerencie os alunos da escola
          </p>
        </div>
        <ResponsiveButton 
          onClick={handleNewStudent}
          icon={Plus}
          iconPosition="left"
          size="md"
        >
          Novo Aluno
        </ResponsiveButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <ResponsiveCard>
          <ResponsiveCardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  Total de Alunos
                </p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {students?.length || 0}
                </p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
        
        <ResponsiveCard>
          <ResponsiveCardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  Alunos Ativos
                </p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {students?.filter(s => s.status === 'active').length || 0}
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
                  Alunos Inativos
                </p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {students?.filter(s => s.status !== 'active').length || 0}
                </p>
              </div>
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
      </div>

      {/* Students Table */}
      <ResponsiveCard>
        <ResponsiveCardHeader>
          <ResponsiveCardTitle>Lista de Alunos</ResponsiveCardTitle>
        </ResponsiveCardHeader>
        <ResponsiveCardContent>
          <ResponsiveTable
            data={filteredStudents}
            columns={studentsTableColumns}
            searchable
            onSearch={setSearchTerm}
            emptyMessage={searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
            mobileCardView={true}
          />
        </ResponsiveCardContent>
      </ResponsiveCard>

      {/* Student Form */}
      {modalOpen && (
        <StudentForm
          student={selectedStudent}
          onSubmit={async (data) => {
            try {
              if (selectedStudent) {
                await studentApi.update(selectedStudent.id, data);
              } else {
                await studentApi.create(data);
              }
              setModalOpen(false);
              setSelectedStudent(null);
              refetch();
              toast.success(selectedStudent ? 'Aluno atualizado com sucesso!' : 'Aluno criado com sucesso!');
            } catch (error: any) {
              toast.error(error.response?.data?.error || 'Erro ao salvar aluno');
            }
          }}
          onCancel={() => {
            setModalOpen(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
}