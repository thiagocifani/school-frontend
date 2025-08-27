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
  ClipboardCheck, 
  GraduationCap,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Heart
} from 'lucide-react';
import { studentApi, gradeApi, attendanceApi, tuitionApi, occurrenceApi } from '@/lib/api';

interface Student {
  id: number;
  name: string;
  birth_date: string;
  registration_number: string;
  status: string;
  cpf?: string;
  gender?: string;
  birth_place?: string;
  age?: number;
  // Medical and family info
  has_sibling_enrolled?: boolean;
  sibling_name?: string;
  has_specialist_monitoring?: boolean;
  specialist_details?: string;
  has_medication_allergy?: boolean;
  medication_allergy_details?: string;
  has_food_allergy?: boolean;
  food_allergy_details?: string;
  has_medical_treatment?: boolean;
  medical_treatment_details?: string;
  uses_specific_medication?: boolean;
  specific_medication_details?: string;
  school_class?: {
    id: number;
    name: string;
  } | null;
  guardians: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    cpf?: string;
    birth_date?: string;
    age?: number;
    rg?: string;
    profession?: string;
    marital_status?: string;
    address?: string;
    neighborhood?: string;
    complement?: string;
    zip_code?: string;
    relationship: string;
    emergency_phone?: string;
  }>;
}

interface Subject {
  id: number;
  name: string;
  teacher: {
    user: {
      name: string;
    };
  };
}

interface Attendance {
  id: number;
  date: string;
  status: string;
  subject: {
    name: string;
  };
  observation?: string;
}

interface Grade {
  id: number;
  value: number;
  grade_type: string;
  date: string;
  subject: {
    name: string;
  };
  observation?: string;
}

interface Tuition {
  id: number;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: string;
  payment_method?: string;
  discount: number;
  late_fee: number;
}

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentDetails();
  }, [studentId]);

  const loadStudentDetails = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do aluno
      const { data: studentData } = await studentApi.getById(Number(studentId));
      setStudent(studentData);

      // Carregar matérias do aluno a partir da turma
      try {
        if (studentData?.school_class?.id) {
          const classId = studentData.school_class.id;
          // Reutiliza classes API via fetch direto
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
          });
          if (res.ok) {
            const classData = await res.json();
            const classSubjects = (classData?.subjects || []).map((cs: any) => ({
              id: cs?.subject?.id || cs?.id,
              name: cs?.subject?.name || 'Matéria',
              teacher: { user: { name: cs?.teacher?.user?.name || 'Professor' } }
            }));
            setSubjects(classSubjects);
          } else {
            setSubjects([]);
          }
        } else {
          setSubjects([]);
        }
      } catch (e) {
        setSubjects([]);
      }

      // Carregar presenças (normalizando para conter subject.name)
      try {
        const { data: attendancesData } = await attendanceApi.getAll({ student_id: studentId });
        const normalized = (attendancesData || []).map((a: any) => ({
          id: a.id,
          date: a.lesson?.date || a.date,
          status: a.status,
          subject: { name: a.lesson?.subject || a.subject?.name || 'Matéria' },
          observation: a.observation,
        }));
        setAttendances(normalized);
      } catch (error) {
        console.log('Attendances data not available');
        setAttendances([]);
      }

      // Carregar notas (normalizando para conter subject.name e grade_type)
      try {
        const { data: gradesData } = await gradeApi.getAll({ student_id: studentId });
        const normalized = (gradesData || []).map((g: any) => ({
          id: g.id,
          value: g.value,
          grade_type: g.grade_type || g.gradeType,
          date: g.date,
          subject: { name: g.subject?.name || g.diary?.subject?.name || 'Matéria' },
          observation: g.observation,
        }));
        setGrades(normalized);
      } catch (error) {
        console.log('Grades data not available');
        setGrades([]);
      }

      // Carregar mensalidades
      try {
        const { data: tuitionsData } = await tuitionApi.getAll({ student_id: studentId });
        setTuitions(tuitionsData || []);
      } catch (error) {
        console.log('Tuitions data not available');
        setTuitions([]);
      }

    } catch (error) {
      console.error('Erro ao carregar detalhes do aluno:', error);
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
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      transferred: 'bg-blue-100 text-blue-800',
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      justified: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      transferred: 'Transferido',
      present: 'Presente',
      absent: 'Ausente',
      late: 'Atrasado',
      justified: 'Justificado',
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Em Atraso',
      cancelled: 'Cancelado'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const calculateAttendancePercentage = () => {
    if (!attendances || attendances.length === 0) return 0;
    const present = attendances.filter(a => a?.status === 'present').length;
    return ((present / attendances.length) * 100).toFixed(1);
  };

  const calculateAverageGrade = () => {
    if (!grades || grades.length === 0) return 0;
    const validGrades = grades.filter(grade => grade?.value != null);
    if (validGrades.length === 0) return 0;
    const total = validGrades.reduce((sum, grade) => sum + (parseFloat(grade.value?.toString()) || 0), 0);
    return (total / validGrades.length).toFixed(1);
  };

  const getTotalTuitions = () => {
    if (!tuitions || tuitions.length === 0) return 0;
    return tuitions.reduce((sum, tuition) => {
      const amount = parseFloat(tuition?.amount?.toString()) || 0;
      const lateFee = parseFloat((tuition?.late_fee || 0).toString()) || 0;
      const discount = parseFloat((tuition?.discount || 0).toString()) || 0;
      return sum + amount + lateFee - discount;
    }, 0);
  };

  const getPendingTuitions = () => {
    if (!tuitions || tuitions.length === 0) return 0;
    return tuitions.filter(t => t?.status === 'pending' || t?.status === 'overdue').length;
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

  if (!student) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-700">Aluno não encontrado</h2>
          <Button onClick={() => router.push('/dashboard/students')} className="mt-4">
            Voltar para Alunos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/dashboard/students')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{student?.name || 'Nome não disponível'}</h1>
          <p className="text-gray-600">
            Matrícula: {student?.registration_number || 'N/A'} • {student?.school_class?.grade_level?.name || 'N/A'} - {student?.school_class?.name || 'N/A'}
          </p>
        </div>
        <div className="ml-auto">
          {student?.status && getStatusBadge(student.status)}
        </div>
      </div>

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Frequência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {calculateAttendancePercentage()}%
            </div>
            <p className="text-xs text-gray-500">{attendances?.length || 0} aulas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Média Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {calculateAverageGrade()}
            </div>
            <p className="text-xs text-gray-500">{grades?.length || 0} notas lançadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Mensalidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {formatCurrency(getTotalTuitions())}
            </div>
            <p className="text-xs text-gray-500">{tuitions?.length || 0} mensalidades</p>
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
              {getPendingTuitions()}
            </div>
            <p className="text-xs text-gray-500">mensalidades pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Informações Gerais</TabsTrigger>
          <TabsTrigger value="medical">Info. Médicas</TabsTrigger>
          <TabsTrigger value="guardians">Responsáveis</TabsTrigger>
          <TabsTrigger value="subjects">Matérias</TabsTrigger>
          <TabsTrigger value="attendance">Frequência</TabsTrigger>
          <TabsTrigger value="grades">Notas</TabsTrigger>
          <TabsTrigger value="tuitions">Mensalidades</TabsTrigger>
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
                  <p className="text-gray-900">{student?.name || 'Nome não disponível'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Data de Nascimento</label>
                  <p className="text-gray-900">
                    {student?.birth_date ? new Date(student.birth_date).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Número de Matrícula</label>
                  <p className="text-gray-900">{student?.registration_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div>{student?.status && getStatusBadge(student.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Turma</label>
                  <p className="text-gray-900">
                    {student?.school_class?.name || 'Turma não definida'}
                  </p>
                </div>
                {student?.cpf && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">CPF</label>
                    <p className="text-gray-900">{student.cpf}</p>
                  </div>
                )}
                {student?.gender && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Gênero</label>
                    <p className="text-gray-900 capitalize">
                      {student.gender === 'male' ? 'Masculino' : student.gender === 'female' ? 'Feminino' : 'Outro'}
                    </p>
                  </div>
                )}
                {student?.birth_place && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Local de Nascimento</label>
                    <p className="text-gray-900">{student.birth_place}</p>
                  </div>
                )}
                {student?.age !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Idade</label>
                    <p className="text-gray-900">{student.age} anos</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <div className="space-y-6">
            {/* Informações Familiares */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Informações Familiares
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tem irmão matriculado nessa escola?</label>
                    <div className="text-gray-900 mt-1">
                      <Badge variant={student?.has_sibling_enrolled ? 'default' : 'secondary'}>
                        {student?.has_sibling_enrolled ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    {student?.has_sibling_enrolled && student?.sibling_name && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Qual:</strong> {student.sibling_name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Médicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Informações Médicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Acompanhamento especialista */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tem acompanhamento de algum especialista?</label>
                    <div className="text-gray-900 mt-1">
                      <Badge variant={student?.has_specialist_monitoring ? 'default' : 'secondary'}>
                        {student?.has_specialist_monitoring ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    {student?.has_specialist_monitoring && student?.specialist_details && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Qual:</strong> {student.specialist_details}
                      </p>
                    )}
                  </div>

                  {/* Alergia medicamento */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">É alérgico a algum medicamento?</label>
                    <div className="text-gray-900 mt-1">
                      <Badge variant={student?.has_medication_allergy ? 'destructive' : 'secondary'}>
                        {student?.has_medication_allergy ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    {student?.has_medication_allergy && student?.medication_allergy_details && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Qual:</strong> {student.medication_allergy_details}
                      </p>
                    )}
                  </div>

                  {/* Alergia alimentar */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">É alérgico a algum alimento?</label>
                    <div className="text-gray-900 mt-1">
                      <Badge variant={student?.has_food_allergy ? 'destructive' : 'secondary'}>
                        {student?.has_food_allergy ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    {student?.has_food_allergy && student?.food_allergy_details && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Qual:</strong> {student.food_allergy_details}
                      </p>
                    )}
                  </div>

                  {/* Tratamento médico */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Está fazendo algum tratamento médico?</label>
                    <div className="text-gray-900 mt-1">
                      <Badge variant={student?.has_medical_treatment ? 'default' : 'secondary'}>
                        {student?.has_medical_treatment ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    {student?.has_medical_treatment && student?.medical_treatment_details && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Qual:</strong> {student.medical_treatment_details}
                      </p>
                    )}
                  </div>

                  {/* Medicação específica */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Faz uso de algum tipo de medicação específica?</label>
                    <div className="text-gray-900 mt-1">
                      <Badge variant={student?.uses_specific_medication ? 'default' : 'secondary'}>
                        {student?.uses_specific_medication ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    {student?.uses_specific_medication && student?.specific_medication_details && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Qual:</strong> {student.specific_medication_details}
                      </p>
                    )}
                  </div>
                </div>

                {/* Aviso se não há informações médicas */}
                {!student?.has_sibling_enrolled && 
                 !student?.has_specialist_monitoring && 
                 !student?.has_medication_allergy && 
                 !student?.has_food_allergy && 
                 !student?.has_medical_treatment && 
                 !student?.uses_specific_medication && (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma informação médica especial registrada</p>
                    <p className="text-sm">Todas as respostas foram "Não"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guardians">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Responsáveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student?.guardians?.map((guardian) => (
                  <div key={guardian.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Nome</label>
                        <p className="text-gray-900">{guardian?.name || 'Nome não disponível'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Parentesco</label>
                        <p className="text-gray-900 capitalize">{guardian?.relationship || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {guardian?.email || 'Email não disponível'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Telefone</label>
                        <p className="text-gray-900 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {guardian?.phone || 'Telefone não disponível'}
                        </p>
                      </div>
                      {guardian?.cpf && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">CPF</label>
                          <p className="text-gray-900">{guardian.cpf}</p>
                        </div>
                      )}
                      {guardian?.rg && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">RG</label>
                          <p className="text-gray-900">{guardian.rg}</p>
                        </div>
                      )}
                      {guardian?.profession && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Profissão</label>
                          <p className="text-gray-900">{guardian.profession}</p>
                        </div>
                      )}
                      {guardian?.birth_date && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Data de Nascimento</label>
                          <p className="text-gray-900">
                            {new Date(guardian.birth_date).toLocaleDateString('pt-BR')}
                            {guardian.age && ` (${guardian.age} anos)`}
                          </p>
                        </div>
                      )}
                      {guardian?.emergency_phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Telefone de Emergência</label>
                          <p className="text-gray-900">{guardian.emergency_phone}</p>
                        </div>
                      )}
                      {guardian?.address && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-700">Endereço Completo</label>
                          <p className="text-gray-900">
                            {guardian.address}
                            {guardian.complement && `, ${guardian.complement}`}
                            {guardian.neighborhood && ` - ${guardian.neighborhood}`}
                            {guardian.zip_code && ` - CEP: ${guardian.zip_code}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {(!student?.guardians || student.guardians.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum responsável cadastrado</p>
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
                Matérias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left">Matéria</th>
                      <th className="px-4 py-3 text-left">Professor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject) => (
                      <tr key={subject?.id} className="border-b">
                        <td className="px-4 py-3">{subject?.name || 'N/A'}</td>
                        <td className="px-4 py-3">{subject?.teacher?.user?.name || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Registro de Frequência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left">Data</th>
                      <th className="px-4 py-3 text-left">Matéria</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendances.slice(0, 20).map((attendance) => (
                      <tr key={attendance?.id} className="border-b">
                        <td className="px-4 py-3">
                          {attendance?.date ? new Date(attendance.date).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                        <td className="px-4 py-3">{attendance?.subject?.name || 'N/A'}</td>
                        <td className="px-4 py-3">{attendance?.status && getStatusBadge(attendance.status)}</td>
                        <td className="px-4 py-3">{attendance?.observation || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(attendances?.length || 0) > 20 && (
                <p className="text-sm text-gray-500 mt-4">
                  Mostrando as últimas 20 presenças de {attendances?.length || 0} registros
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Notas e Avaliações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left">Data</th>
                      <th className="px-4 py-3 text-left">Matéria</th>
                      <th className="px-4 py-3 text-left">Tipo</th>
                      <th className="px-4 py-3 text-left">Nota</th>
                      <th className="px-4 py-3 text-left">Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade) => (
                      <tr key={grade?.id} className="border-b">
                        <td className="px-4 py-3">
                          {grade?.date ? new Date(grade.date).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                        <td className="px-4 py-3">{grade?.subject?.name || 'N/A'}</td>
                        <td className="px-4 py-3">{grade?.grade_type || 'N/A'}</td>
                        <td className="px-4 py-3">
                          {(() => {
                            const gradeValue = parseFloat(grade?.value?.toString()) || 0;
                            const colorClass = gradeValue >= 7 ? 'text-green-600' : gradeValue >= 5 ? 'text-yellow-600' : 'text-red-600';
                            return (
                              <span className={`font-bold ${colorClass}`}>
                                {grade?.value != null ? gradeValue.toFixed(1) : 'N/A'}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3">{grade?.observation || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tuitions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Mensalidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left">Vencimento</th>
                      <th className="px-4 py-3 text-left">Valor</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Pagamento</th>
                      <th className="px-4 py-3 text-left">Método</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tuitions.map((tuition) => (
                      <tr key={tuition.id} className="border-b">
                        <td className="px-4 py-3">
                          {new Date(tuition.due_date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          R$ {formatCurrency(
                            parseFloat(tuition.amount.toString()) + 
                            parseFloat((tuition.late_fee || 0).toString()) - 
                            parseFloat((tuition.discount || 0).toString())
                          )}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(tuition.status)}</td>
                        <td className="px-4 py-3">
                          {tuition.paid_date 
                            ? new Date(tuition.paid_date).toLocaleDateString('pt-BR')
                            : '-'
                          }
                        </td>
                        <td className="px-4 py-3">{tuition.payment_method || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}