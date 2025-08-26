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
  BookOpen, 
  Users, 
  GraduationCap,
  ArrowLeft,
  Filter,
  FileText,
  Printer,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { schoolClassApi, studentApi, subjectApi, academicTermApi } from '@/lib/api';
import type { SchoolClass, Student, Subject, AcademicTerm } from '@/types';

export default function GradesReportsPage() {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicTerms, setAcademicTerms] = useState<AcademicTerm[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [gradesData, setGradesData] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudentsByClass();
    }
  }, [selectedClass]);

  const loadInitialData = async () => {
    try {
      const [classesRes, subjectsRes, termsRes] = await Promise.all([
        schoolClassApi.getAll(),
        subjectApi.getAll(),
        academicTermApi.getAll()
      ]);
      
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
      setAcademicTerms(termsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados iniciais');
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

  const generateClassBulletin = async () => {
    if (!selectedClass || !selectedTerm) {
      toast.error('Selecione uma turma e um período letivo');
      return;
    }

    setLoading(true);
    try {
      // Simular dados de notas da turma
      const classSubjects = subjects.slice(0, 5); // Pegar 5 matérias principais
      
      const mockData = students.map(student => {
        const studentGrades = classSubjects.map(subject => ({
          subject: subject.name,
          grades: [
            { type: 'Prova 1', value: Math.floor(Math.random() * 3) + 7.5 },
            { type: 'Trabalho', value: Math.floor(Math.random() * 2) + 8 },
            { type: 'Participação', value: Math.floor(Math.random() * 2) + 8.5 }
          ],
          average: 0
        }));

        // Calcular médias
        studentGrades.forEach(sg => {
          sg.average = sg.grades.reduce((sum, g) => sum + g.value, 0) / sg.grades.length;
        });

        const generalAverage = studentGrades.reduce((sum, sg) => sum + sg.average, 0) / studentGrades.length;

        return {
          id: student.id,
          name: student.name,
          subjects: studentGrades,
          generalAverage,
          status: generalAverage >= 7 ? 'approved' : generalAverage >= 5 ? 'recovery' : 'failed'
        };
      });

      setGradesData(mockData);
      toast.success('Boletim da turma gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar boletim:', error);
      toast.error('Erro ao gerar boletim');
    } finally {
      setLoading(false);
    }
  };

  const generateStudentBulletin = async () => {
    if (!selectedStudent || !selectedTerm) {
      toast.error('Selecione um aluno e um período letivo');
      return;
    }

    setLoading(true);
    try {
      const student = students.find(s => s.id === parseInt(selectedStudent));
      if (!student) return;

      const classSubjects = subjects.slice(0, 6);
      
      const studentGrades = classSubjects.map(subject => ({
        subject: subject.name,
        grades: [
          { type: 'Avaliação 1', value: Math.floor(Math.random() * 3) + 7.5, weight: 3 },
          { type: 'Avaliação 2', value: Math.floor(Math.random() * 2) + 8, weight: 3 },
          { type: 'Trabalhos', value: Math.floor(Math.random() * 2) + 8.5, weight: 2 },
          { type: 'Participação', value: Math.floor(Math.random() * 1) + 9, weight: 2 }
        ],
        average: 0,
        attendance: Math.floor(Math.random() * 10) + 85 // 85-95%
      }));

      // Calcular médias ponderadas
      studentGrades.forEach(sg => {
        const totalWeight = sg.grades.reduce((sum, g) => sum + g.weight, 0);
        const weightedSum = sg.grades.reduce((sum, g) => sum + (g.value * g.weight), 0);
        sg.average = weightedSum / totalWeight;
      });

      const generalAverage = studentGrades.reduce((sum, sg) => sum + sg.average, 0) / studentGrades.length;

      const mockData = [{
        id: student.id,
        name: student.name,
        class: classes.find(c => c.id === parseInt(selectedClass))?.name || '',
        term: academicTerms.find(t => t.id === parseInt(selectedTerm))?.name || '',
        subjects: studentGrades,
        generalAverage,
        totalAttendance: Math.floor(Math.random() * 5) + 90, // 90-95%
        status: generalAverage >= 7 ? 'approved' : generalAverage >= 5 ? 'recovery' : 'failed',
        observations: 'Aluno demonstra boa participação nas atividades propostas.'
      }];

      setGradesData(mockData);
      toast.success('Boletim individual gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar boletim:', error);
      toast.error('Erro ao gerar boletim');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Aprovado</Badge>;
      case 'recovery':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Recuperação</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Reprovado</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  const exportToPDF = () => {
    toast.success('Exportando boletim para PDF...');
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
              <BookOpen className="w-8 h-8" />
              Boletins de Notas
            </h1>
            <p style={{ color: 'var(--muted-foreground)' }} className="text-lg">
              Boletins com notas das matérias por turma e por aluno
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                Período Letivo
              </label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {academicTerms.map(term => (
                    <SelectItem key={term.id} value={term.id.toString()}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={generateClassBulletin} 
                disabled={loading || !selectedClass || !selectedTerm}
                className="w-full"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {loading ? 'Gerando...' : 'Gerar Boletim'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para diferentes tipos de boletim */}
      <Tabs defaultValue="class" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="class" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Por Turma
          </TabsTrigger>
          <TabsTrigger value="student" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Individual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="class">
          {gradesData.length > 0 && (
            <Card style={{ 
              background: 'var(--card)',
              border: '1px solid var(--border)'
            }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle style={{ color: 'var(--foreground)' }}>
                  Boletim da Turma - {classes.find(c => c.id === parseInt(selectedClass))?.name}
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
                        <th className="text-left py-3 font-medium" style={{ color: 'var(--foreground)' }}>Aluno</th>
                        {subjects.slice(0, 5).map(subject => (
                          <th key={subject.id} className="text-center py-3 font-medium" style={{ color: 'var(--foreground)' }}>
                            {subject.name}
                          </th>
                        ))}
                        <th className="text-center py-3 font-medium" style={{ color: 'var(--foreground)' }}>Média Geral</th>
                        <th className="text-center py-3 font-medium" style={{ color: 'var(--foreground)' }}>Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradesData.map((student) => (
                        <tr key={student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="py-3 font-medium" style={{ color: 'var(--foreground)' }}>
                            {student.name}
                          </td>
                          {student.subjects.map((subject: any, index: number) => (
                            <td key={index} className="py-3 text-center">
                              <span className={`font-medium ${
                                subject.average >= 7 ? 'text-green-600 dark:text-green-400' :
                                subject.average >= 5 ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                              }`}>
                                {subject.average.toFixed(1)}
                              </span>
                            </td>
                          ))}
                          <td className="py-3 text-center">
                            <span className={`font-bold text-lg ${
                              student.generalAverage >= 7 ? 'text-green-600 dark:text-green-400' :
                              student.generalAverage >= 5 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {student.generalAverage.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            {getStatusBadge(student.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {gradesData.filter(s => s.status === 'approved').length}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      Aprovados
                    </div>
                  </Card>
                  
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {gradesData.filter(s => s.status === 'recovery').length}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      Recuperação
                    </div>
                  </Card>
                  
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {gradesData.filter(s => s.status === 'failed').length}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      Reprovados
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
                Boletim Individual
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
                  onClick={generateStudentBulletin} 
                  disabled={loading || !selectedStudent || !selectedTerm}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {loading ? 'Gerando...' : 'Gerar Boletim Individual'}
                </Button>
              </div>

              {gradesData.length > 0 && gradesData[0].subjects && (
                <div className="mt-6">
                  {/* Header do boletim */}
                  <div className="text-center mb-6 p-4 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>BOLETIM ESCOLAR</h2>
                    <div className="mt-2">
                      <p style={{ color: 'var(--muted-foreground)' }}>
                        <strong>Aluno:</strong> {gradesData[0].name} | 
                        <strong> Turma:</strong> {gradesData[0].class} | 
                        <strong> Período:</strong> {gradesData[0].term}
                      </p>
                    </div>
                  </div>

                  {/* Notas por matéria */}
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                          <th className="text-left py-3 font-bold" style={{ color: 'var(--foreground)' }}>Disciplina</th>
                          <th className="text-center py-3 font-bold" style={{ color: 'var(--foreground)' }}>Av. 1</th>
                          <th className="text-center py-3 font-bold" style={{ color: 'var(--foreground)' }}>Av. 2</th>
                          <th className="text-center py-3 font-bold" style={{ color: 'var(--foreground)' }}>Trabalhos</th>
                          <th className="text-center py-3 font-bold" style={{ color: 'var(--foreground)' }}>Particip.</th>
                          <th className="text-center py-3 font-bold" style={{ color: 'var(--foreground)' }}>Média</th>
                          <th className="text-center py-3 font-bold" style={{ color: 'var(--foreground)' }}>Frequência</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradesData[0].subjects.map((subject: any, index: number) => (
                          <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td className="py-3 font-medium" style={{ color: 'var(--foreground)' }}>
                              {subject.subject}
                            </td>
                            {subject.grades.map((grade: any, gradeIndex: number) => (
                              <td key={gradeIndex} className="py-3 text-center font-medium">
                                <span className={
                                  grade.value >= 7 ? 'text-green-600 dark:text-green-400' :
                                  grade.value >= 5 ? 'text-yellow-600 dark:text-yellow-400' :
                                  'text-red-600 dark:text-red-400'
                                }>
                                  {grade.value.toFixed(1)}
                                </span>
                              </td>
                            ))}
                            <td className="py-3 text-center">
                              <span className={`font-bold ${
                                subject.average >= 7 ? 'text-green-600 dark:text-green-400' :
                                subject.average >= 5 ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                              }`}>
                                {subject.average.toFixed(1)}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <Badge variant={subject.attendance >= 75 ? "default" : "destructive"}>
                                {subject.attendance}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Resumo final */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Award className="w-6 h-6 mr-2" style={{ color: 'var(--primary)' }} />
                      </div>
                      <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                        {gradesData[0].generalAverage.toFixed(1)}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Média Geral
                      </div>
                    </Card>
                    
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {gradesData[0].totalAttendance}%
                      </div>
                      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Frequência Total
                      </div>
                    </Card>
                    
                    <Card className="p-4 text-center">
                      <div className="text-lg font-bold mb-2">
                        {getStatusBadge(gradesData[0].status)}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Situação Final
                      </div>
                    </Card>
                  </div>

                  {gradesData[0].observations && (
                    <Card className="mt-6 p-4">
                      <h3 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Observações:</h3>
                      <p style={{ color: 'var(--muted-foreground)' }}>
                        {gradesData[0].observations}
                      </p>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}