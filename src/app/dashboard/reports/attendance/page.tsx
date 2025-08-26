'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Calendar, 
  Users, 
  ClipboardList,
  ArrowLeft,
  Filter,
  FileText,
  Printer
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { schoolClassApi, studentApi } from '@/lib/api';
import type { SchoolClass, Student } from '@/types';

export default function AttendanceReportsPage() {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudentsByClass();
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const { data } = await schoolClassApi.getAll();
      setClasses(data);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      toast.error('Erro ao carregar turmas');
    }
  };

  const loadStudentsByClass = async () => {
    try {
      const { data } = await studentApi.getAll({ classId: selectedClass });
      setStudents(data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      toast.error('Erro ao carregar alunos');
    }
  };

  const generateClassReport = async () => {
    if (!selectedClass || !startDate || !endDate) {
      toast.error('Selecione uma turma e o período');
      return;
    }

    setLoading(true);
    try {
      // Simular dados de presença
      const mockData = students.map(student => ({
        id: student.id,
        name: student.name,
        totalClasses: 20,
        present: Math.floor(Math.random() * 3) + 18, // 18-20 presenças
        absent: Math.floor(Math.random() * 3), // 0-2 faltas
        late: Math.floor(Math.random() * 2), // 0-1 atrasos
        percentage: 0
      }));

      // Calcular percentual
      mockData.forEach(student => {
        student.percentage = Math.round((student.present / student.totalClasses) * 100);
      });

      setAttendanceData(mockData);
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const generateStudentReport = async () => {
    if (!selectedStudent || !startDate || !endDate) {
      toast.error('Selecione um aluno e o período');
      return;
    }

    setLoading(true);
    try {
      const student = students.find(s => s.id === parseInt(selectedStudent));
      if (!student) return;

      // Simular dados detalhados do aluno
      const mockData = [{
        id: student.id,
        name: student.name,
        class: classes.find(c => c.id === parseInt(selectedClass))?.name || '',
        totalClasses: 20,
        present: 19,
        absent: 1,
        late: 0,
        justified: 0,
        percentage: 95,
        dailyAttendance: [
          { date: '2025-08-26', status: 'present', subject: 'Matemática' },
          { date: '2025-08-25', status: 'present', subject: 'Português' },
          { date: '2025-08-24', status: 'absent', subject: 'História' },
          { date: '2025-08-23', status: 'present', subject: 'Geografia' },
        ]
      }];

      setAttendanceData(mockData);
      toast.success('Relatório individual gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    toast.success('Exportando para PDF...');
    // Implementar exportação real aqui
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
              <ClipboardList className="w-8 h-8" />
              Relatórios de Presença
            </h1>
            <p style={{ color: 'var(--muted-foreground)' }} className="text-lg">
              Relatórios de frequência por turma e por aluno
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>
                Turma
              </label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(schoolClass => (
                    <SelectItem key={schoolClass.id} value={schoolClass.id.toString()}>
                      {schoolClass.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>
                Data Início
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>
                Data Fim
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={generateClassReport} 
                disabled={loading || !selectedClass}
                className="w-full"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                {loading ? 'Gerando...' : 'Gerar Relatório'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para diferentes tipos de relatório */}
      <Tabs defaultValue="class" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="class" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Por Turma
          </TabsTrigger>
          <TabsTrigger value="student" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Por Aluno
          </TabsTrigger>
        </TabsList>

        <TabsContent value="class">
          {attendanceData.length > 0 && (
            <Card style={{ 
              background: 'var(--card)',
              border: '1px solid var(--border)'
            }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle style={{ color: 'var(--foreground)' }}>
                  Relatório de Presença da Turma
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
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th className="text-left py-2 font-medium" style={{ color: 'var(--foreground)' }}>Aluno</th>
                        <th className="text-center py-2 font-medium" style={{ color: 'var(--foreground)' }}>Total Aulas</th>
                        <th className="text-center py-2 font-medium" style={{ color: 'var(--foreground)' }}>Presenças</th>
                        <th className="text-center py-2 font-medium" style={{ color: 'var(--foreground)' }}>Faltas</th>
                        <th className="text-center py-2 font-medium" style={{ color: 'var(--foreground)' }}>Atrasos</th>
                        <th className="text-center py-2 font-medium" style={{ color: 'var(--foreground)' }}>Frequência</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.map((student, index) => (
                        <tr key={student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="py-3 font-medium" style={{ color: 'var(--foreground)' }}>
                            {student.name}
                          </td>
                          <td className="py-3 text-center" style={{ color: 'var(--muted-foreground)' }}>
                            {student.totalClasses}
                          </td>
                          <td className="py-3 text-center text-green-600 dark:text-green-400">
                            {student.present}
                          </td>
                          <td className="py-3 text-center text-red-600 dark:text-red-400">
                            {student.absent}
                          </td>
                          <td className="py-3 text-center text-yellow-600 dark:text-yellow-400">
                            {student.late}
                          </td>
                          <td className="py-3 text-center">
                            <Badge 
                              variant={student.percentage >= 75 ? "default" : "destructive"}
                              className="font-medium"
                            >
                              {student.percentage}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {attendanceData.reduce((sum, s) => sum + s.present, 0)}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      Total de Presenças
                    </div>
                  </Card>
                  
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {attendanceData.reduce((sum, s) => sum + s.absent, 0)}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      Total de Faltas
                    </div>
                  </Card>
                  
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                      {attendanceData.length > 0 
                        ? Math.round(attendanceData.reduce((sum, s) => sum + s.percentage, 0) / attendanceData.length)
                        : 0}%
                    </div>
                    <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      Frequência Média
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="student">
          <Card style={{ 
            background: 'var(--card)',
            border: '1px solid var(--border)'
          }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--foreground)' }}>
                Relatório Individual de Aluno
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  onClick={generateStudentReport} 
                  disabled={loading || !selectedStudent}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {loading ? 'Gerando...' : 'Gerar Relatório Individual'}
                </Button>
              </div>

              {attendanceData.length > 0 && attendanceData[0].dailyAttendance && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                    Histórico de Presenças - {attendanceData[0].name}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4 text-center">
                      <div className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                        {attendanceData[0].totalClasses}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Total de Aulas
                      </div>
                    </Card>
                    
                    <Card className="p-4 text-center">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {attendanceData[0].present}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Presenças
                      </div>
                    </Card>
                    
                    <Card className="p-4 text-center">
                      <div className="text-xl font-bold text-red-600 dark:text-red-400">
                        {attendanceData[0].absent}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Faltas
                      </div>
                    </Card>
                    
                    <Card className="p-4 text-center">
                      <div className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
                        {attendanceData[0].percentage}%
                      </div>
                      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Frequência
                      </div>
                    </Card>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th className="text-left py-2 font-medium" style={{ color: 'var(--foreground)' }}>Data</th>
                          <th className="text-left py-2 font-medium" style={{ color: 'var(--foreground)' }}>Matéria</th>
                          <th className="text-center py-2 font-medium" style={{ color: 'var(--foreground)' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceData[0].dailyAttendance.map((record: any, index: number) => (
                          <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td className="py-2" style={{ color: 'var(--foreground)' }}>
                              {new Date(record.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-2" style={{ color: 'var(--foreground)' }}>
                              {record.subject}
                            </td>
                            <td className="py-2 text-center">
                              <Badge 
                                variant={record.status === 'present' ? "default" : "destructive"}
                              >
                                {record.status === 'present' ? 'Presente' : 
                                 record.status === 'absent' ? 'Ausente' : 
                                 record.status === 'late' ? 'Atrasado' : 'Justificado'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}