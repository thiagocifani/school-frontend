'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface Guardian {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birth_date: string;
  age: number;
  rg: string;
  profession: string;
  marital_status: string;
  address: string;
  neighborhood: string;
  complement: string;
  zip_code: string;
  emergency_phone: string;
  students_count: number;
  created_at: string;
  updated_at: string;
}

interface GuardiansResponse {
  guardians: Guardian[];
  meta: {
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
    total_pages: number;
    total_count: number;
  };
}

export default function AdminGuardiansPage() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    next_page: null,
    prev_page: null
  });

  useEffect(() => {
    loadGuardians();
  }, [currentPage, searchTerm, emailFilter]);

  const loadGuardians = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(emailFilter && { email: emailFilter })
      };

      const { data } = await adminApi.guardians.getAll(params);
      setGuardians(data.guardians);
      setMeta(data.meta);
    } catch (error) {
      console.error('Error loading guardians:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (guardian: Guardian) => {
    if (confirm(`Deseja realmente excluir o responsável ${guardian.name}?`)) {
      try {
        await adminApi.guardians.delete(guardian.id);
        loadGuardians();
      } catch (error) {
        console.error('Error deleting guardian:', error);
      }
    }
  };

  const getMaritalStatusLabel = (status: string) => {
    const labels = {
      single: 'Solteiro(a)',
      married: 'Casado(a)',
      divorced: 'Divorciado(a)',
      widowed: 'Viúvo(a)'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading && guardians.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gerenciar Responsáveis</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Responsáveis</h1>
          <p className="text-gray-600 mt-1">
            Total: {meta.total_count} responsáveis
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Responsável
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Input
              placeholder="Filtrar por email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="max-w-sm"
            />
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setEmailFilter('');
                setCurrentPage(1);
              }}
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Guardians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guardians.map((guardian) => (
          <Card key={guardian.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{guardian.name}</CardTitle>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{guardian.students_count} estudante(s)</span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      // TODO: Navigate to guardian detail page
                      window.open(`/admin/guardians/${guardian.id}`, '_blank');
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedGuardian(guardian);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(guardian)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="truncate">{guardian.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{guardian.phone}</span>
                </div>
                {guardian.address && (
                  <div className="flex items-start text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {guardian.address}
                      {guardian.neighborhood && `, ${guardian.neighborhood}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Personal Info */}
              <div className="pt-2 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  {guardian.age && (
                    <div>
                      <span className="font-medium">Idade:</span> {guardian.age} anos
                    </div>
                  )}
                  {guardian.cpf && (
                    <div>
                      <span className="font-medium">CPF:</span> {guardian.cpf}
                    </div>
                  )}
                  {guardian.profession && (
                    <div>
                      <span className="font-medium">Profissão:</span> {guardian.profession}
                    </div>
                  )}
                  {guardian.marital_status && (
                    <div>
                      <span className="font-medium">Estado Civil:</span> {getMaritalStatusLabel(guardian.marital_status)}
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              {guardian.emergency_phone && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Emergência:</span> {guardian.emergency_phone}
                  </div>
                </div>
              )}

              {/* Creation Date */}
              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Cadastrado em {new Date(guardian.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {guardians.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum responsável encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || emailFilter
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Os responsáveis são criados automaticamente ao cadastrar estudantes.'}
              </p>
              {!searchTerm && !emailFilter && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Responsável
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {meta.total_pages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!meta.prev_page}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!meta.next_page}
            >
              Próxima
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando página <span className="font-medium">{meta.current_page}</span> de{' '}
                <span className="font-medium">{meta.total_pages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!meta.prev_page}
                  className="rounded-r-none"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!meta.next_page}
                  className="rounded-l-none"
                >
                  Próxima
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Guardian Form Modal - TODO: Create GuardianForm component */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {selectedGuardian ? 'Editar Responsável' : 'Novo Responsável'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Funcionalidade em desenvolvimento. Use o formulário de estudantes para criar responsáveis.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedGuardian(null);
                  }}
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}