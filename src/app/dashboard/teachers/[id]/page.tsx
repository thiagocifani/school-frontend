'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  User, 
  Users, 
  BookOpen, 
  GraduationCap,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { teacherApi, classApi, salaryApi } from '@/lib/api';

interface Teacher {
  id: number;
  salary: number;
  hire_date: string;
  user: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
}

interface SchoolClass {
  id: number;
  name: string;
  section: string;
  period: string;
  max_students: number;
  grade_level: {
    name: string;
    education_level: {
      name: string;
    };
  };
  students_count: number;
  role: 'main_teacher' | 'subject_teacher';
}

interface Subject {
  id: number;
  name: string;
  weekly_hours: number;
  school_class: {
    name: string;
    grade_level: {
      name: string;
    };
  };
}

interface Salary {
  id: number;
  amount: number;
  month: number;
  year: number;
  bonus: number;
  deductions: number;
  status: string;
  payment_date?: string;
}

export default function TeacherDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    loadTeacherDetails();
  }, [teacherId]);

  const loadTeacherDetails = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do professor (inclui turmas e matérias)
      const { data: teacherData } = await teacherApi.getById(Number(teacherId));
      setTeacher(teacherData);

      // Carregar turmas do professor (agora vem do backend)
      setClasses(teacherData.classes || []);

      // Carregar matérias do professor (agora vem do backend)  
      setSubjects(teacherData.subjects || []);

      // Carregar salários
      try {
        const { data: salariesData } = await salaryApi.getAll({ teacher_id: teacherId });
        setSalaries(salariesData || []);
      } catch (error) {
        console.log('Salaries data not available');
        setSalaries([]);
      }

    } catch (error) {
      console.error('Erro ao carregar detalhes do professor:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: any) => {
    const numValue = parseFloat(value?.toString()) || 0;
    return numValue.toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
    };

    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPeriodLabel = (period: string) => {
    const periods = {
      morning: 'Manhã',
      afternoon: 'Tarde',
      evening: 'Noite',
      fulltime: 'Integral'
    };
    return periods[period as keyof typeof periods] || period;
  };

  const calculateTotalStudents = () => {
    return classes.reduce((total, cls) => total + (cls.students_count || 0), 0);
  };

  const calculateTotalWeeklyHours = () => {
    return subjects.reduce((total, subject) => total + subject.weekly_hours, 0);
  };

  const getLastSalary = () => {
    if (salaries.length === 0) return null;
    return salaries.sort((a, b) => b.year - a.year || b.month - a.month)[0];
  };

  const getPendingSalaries = () => {
    return salaries.filter(s => s.status === 'pending').length;
  };

  const calculateSalaryTotal = (salary: Salary) => {
    const amount = parseFloat(salary.amount.toString()) || 0;
    const bonus = parseFloat((salary.bonus || 0).toString()) || 0;
    const deductions = parseFloat((salary.deductions || 0).toString()) || 0;
    return amount + bonus - deductions;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-700">Professor não encontrado</h2>
          <Button onClick={() => router.push('/dashboard/teachers')} className="mt-4">
            Voltar para Professores
          </Button>
        </div>
      </div>
    );
  }

  const lastSalary = getLastSalary();

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/dashboard/teachers')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{teacher?.user?.name || 'Nome não disponível'}</h1>
          <p className="text-gray-600">
            Contratado em: {teacher?.hire_date ? new Date(teacher.hire_date).toLocaleDateString('pt-BR') : 'N/A'}
          </p>
        </div>
      </div>

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Turmas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {classes.length}
            </div>
            <p className="text-xs text-gray-500">{calculateTotalStudents()} alunos total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Matérias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {subjects.length}
            </div>
            <p className="text-xs text-gray-500">{calculateTotalWeeklyHours()}h semanais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Salário Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {formatCurrency(teacher.salary)}
            </div>
            <p className="text-xs text-gray-500">mensal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Pendências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {getPendingSalaries()}
            </div>
            <p className="text-xs text-gray-500">salários pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Informações Gerais</TabsTrigger>
          <TabsTrigger value="classes">Turmas</TabsTrigger>
          <TabsTrigger value="subjects">Matérias</TabsTrigger>
          <TabsTrigger value="salaries">Salários</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                  <p className="text-gray-900">{teacher?.user?.name || 'Nome não disponível'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">CPF</label>
                  <p className="text-gray-900">{teacher?.user?.cpf || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {teacher?.user?.email || 'Email não disponível'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Telefone</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {teacher?.user?.phone || 'Telefone não disponível'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Data de Contratação</label>
                  <p className="text-gray-900">
                    {new Date(teacher.hire_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Salário Base</label>
                  <p className="text-gray-900">R$ {formatCurrency(teacher.salary)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Turmas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classes.map((schoolClass) => (
                  <div key={schoolClass.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Turma</label>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900 font-semibold">
                            {schoolClass?.grade_level?.name && schoolClass?.name 
                              ? `${schoolClass.grade_level.name} - ${schoolClass.name} ${schoolClass.section || ''}`
                              : 'Nome não disponível'}
                          </p>
                          <Badge 
                            className={schoolClass.role === 'main_teacher' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                            }
                          >
                            {schoolClass.role === 'main_teacher' ? 'Professor Principal' : 'Professor de Matéria'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Período</label>
                        <p className="text-gray-900">{schoolClass?.period ? getPeriodLabel(schoolClass.period) : 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Alunos</label>
                        <p className="text-gray-900">
                          {schoolClass?.students_count || 0} / {schoolClass?.max_students || 0}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Nível de Ensino</label>
                        <p className="text-gray-900">{schoolClass?.grade_level?.education_level?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {classes.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Nenhuma turma atribuída a este professor
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      O professor ainda não foi designado como professor principal nem possui matérias atribuídas
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Matérias Lecionadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left">Matéria</th>
                      <th className="px-4 py-3 text-left">Turma</th>
                      <th className="px-4 py-3 text-left">Série</th>
                      <th className="px-4 py-3 text-left">Carga Horária</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject) => (
                      <tr key={subject?.id} className="border-b">
                        <td className="px-4 py-3 font-medium">{subject?.name || 'N/A'}</td>
                        <td className="px-4 py-3">{subject?.school_class?.name || 'N/A'}</td>
                        <td className="px-4 py-3">{subject?.school_class?.grade_level?.name || 'N/A'}</td>
                        <td className="px-4 py-3">{subject?.weekly_hours ? `${subject.weekly_hours}h/semana` : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {subjects.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Nenhuma matéria atribuída
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salaries">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Histórico de Salários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left">Mês/Ano</th>
                      <th className="px-4 py-3 text-left">Salário Base</th>
                      <th className="px-4 py-3 text-left">Bônus</th>
                      <th className="px-4 py-3 text-left">Descontos</th>
                      <th className="px-4 py-3 text-left">Total Líquido</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Pagamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaries
                      .sort((a, b) => b.year - a.year || b.month - a.month)
                      .map((salary) => (
                      <tr key={salary.id} className="border-b">
                        <td className="px-4 py-3">
                          {months[salary.month - 1]} {salary.year}
                        </td>
                        <td className="px-4 py-3">R$ {formatCurrency(salary.amount)}</td>
                        <td className="px-4 py-3">
                          {salary.bonus > 0 ? `R$ ${formatCurrency(salary.bonus)}` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {salary.deductions > 0 ? `R$ ${formatCurrency(salary.deductions)}` : '-'}
                        </td>
                        <td className="px-4 py-3 font-bold">
                          R$ {formatCurrency(calculateSalaryTotal(salary))}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(salary.status)}</td>
                        <td className="px-4 py-3">
                          {salary.payment_date 
                            ? new Date(salary.payment_date).toLocaleDateString('pt-BR')
                            : '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {salaries.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum salário registrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}