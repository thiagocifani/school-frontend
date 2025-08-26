'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Users, 
  ArrowLeft,
  Filter,
  Printer,
  Calendar,
  GraduationCap,
  Phone,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { classApi, studentApi } from '@/lib/api';
import type { SchoolClass, Student } from '@/types';

export default function StudentsReportsPage() {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [studentsData, setStudentsData] = useState<any[]>([]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      generateStudentReport();
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const { data } = await classApi.getAll();
      setClasses(data);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      toast.error('Erro ao carregar turmas');
    }
  };

  const generateStudentReport = async () => {
    setLoading(true);
    try {
      let students: Student[] = [];
      
      if (selectedClass === 'all') {
        const { data } = await studentApi.getAll();
        students = data;
      } else {
        const { data } = await studentApi.getAll({ classId: selectedClass });
        students = data;
      }

      // Simular dados adicionais dos estudantes
      const enrichedData = students.map(student => ({
        id: student.id,
        name: student.name,
        registrationNumber: student.registrationNumber,
        birthDate: student.birthDate,
        age: student.birthDate ? new Date().getFullYear() - new Date(student.birthDate).getFullYear() : null,
        status: student.status,
        schoolClass: student.schoolClass?.name || 'Não atribuída',
        guardians: student.guardians || [],
        // Dados simulados
        averageGrade: (Math.random() * 3 + 7).toFixed(1), // 7.0 - 10.0
        attendanceRate: Math.floor(Math.random() * 15) + 85, // 85% - 99%
        enrollmentDate: '2024-02-01',
        medicalInfo: Math.random() > 0.7 ? 'Possui restrições alimentares' : null,
        specialNeeds: Math.random() > 0.9 ? 'Acompanhamento psicopedagógico' : null
      }));

      setStudentsData(enrichedData);
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Inativo</Badge>;
      case 'transferred':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Transferido</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  const exportToPDF = () => {
    toast.success('Exportando relatório para PDF...');
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <Users className="w-8 h-8" />
              Relatório de Alunos
            </h1>
            <p style={{ color: 'var(--muted-foreground)' }} className="text-lg">
              Listagem completa de alunos por turma
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card style={{ 
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>
                Turma
              </label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  {classes.map(schoolClass => (
                    <SelectItem key={schoolClass.id} value={schoolClass.id.toString()}>
                      {schoolClass.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={generateStudentReport} 
                disabled={loading}
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                {loading ? 'Gerando...' : 'Atualizar Relatório'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relatório */}
      {studentsData.length > 0 && (
        <Card style={{ 
          background: 'var(--card)',
          border: '1px solid var(--border)'
        }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle style={{ color: 'var(--foreground)' }}>
              Relatório de Alunos - {selectedClass === 'all' ? 'Todas as turmas' : classes.find(c => c.id === parseInt(selectedClass))?.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={printReport}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Estatísticas resumidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                  {studentsData.length}
                </div>
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Total de Alunos
                </div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {studentsData.filter(s => s.status === 'active').length}
                </div>
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Alunos Ativos
                </div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                  {studentsData.length > 0 
                    ? Math.round(studentsData.reduce((sum, s) => sum + parseFloat(s.averageGrade), 0) / studentsData.length * 10) / 10
                    : 0}
                </div>
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Média Geral
                </div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {studentsData.length > 0 
                    ? Math.round(studentsData.reduce((sum, s) => sum + s.attendanceRate, 0) / studentsData.length)
                    : 0}%
                </div>
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Frequência Média
                </div>
              </Card>
            </div>

            {/* Tabela de alunos */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th className="text-left py-3 font-bold" style={{ color: 'var(--foreground)' }}>Aluno</th>
                    <th className="text-center py-3 font-bold" style={{ color: 'var(--foreground)' }}>Matrícula</th>
                    <th className="text-center py-3 font-bold" style={{ color: 'var(--foreground)' }}>Idade</th>
                    <th className="text-left py-3 font-bold" style={{ color: 'var(--foreground)' }}>Turma</th>
                    <th className="text-center py-3 font-bold" style={{ color: 'var(--foreground)' }}>Média</th>
                    <th className="text-center py-3 font-bold" style={{ color: 'var(--foreground)' }}>Frequência</th>
                    <th className="text-center py-3 font-bold" style={{ color: 'var(--foreground)' }}>Status</th>
                    <th className="text-left py-3 font-bold" style={{ color: 'var(--foreground)' }}>Responsáveis</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.map((student) => (
                    <tr key={student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3">
                        <div>
                          <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                            {student.name}
                          </div>
                          {student.birthDate && (
                            <div className="text-xs flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                              <Calendar className="w-3 h-3" />
                              {new Date(student.birthDate).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-center font-mono" style={{ color: 'var(--muted-foreground)' }}>
                        {student.registrationNumber || '-'}
                      </td>
                      <td className="py-3 text-center" style={{ color: 'var(--foreground)' }}>
                        {student.age || '-'} anos
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                          <span style={{ color: 'var(--foreground)' }}>{student.schoolClass}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`font-bold ${
                          parseFloat(student.averageGrade) >= 7 ? 'text-green-600 dark:text-green-400' :
                          parseFloat(student.averageGrade) >= 5 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {student.averageGrade}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant={student.attendanceRate >= 75 ? "default" : "destructive"}>
                          {student.attendanceRate}%
                        </Badge>
                      </td>
                      <td className="py-3 text-center">
                        {getStatusBadge(student.status)}
                      </td>
                      <td className="py-3">
                        <div className="space-y-1">
                          {student.guardians.slice(0, 2).map((guardian: any, index: number) => (
                            <div key={index} className="text-xs">
                              <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                                {guardian.name}
                              </div>
                              {guardian.phone && (
                                <div className="flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                                  <Phone className="w-3 h-3" />
                                  {guardian.phone}
                                </div>
                              )}
                              {guardian.email && (
                                <div className="flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                                  <Mail className="w-3 h-3" />
                                  {guardian.email}
                                </div>
                              )}
                            </div>
                          ))}
                          {student.guardians.length > 2 && (
                            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              +{student.guardians.length - 2} mais
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Observações especiais */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                Observações Especiais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2 text-orange-600 dark:text-orange-400">
                    Informações Médicas
                  </h4>
                  <div className="space-y-1 text-sm">
                    {studentsData.filter(s => s.medicalInfo).map(student => (
                      <div key={student.id}>
                        <strong>{student.name}:</strong> {student.medicalInfo}
                      </div>
                    ))}
                    {studentsData.filter(s => s.medicalInfo).length === 0 && (
                      <div style={{ color: 'var(--muted-foreground)' }}>
                        Nenhuma restrição médica registrada
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2 text-blue-600 dark:text-blue-400">
                    Necessidades Especiais
                  </h4>
                  <div className="space-y-1 text-sm">
                    {studentsData.filter(s => s.specialNeeds).map(student => (
                      <div key={student.id}>
                        <strong>{student.name}:</strong> {student.specialNeeds}
                      </div>
                    ))}
                    {studentsData.filter(s => s.specialNeeds).length === 0 && (
                      <div style={{ color: 'var(--muted-foreground)' }}>
                        Nenhuma necessidade especial registrada
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}