import jsPDF from 'jspdf';

export interface StudentGrade {
  id: number;
  student: {
    id: number;
    name: string;
    registrationNumber: string;
  };
  diary: {
    subject: {
      name: string;
    };
  } | null;
  value: number;
  gradeType: string;
  date: string;
}

export interface AttendanceRecord {
  id: number;
  name: string;
  totalClasses: number;
  present: number;
  absent: number;
  late?: number;
  percentage: number;
}

export class PDFGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  // Configurações padrão
  private setupHeader(title: string) {
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ESCOLA INFANTIL', 105, 20, { align: 'center' });
    
    this.doc.setFontSize(16);
    this.doc.text(title, 105, 30, { align: 'center' });
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 40, { align: 'center' });
    
    // Linha separadora
    this.doc.line(20, 45, 190, 45);
  }

  private setupFooter() {
    const pageHeight = this.doc.internal.pageSize.height;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text('Sistema de Gestão Escolar', 105, pageHeight - 10, { align: 'center' });
  }

  // Gerar PDF de boletim de notas
  generateGradesReport(data: {
    academicTerm: { name: string; year: number };
    schoolClass?: { name: string };
    grades: StudentGrade[];
  }): void {
    const title = data.schoolClass 
      ? `BOLETIM DE NOTAS - ${data.schoolClass.name}` 
      : 'BOLETIM DE NOTAS GERAL';

    this.setupHeader(title);

    let yPos = 55;
    
    // Informações do período
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PERÍODO LETIVO:', 20, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${data.academicTerm.name} - ${data.academicTerm.year}`, 70, yPos);
    
    if (data.schoolClass) {
      yPos += 10;
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('TURMA:', 20, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(data.schoolClass.name, 50, yPos);
    }

    yPos += 20;

    // Agrupar notas por aluno
    const gradesByStudent = data.grades.reduce((acc, grade) => {
      const studentKey = grade.student.id;
      if (!acc[studentKey]) {
        acc[studentKey] = {
          student: grade.student,
          grades: []
        };
      }
      acc[studentKey].grades.push(grade);
      return acc;
    }, {} as Record<number, { student: any; grades: StudentGrade[] }>);

    // Cabeçalho da tabela
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ALUNO', 20, yPos);
    this.doc.text('MATRÍCULA', 80, yPos);
    this.doc.text('DISCIPLINA', 120, yPos);
    this.doc.text('NOTA', 160, yPos);
    this.doc.text('TIPO', 180, yPos);

    // Linha do cabeçalho
    this.doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 10;

    // Dados dos alunos
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);

    Object.values(gradesByStudent).forEach((studentData) => {
      const student = studentData.student;
      let isFirstGrade = true;

      studentData.grades.forEach((grade) => {
        // Verificar se precisa de nova página
        if (yPos > 270) {
          this.doc.addPage();
          yPos = 20;
          this.setupHeader(title);
          yPos = 55;
        }

        if (isFirstGrade) {
          this.doc.text(student.name, 20, yPos);
          this.doc.text(student.registrationNumber || '', 80, yPos);
          isFirstGrade = false;
        }

        this.doc.text(grade.diary?.subject.name || 'N/A', 120, yPos);
        this.doc.text(grade.value.toString(), 160, yPos);
        this.doc.text(grade.gradeType, 180, yPos);

        yPos += 7;
      });

      // Linha separadora entre alunos
      this.doc.line(20, yPos, 190, yPos);
      yPos += 5;
    });

    this.setupFooter();
  }

  // Gerar PDF de relatório de presença
  generateAttendanceReport(data: {
    schoolClass?: { name: string };
    period: { startDate: string; endDate: string };
    students: AttendanceRecord[];
  }): void {
    const title = data.schoolClass 
      ? `RELATÓRIO DE PRESENÇAS - ${data.schoolClass.name}` 
      : 'RELATÓRIO DE PRESENÇAS GERAL';

    this.setupHeader(title);

    let yPos = 55;
    
    // Informações do período
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PERÍODO:', 20, yPos);
    this.doc.setFont('helvetica', 'normal');
    const startDate = new Date(data.period.startDate).toLocaleDateString('pt-BR');
    const endDate = new Date(data.period.endDate).toLocaleDateString('pt-BR');
    this.doc.text(`${startDate} a ${endDate}`, 60, yPos);

    if (data.schoolClass) {
      yPos += 10;
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('TURMA:', 20, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(data.schoolClass.name, 50, yPos);
    }

    yPos += 20;

    // Cabeçalho da tabela
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ALUNO', 20, yPos);
    this.doc.text('TOTAL', 80, yPos);
    this.doc.text('PRESENÇAS', 110, yPos);
    this.doc.text('FALTAS', 140, yPos);
    this.doc.text('ATRASOS', 165, yPos);
    this.doc.text('FREQ. %', 185, yPos);

    // Linha do cabeçalho
    this.doc.line(20, yPos + 2, 200, yPos + 2);
    yPos += 10;

    // Dados dos alunos
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);

    data.students.forEach((student) => {
      // Verificar se precisa de nova página
      if (yPos > 270) {
        this.doc.addPage();
        yPos = 20;
        this.setupHeader(title);
        yPos = 55;
      }

      this.doc.text(student.name, 20, yPos);
      this.doc.text(student.totalClasses.toString(), 85, yPos);
      this.doc.text(student.present.toString(), 120, yPos);
      this.doc.text(student.absent.toString(), 150, yPos);
      this.doc.text((student.late || 0).toString(), 175, yPos);
      
      // Cor baseada na frequência
      const percentage = student.percentage;
      if (percentage >= 75) {
        this.doc.setTextColor(0, 128, 0); // Verde
      } else if (percentage >= 60) {
        this.doc.setTextColor(255, 165, 0); // Laranja
      } else {
        this.doc.setTextColor(255, 0, 0); // Vermelho
      }
      this.doc.text(`${percentage}%`, 190, yPos);
      this.doc.setTextColor(0, 0, 0); // Voltar ao preto

      yPos += 8;
    });

    // Resumo estatístico
    yPos += 10;
    this.doc.line(20, yPos, 200, yPos);
    yPos += 10;

    const totalStudents = data.students.length;
    const totalPresences = data.students.reduce((sum, s) => sum + s.present, 0);
    const totalAbsences = data.students.reduce((sum, s) => sum + s.absent, 0);
    const averageAttendance = totalStudents > 0 
      ? Math.round(data.students.reduce((sum, s) => sum + s.percentage, 0) / totalStudents)
      : 0;

    this.doc.setFont('helvetica', 'bold');
    this.doc.text('RESUMO GERAL:', 20, yPos);
    yPos += 10;

    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Total de alunos: ${totalStudents}`, 20, yPos);
    yPos += 7;
    this.doc.text(`Total de presenças: ${totalPresences}`, 20, yPos);
    yPos += 7;
    this.doc.text(`Total de faltas: ${totalAbsences}`, 20, yPos);
    yPos += 7;
    this.doc.text(`Frequência média da turma: ${averageAttendance}%`, 20, yPos);

    this.setupFooter();
  }

  // Gerar PDF de resumo mensal
  generateMonthlyReport(data: {
    title: string;
    period: { start: string; end: string };
    summary: {
      totalStudents: number;
      totalClasses: number;
      averageAttendance: number;
      totalGrades: number;
    };
  }): void {
    this.setupHeader(data.title);

    let yPos = 55;
    
    // Informações do período
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PERÍODO:', 20, yPos);
    this.doc.setFont('helvetica', 'normal');
    const startDate = new Date(data.period.start).toLocaleDateString('pt-BR');
    const endDate = new Date(data.period.end).toLocaleDateString('pt-BR');
    this.doc.text(`${startDate} a ${endDate}`, 60, yPos);

    yPos += 30;

    // Estatísticas gerais
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ESTATÍSTICAS GERAIS', 20, yPos);
    yPos += 15;

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');

    // Caixas com estatísticas
    const stats = [
      { label: 'Total de Alunos', value: data.summary.totalStudents, color: [52, 152, 219] },
      { label: 'Total de Turmas', value: data.summary.totalClasses, color: [155, 89, 182] },
      { label: 'Frequência Média', value: `${data.summary.averageAttendance}%`, color: [46, 204, 113] },
      { label: 'Notas Lançadas', value: data.summary.totalGrades, color: [231, 76, 60] }
    ];

    let xPos = 20;
    stats.forEach((stat, index) => {
      // Caixa colorida
      this.doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
      this.doc.rect(xPos, yPos, 40, 25, 'F');
      
      // Texto branco sobre a caixa
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(stat.value.toString(), xPos + 20, yPos + 12, { align: 'center' });
      
      // Label abaixo da caixa
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(9);
      this.doc.text(stat.label, xPos + 20, yPos + 35, { align: 'center' });
      
      xPos += 45;
      if ((index + 1) % 4 === 0) {
        xPos = 20;
        yPos += 50;
      }
    });

    yPos += 60;

    // Seção de observações
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('OBSERVAÇÕES', 20, yPos);
    yPos += 10;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const observations = [
      '• Relatório gerado automaticamente pelo sistema',
      '• Dados compilados de todas as turmas ativas',
      '• Frequência calculada com base nas presenças registradas',
      '• Para relatórios detalhados, consulte os relatórios específicos por turma'
    ];

    observations.forEach(obs => {
      this.doc.text(obs, 20, yPos);
      yPos += 8;
    });

    this.setupFooter();
  }

  // Salvar o PDF
  save(filename: string): void {
    this.doc.save(filename);
  }

  // Abrir o PDF em nova janela
  output(): string {
    return this.doc.output('dataurlnewwindow');
  }
}

// Funções auxiliares para exportar PDFs
export const exportGradesToPDF = (data: any, filename?: string) => {
  const generator = new PDFGenerator();
  generator.generateGradesReport(data);
  generator.save(filename || `boletim_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const exportAttendanceToPDF = (data: any, filename?: string) => {
  const generator = new PDFGenerator();
  generator.generateAttendanceReport(data);
  generator.save(filename || `presencas_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const exportMonthlyReportToPDF = (data: any, filename?: string) => {
  const generator = new PDFGenerator();
  generator.generateMonthlyReport(data);
  generator.save(filename || `resumo_mensal_${new Date().toISOString().slice(0, 10)}.pdf`);
};