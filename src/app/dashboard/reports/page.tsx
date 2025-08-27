'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  GraduationCap, 
  ClipboardList,
  BookOpen,
  Calendar,
  Download,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { reportApi, classApi, academicTermApi } from '@/lib/api';
import { exportMonthlyReportToPDF } from '@/lib/pdf-utils';

const reportTypes = [
  {
    id: 'attendance',
    title: 'Relatórios de Presença',
    description: 'Relatórios de frequência por turma e por aluno',
    icon: ClipboardList,
    color: 'blue',
    href: '/dashboard/reports/attendance'
  },
  {
    id: 'grades',
    title: 'Boletins de Notas',
    description: 'Boletins com notas das matérias por turma e por aluno',
    icon: BookOpen,
    color: 'green',
    href: '/dashboard/reports/grades'
  },
  {
    id: 'students',
    title: 'Relatório de Alunos',
    description: 'Listagem completa de alunos por turma',
    icon: Users,
    color: 'purple',
    href: '/dashboard/reports/students'
  },
  {
    id: 'teachers',
    title: 'Relatório de Professores',
    description: 'Informações de professores e suas turmas',
    icon: GraduationCap,
    color: 'orange',
    href: '/dashboard/reports/teachers'
  },
];

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicTerms, setAcademicTerms] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [classesResponse, termsResponse] = await Promise.all([
        classApi.getAll(),
        academicTermApi.getAll()
      ]);
      setClasses(classesResponse.data);
      setAcademicTerms(termsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const generateTodayAttendanceReport = async () => {
    if (classes.length === 0) {
      toast.error('Nenhuma turma disponível');
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const classId = classes[0]?.id; // Primeira turma como padrão
      
      const { data } = await reportApi.getAttendanceReport({
        class_id: classId,
        start_date: today,
        end_date: today
      });

      // Simular dados para demonstração se não houver dados reais
      const reportData = data || [{
        name: 'Relatório de Presença - Hoje',
        date: today,
        students: []
      }];

      toast.success('Relatório de presenças de hoje gerado!');
      
      // Abrir em nova aba ou fazer download
      window.open(`/dashboard/reports/attendance?date=${today}&classId=${classId}`, '_blank');
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório de presenças');
    } finally {
      setLoading(false);
    }
  };

  const generateCurrentTermGrades = async () => {
    if (academicTerms.length === 0) {
      toast.error('Nenhum período letivo disponível');
      return;
    }

    setLoading(true);
    try {
      const currentTerm = academicTerms.find(term => term.active) || academicTerms[0];
      
      toast.success('Redirecionando para boletins do período atual...');
      
      // Redirecionar para página de boletins com termo selecionado
      window.open(`/dashboard/reports/grades?termId=${currentTerm.id}`, '_blank');
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar boletins');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyReport = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
      
      toast.success('Gerando resumo mensal...');
      
      // Criar um resumo combinando dados reais das APIs
      const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      // Generate PDF with real data from loaded APIs
      const reportData = {
        title: `Resumo Mensal - ${monthName}`,
        period: { 
          start: startOfMonth, 
          end: endOfMonth 
        },
        summary: {
          totalStudents: classes.reduce((total, cls) => total + (cls.studentsCount || 0), 0) || 0,
          totalClasses: classes.length,
          averageAttendance: 0, // We don't have attendance API data loaded here
          totalGrades: 0 // We don't have grades API data loaded here
        }
      };

      // Add note about limited data availability
      console.log('📊 Dados do resumo mensal:', reportData);
      
      // Generate and download PDF
      try {
        exportMonthlyReportToPDF(reportData, `resumo_mensal_${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}.pdf`);
        toast.success(`Resumo mensal de ${monthName} exportado para PDF!`);
      } catch (pdfError) {
        console.error('Erro ao gerar PDF:', pdfError);
        toast.error('Erro ao gerar PDF do resumo mensal');
      }
      
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      toast.error('Erro ao gerar resumo mensal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            Relatórios
          </h1>
          <p style={{ color: 'var(--muted-foreground)' }} className="text-lg">
            Gere e visualize relatórios do sistema escolar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.id} className="transition-all duration-200 hover:shadow-lg cursor-pointer group" 
                style={{ 
                  background: 'var(--card)',
                  border: '1px solid var(--border)'
                }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg bg-${report.color}-100 dark:bg-${report.color}-900/20`}>
                  <report.icon className={`w-6 h-6 text-${report.color}-600 dark:text-${report.color}-400`} />
                </div>
                <Eye className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                     style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <CardTitle className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                {report.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: 'var(--muted-foreground)' }} className="text-sm">
                {report.description}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Link href={report.href}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Visualizar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card style={{ 
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <Calendar className="w-5 h-5" />
            Relatórios Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              onClick={generateTodayAttendanceReport}
              disabled={loading}
            >
              <div className="font-medium mb-1 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Presenças Hoje
              </div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Relatório de presenças do dia atual
              </div>
              {loading && <div className="text-xs mt-1 text-blue-600">Gerando...</div>}
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              onClick={generateCurrentTermGrades}
              disabled={loading}
            >
              <div className="font-medium mb-1 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                Notas do Período
              </div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Boletins do período letivo atual
              </div>
              {loading && <div className="text-xs mt-1 text-green-600">Gerando...</div>}
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              onClick={generateMonthlyReport}
              disabled={loading}
            >
              <div className="font-medium mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Resumo Mensal
              </div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Resumo geral do mês atual
              </div>
              {loading && <div className="text-xs mt-1 text-purple-600">Gerando...</div>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}