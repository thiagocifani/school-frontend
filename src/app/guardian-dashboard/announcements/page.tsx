'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Bell,
  Search,
  Calendar,
  User,
  AlertCircle,
  Info,
  CheckCircle,
  FileText,
  Pin,
  Clock
} from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'academic' | 'financial' | 'event';
  author: string;
  date: string;
  isPinned: boolean;
  isRead: boolean;
  targetAudience: string[];
  attachments?: string[];
}

export default function GuardianAnnouncementsPage() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      
      // Dados simulados - no backend, buscar comunicados relevantes
      const mockAnnouncements: Announcement[] = [
        {
          id: 1,
          title: 'Reunião de Pais - 1º Bimestre',
          content: 'Convidamos todos os responsáveis para a reunião de pais que acontecerá no dia 30/01/2024, às 19h, no auditório da escola. Será apresentado o desempenho dos alunos no primeiro bimestre e discutidos os próximos passos do ano letivo.',
          type: 'urgent',
          author: 'Direção Pedagógica',
          date: '2024-01-22',
          isPinned: true,
          isRead: false,
          targetAudience: ['Todos os responsáveis'],
          attachments: ['cronograma_reuniao.pdf']
        },
        {
          id: 2,
          title: 'Novo Sistema de Comunicação',
          content: 'A partir desta semana, estamos implementando um novo portal para responsáveis onde vocês poderão acompanhar em tempo real o desempenho dos seus filhos, incluindo notas, frequência e ocorrências. O acesso será feito através do mesmo login desta plataforma.',
          type: 'general',
          author: 'Secretaria Escolar',
          date: '2024-01-20',
          isPinned: false,
          isRead: true,
          targetAudience: ['Todos os responsáveis']
        },
        {
          id: 3,
          title: 'Alteração no Horário das Aulas - 5º Ano A',
          content: 'Informamos que devido a uma manutenção emergencial na sala 5A, as aulas do 5º Ano A serão transferidas temporariamente para a sala 7B, nos dias 25 e 26 de janeiro. O horário permanece o mesmo.',
          type: 'academic',
          author: 'Coordenação 5º Ano',
          date: '2024-01-19',
          isPinned: false,
          isRead: false,
          targetAudience: ['Responsáveis do 5º Ano A']
        },
        {
          id: 4,
          title: 'Vencimento das Mensalidades - Janeiro',
          content: 'Lembramos que o vencimento das mensalidades de janeiro é dia 10. Para evitar juros e multas, favor efetuar o pagamento até a data de vencimento. O boleto pode ser reimpresso através do portal financeiro.',
          type: 'financial',
          author: 'Departamento Financeiro',
          date: '2024-01-05',
          isPinned: false,
          isRead: true,
          targetAudience: ['Todos os responsáveis']
        },
        {
          id: 5,
          title: 'Festa Junina 2024 - Save the Date',
          content: 'Já podem anotar na agenda! Nossa tradicional Festa Junina acontecerá no dia 15 de junho de 2024. Em breve divulgaremos mais informações sobre as apresentações e como os responsáveis podem participar da organização.',
          type: 'event',
          author: 'Comissão de Eventos',
          date: '2024-01-15',
          isPinned: false,
          isRead: false,
          targetAudience: ['Todos os responsáveis']
        }
      ];
      
      setAnnouncements(mockAnnouncements);
    } catch (error) {
      console.error('Erro ao carregar comunicados:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: number) => {
    setAnnouncements(prev => 
      prev.map(announcement => 
        announcement.id === id 
          ? { ...announcement, isRead: true }
          : announcement
      )
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      general: Info,
      urgent: AlertCircle,
      academic: FileText,
      financial: CheckCircle,
      event: Calendar
    };
    return icons[type as keyof typeof icons] || Bell;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800 border-blue-200',
      urgent: 'bg-red-100 text-red-800 border-red-200',
      academic: 'bg-purple-100 text-purple-800 border-purple-200',
      financial: 'bg-green-100 text-green-800 border-green-200',
      event: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      general: 'Geral',
      urgent: 'Urgente',
      academic: 'Acadêmico',
      financial: 'Financeiro',
      event: 'Evento'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || announcement.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.isPinned);
  const unreadCount = announcements.filter(a => !a.isRead).length;

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comunicados</h1>
          <p className="text-gray-600 mt-1">
            Fique por dentro das novidades da escola
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-purple-100 text-purple-800">
            {unreadCount} não lido{unreadCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar comunicados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos os tipos</option>
                <option value="urgent">Urgente</option>
                <option value="academic">Acadêmico</option>
                <option value="financial">Financeiro</option>
                <option value="event">Evento</option>
                <option value="general">Geral</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Pin className="h-5 w-5 text-purple-600" />
            Comunicados Fixados
          </h2>
          <div className="space-y-4">
            {pinnedAnnouncements.map((announcement) => {
              const Icon = getTypeIcon(announcement.type);
              return (
                <Card key={announcement.id} className={`border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow ${!announcement.isRead ? 'bg-purple-50' : 'bg-white'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(announcement.type)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {announcement.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(announcement.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pin className="h-4 w-4 text-purple-600" />
                        <Badge className={getTypeColor(announcement.type)}>
                          {getTypeLabel(announcement.type)}
                        </Badge>
                        {!announcement.isRead && (
                          <Badge className="bg-red-100 text-red-800">Não lido</Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{announcement.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-600">Direcionado a: </span>
                        <span className="font-medium">{announcement.targetAudience.join(', ')}</span>
                      </div>
                      
                      {!announcement.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(announcement.id)}
                        >
                          Marcar como lido
                        </Button>
                      )}
                    </div>
                    
                    {announcement.attachments && announcement.attachments.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Anexos:</p>
                        {announcement.attachments.map((attachment, index) => (
                          <Button key={index} variant="link" size="sm" className="p-0 h-auto text-purple-600">
                            <FileText className="h-4 w-4 mr-1" />
                            {attachment}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Regular Announcements */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Comunicados Recentes
        </h2>
        <div className="space-y-4">
          {regularAnnouncements.map((announcement) => {
            const Icon = getTypeIcon(announcement.type);
            return (
              <Card key={announcement.id} className={`border-0 shadow-sm hover:shadow-md transition-shadow ${!announcement.isRead ? 'bg-blue-50' : 'bg-white'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(announcement.type)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {announcement.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(announcement.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(announcement.type)}>
                        {getTypeLabel(announcement.type)}
                      </Badge>
                      {!announcement.isRead && (
                        <Badge className="bg-red-100 text-red-800">Não lido</Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{announcement.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-600">Direcionado a: </span>
                      <span className="font-medium">{announcement.targetAudience.join(', ')}</span>
                    </div>
                    
                    {!announcement.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(announcement.id)}
                      >
                        Marcar como lido
                      </Button>
                    )}
                  </div>
                  
                  {announcement.attachments && announcement.attachments.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Anexos:</p>
                      {announcement.attachments.map((attachment, index) => (
                        <Button key={index} variant="link" size="sm" className="p-0 h-auto text-purple-600">
                          <FileText className="h-4 w-4 mr-1" />
                          {attachment}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {filteredAnnouncements.length === 0 && !loading && (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum comunicado encontrado</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' ? 
                'Tente ajustar os filtros de busca.' : 
                'Nenhum comunicado disponível no momento.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}