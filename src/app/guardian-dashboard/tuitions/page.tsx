'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  Eye,
  Search,
  Filter,
  TrendingUp,
  Users,
  FileText,
  Printer,
  Mail,
  Copy,
  QrCode
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/error-boundary';

interface Tuition {
  id: number;
  studentId: number;
  studentName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: 'pix' | 'card' | 'transfer' | 'cash';
  discount: number;
  lateFee: number;
  finalAmount: number;
  description: string;
  referenceMonth: string;
  barcode?: string;
  pixKey?: string;
  coraInvoice?: {
    id: number;
    invoice_id: string;
    status: string;
    boleto_url?: string;
    pix_qr_code?: string;
    pix_qr_code_url?: string;
    paid_at?: string;
  };
}

interface Student {
  id: number;
  name: string;
  class: string;
  registrationNumber: string;
}

export default function GuardianTuitionsPage() {
  const [loading, setLoading] = useState(true);
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Dados simulados - no backend, buscar mensalidades dos filhos do responsável
      const mockStudents: Student[] = [
        {
          id: 1,
          name: 'Ana Silva',
          class: '5º Ano A',
          registrationNumber: '2024001'
        },
        {
          id: 2,
          name: 'Pedro Silva',
          class: '3º Ano B',
          registrationNumber: '2024002'
        }
      ];

      const mockTuitions: Tuition[] = [
        // Ana Silva - Mensalidades
        {
          id: 1,
          studentId: 1,
          studentName: 'Ana Silva',
          amount: 650.00,
          dueDate: '2024-02-10',
          status: 'pending',
          discount: 0,
          lateFee: 0,
          finalAmount: 650.00,
          description: 'Mensalidade Fevereiro/2024',
          referenceMonth: '2024-02',
          barcode: '23793381286543210000065000',
          pixKey: 'escola@pix.com.br',
          coraInvoice: {
            id: 1,
            invoice_id: 'CORA-INV-2024-001',
            status: 'OPEN',
            boleto_url: 'https://exemplo.com/boleto/cora-inv-2024-001.pdf',
            pix_qr_code: '00020126580014br.gov.bcb.pix01147894561230123456789000065000',
            pix_qr_code_url: 'https://exemplo.com/qr-code/cora-inv-2024-001.png'
          }
        },
        {
          id: 2,
          studentId: 1,
          studentName: 'Ana Silva',
          amount: 650.00,
          dueDate: '2024-01-10',
          paidDate: '2024-01-08',
          status: 'paid',
          paymentMethod: 'pix',
          discount: 0,
          lateFee: 0,
          finalAmount: 650.00,
          description: 'Mensalidade Janeiro/2024',
          referenceMonth: '2024-01',
          coraInvoice: {
            id: 2,
            invoice_id: 'CORA-INV-2024-002',
            status: 'PAID',
            boleto_url: 'https://exemplo.com/boleto/cora-inv-2024-002.pdf',
            paid_at: '2024-01-08T10:30:00Z'
          }
        },
        {
          id: 3,
          studentId: 1,
          studentName: 'Ana Silva',
          amount: 650.00,
          dueDate: '2023-12-10',
          paidDate: '2023-12-12',
          status: 'paid',
          paymentMethod: 'card',
          discount: 0,
          lateFee: 13.00,
          finalAmount: 663.00,
          description: 'Mensalidade Dezembro/2023',
          referenceMonth: '2023-12'
        },
        
        // Pedro Silva - Mensalidades
        {
          id: 4,
          studentId: 2,
          studentName: 'Pedro Silva',
          amount: 550.00,
          dueDate: '2024-02-10',
          status: 'pending',
          discount: 0,
          lateFee: 0,
          finalAmount: 550.00,
          description: 'Mensalidade Fevereiro/2024',
          referenceMonth: '2024-02',
          barcode: '23793381286543210000055000',
          pixKey: 'escola@pix.com.br'
        },
        {
          id: 5,
          studentId: 2,
          studentName: 'Pedro Silva',
          amount: 550.00,
          dueDate: '2024-01-10',
          paidDate: '2024-01-05',
          status: 'paid',
          paymentMethod: 'pix',
          discount: 27.50, // Desconto por antecipação
          lateFee: 0,
          finalAmount: 522.50,
          description: 'Mensalidade Janeiro/2024',
          referenceMonth: '2024-01'
        },
        {
          id: 6,
          studentId: 2,
          studentName: 'Pedro Silva',
          amount: 550.00,
          dueDate: '2024-01-05',
          status: 'overdue',
          discount: 0,
          lateFee: 55.00,
          finalAmount: 605.00,
          description: 'Taxa de Matrícula 2024',
          referenceMonth: '2024-01'
        }
      ];
      
      setStudents(mockStudents);
      setTuitions(mockTuitions);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      paid: CheckCircle,
      overdue: AlertCircle,
      cancelled: XCircle
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Em Atraso',
      cancelled: 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPaymentMethodLabel = (method?: string) => {
    const labels = {
      pix: 'PIX',
      card: 'Cartão',
      transfer: 'Transferência',
      cash: 'Dinheiro'
    };
    return method ? labels[method as keyof typeof labels] || method : '';
  };

  const filteredTuitions = tuitions.filter(tuition => {
    const matchesSearch = tuition.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tuition.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tuition.referenceMonth.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || tuition.status === filterStatus;
    const matchesStudent = selectedStudent === 'all' || tuition.studentId.toString() === selectedStudent;
    
    return matchesSearch && matchesStatus && matchesStudent;
  });

  const currentTuitions = filteredTuitions.filter(t => t.status === 'pending' || t.status === 'overdue');
  const paidTuitions = filteredTuitions.filter(t => t.status === 'paid');

  const getFinancialSummary = () => {
    const pending = tuitions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.finalAmount, 0);
    const overdue = tuitions.filter(t => t.status === 'overdue').reduce((sum, t) => sum + t.finalAmount, 0);
    const paidThisMonth = tuitions.filter(t => {
      if (t.status !== 'paid' || !t.paidDate) return false;
      const paidDate = new Date(t.paidDate);
      const now = new Date();
      return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
    }).reduce((sum, t) => sum + t.finalAmount, 0);
    
    return { pending, overdue, paidThisMonth, total: pending + overdue };
  };

  const summary = getFinancialSummary();

  // Cora API Integration Functions
  const handleGenerateBoleto = async (tuitionId: number) => {
    try {
      // Simulated API call to generate boleto via Cora
      // const response = await fetch(`/api/v1/tuitions/${tuitionId}/generate_boleto`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      toast.success('Boleto e PIX gerados com sucesso!');
      loadData(); // Reload to get updated data
    } catch (error) {
      console.error('Erro ao gerar boleto:', error);
      toast.error('Erro ao gerar boleto e PIX');
    }
  };

  const handleDownloadBoleto = (tuition: Tuition) => {
    if (tuition.coraInvoice?.boleto_url) {
      window.open(tuition.coraInvoice.boleto_url, '_blank');
      toast.success('Abrindo boleto...');
    } else if (tuition.barcode) {
      // Generate boleto PDF from barcode
      toast.success('Gerando boleto...');
    } else {
      toast.error('Boleto não disponível');
    }
  };

  const handleCopyPix = (tuition: Tuition) => {
    const pixCode = tuition.coraInvoice?.pix_qr_code || tuition.pixKey;
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      toast.success('Código PIX copiado para a área de transferência!');
    } else {
      toast.error('Código PIX não disponível');
    }
  };

  const handleViewPixQR = (tuition: Tuition) => {
    if (tuition.coraInvoice?.pix_qr_code_url) {
      window.open(tuition.coraInvoice.pix_qr_code_url, '_blank');
    } else {
      toast.error('QR Code PIX não disponível');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mensalidades</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os pagamentos dos seus filhos
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Extrato
          </Button>
          <Button className="bg-slate-700 hover:bg-slate-800 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Ver Boletos
          </Button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pendente</p>
                <p className="text-3xl font-bold text-yellow-600">
                  R$ {summary.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {currentTuitions.length} mensalidade{currentTuitions.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Atraso</p>
                <p className="text-3xl font-bold text-red-600">
                  R$ {summary.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {tuitions.filter(t => t.status === 'overdue').length} pendência{tuitions.filter(t => t.status === 'overdue').length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pago Este Mês</p>
                <p className="text-3xl font-bold text-green-600">
                  R$ {summary.paidThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 mt-1">Pagamentos realizados</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Filhos</p>
                <p className="text-3xl font-bold text-slate-700">{students.length}</p>
                <p className="text-xs text-gray-500 mt-1">Matriculados</p>
              </div>
              <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-slate-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar mensalidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="all">Todos os filhos</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="overdue">Em Atraso</option>
              <option value="cancelled">Cancelado</option>
            </select>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendentes ({currentTuitions.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Histórico ({paidTuitions.length})
          </TabsTrigger>
        </TabsList>

        {/* Current Tuitions */}
        <TabsContent value="current" className="space-y-4">
          {currentTuitions.map((tuition) => {
            const StatusIcon = getStatusIcon(tuition.status);
            const isOverdue = tuition.status === 'overdue';
            
            return (
              <Card key={tuition.id} className={`border-0 shadow-sm hover:shadow-md transition-shadow ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-slate-600 to-emerald-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {tuition.studentName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{tuition.studentName}</h3>
                        <p className="text-gray-600">{tuition.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Vencimento: {new Date(tuition.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                          {isOverdue && (
                            <span className="text-red-600 font-medium">
                              {Math.ceil((new Date().getTime() - new Date(tuition.dueDate).getTime()) / (1000 * 60 * 60 * 24))} dias em atraso
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(tuition.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {getStatusLabel(tuition.status)}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        R$ {tuition.finalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {tuition.lateFee > 0 && (
                        <p className="text-sm text-red-600">
                          + R$ {tuition.lateFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (multa)
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                      onClick={() => handleGenerateBoleto(tuition.id)}
                    >
                      <CreditCard className="h-4 w-4" />
                      Gerar Boleto/PIX
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => handleDownloadBoleto(tuition)}
                      disabled={!tuition.barcode}
                    >
                      <Download className="h-4 w-4" />
                      Baixar Boleto
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => handleCopyPix(tuition)}
                      disabled={!tuition.pixKey && !tuition.coraInvoice?.pix_qr_code}
                    >
                      <Copy className="h-4 w-4" />
                      Copiar PIX
                    </Button>
                  </div>
                  
                  {/* PIX QR Code Button */}
                  {tuition.coraInvoice?.pix_qr_code_url && (
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => handleViewPixQR(tuition)}
                      >
                        <QrCode className="h-4 w-4" />
                        Ver QR Code PIX
                      </Button>
                    </div>
                  )}
                  
                  {tuition.pixKey && (
                    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <h4 className="text-sm font-medium text-emerald-900 mb-2">Pagamento via PIX</h4>
                      <p className="text-sm text-emerald-800">
                        Chave PIX: <code className="bg-emerald-100 px-2 py-1 rounded text-xs">{tuition.pixKey}</code>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          {currentTuitions.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Parabéns!</h3>
                <p className="text-gray-600">Não há mensalidades pendentes no momento.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payment History */}
        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {paidTuitions.map((tuition) => (
              <Card key={tuition.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-600 to-emerald-600 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{tuition.studentName}</h3>
                        <p className="text-gray-600">{tuition.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>Pago em: {tuition.paidDate ? new Date(tuition.paidDate).toLocaleDateString('pt-BR') : ''}</span>
                          {tuition.paymentMethod && (
                            <span>via {getPaymentMethodLabel(tuition.paymentMethod)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        R$ {tuition.finalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {tuition.discount > 0 && (
                        <p className="text-sm text-green-600">
                          Desconto: R$ {tuition.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                      {tuition.lateFee > 0 && (
                        <p className="text-sm text-red-600">
                          Multa: R$ {tuition.lateFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {paidTuitions.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum histórico</h3>
                <p className="text-gray-600">Ainda não há pagamentos realizados.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </ErrorBoundary>
  );
}