'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'test' | 'meeting' | 'holiday' | 'event' | 'project';
  location?: string;
  description: string;
  affectedStudents: string[];
  priority: 'low' | 'medium' | 'high';
}

export default function GuardianCalendarPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadEvents();
  }, [selectedMonth, selectedYear]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Dados simulados - no backend, buscar eventos relevantes para os filhos do responsável
      const mockEvents: CalendarEvent[] = [
        {
          id: 1,
          title: 'Prova de Matemática',
          date: '2024-01-25',
          time: '08:00',
          type: 'test',
          location: 'Sala 5A',
          description: 'Avaliação sobre frações e números decimais',
          affectedStudents: ['Ana Silva'],
          priority: 'high'
        },
        {
          id: 2,
          title: 'Reunião de Pais',
          date: '2024-01-30',
          time: '19:00',
          type: 'meeting',
          location: 'Auditório',
          description: 'Reunião para discutir o desenvolvimento dos alunos no 1º bimestre',
          affectedStudents: ['Ana Silva', 'Pedro Silva'],
          priority: 'high'
        },
        {
          id: 3,
          title: 'Apresentação de Ciências',
          date: '2024-01-28',
          time: '14:00',
          type: 'project',
          location: 'Laboratório',
          description: 'Apresentação do projeto sobre sistema solar',
          affectedStudents: ['Pedro Silva'],
          priority: 'medium'
        },
        {
          id: 4,
          title: 'Festa Junina',
          date: '2024-06-15',
          time: '15:00',
          type: 'event',
          location: 'Pátio da Escola',
          description: 'Celebração da festa junina com apresentações dos alunos',
          affectedStudents: ['Ana Silva', 'Pedro Silva'],
          priority: 'medium'
        },
        {
          id: 5,
          title: 'Feriado - Dia da Consciência Negra',
          date: '2024-11-20',
          time: '',
          type: 'holiday',
          description: 'Não haverá aulas',
          affectedStudents: ['Ana Silva', 'Pedro Silva'],
          priority: 'low'
        }
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    const icons = {
      test: BookOpen,
      meeting: Users,
      holiday: Star,
      event: Calendar,
      project: CheckCircle
    };
    return icons[type as keyof typeof icons] || Calendar;
  };

  const getEventColor = (type: string, priority: string) => {
    if (type === 'test') return 'bg-red-100 text-red-800 border-red-200';
    if (type === 'meeting') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (type === 'holiday') return 'bg-green-100 text-green-800 border-green-200';
    if (type === 'event') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (type === 'project') return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      high: { color: 'bg-red-100 text-red-800', label: 'Alta' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Média' },
      low: { color: 'bg-green-100 text-green-800', label: 'Baixa' }
    };
    
    const { color, label } = config[priority as keyof typeof config];
    return <Badge className={color}>{label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      test: 'Prova',
      meeting: 'Reunião',
      holiday: 'Feriado',
      event: 'Evento',
      project: 'Projeto'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const thisMonthEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear;
  });

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Calendário Escolar</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe os eventos importantes dos seus filhos
          </p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleDateString('pt-BR', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {[2023, 2024, 2025].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Próximos Eventos</p>
                <p className="text-3xl font-bold text-purple-600">{upcomingEvents.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Provas</p>
                <p className="text-3xl font-bold text-red-600">
                  {events.filter(e => e.type === 'test').length}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reuniões</p>
                <p className="text-3xl font-bold text-blue-600">
                  {events.filter(e => e.type === 'meeting').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos</p>
                <p className="text-3xl font-bold text-green-600">
                  {events.filter(e => e.type === 'event').length}
                </p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const Icon = getEventIcon(event.type);
                return (
                  <div key={event.id} className={`p-4 rounded-lg border ${getEventColor(event.type, event.priority)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <h3 className="font-semibold">{event.title}</h3>
                      </div>
                      {getPriorityBadge(event.priority)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                        {event.time && (
                          <>
                            <Clock className="h-4 w-4 ml-2" />
                            <span>{event.time}</span>
                          </>
                        )}
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      <p className="mt-2">{event.description}</p>
                      
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-1">Filhos envolvidos:</p>
                        <div className="flex flex-wrap gap-1">
                          {event.affectedStudents.map((student, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {student}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {upcomingEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>Nenhum evento próximo</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* This Month Events */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Este Mês ({new Date(selectedYear, selectedMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {thisMonthEvents.map((event) => {
                const Icon = getEventIcon(event.type);
                return (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString('pt-BR')}
                          {event.time && ` às ${event.time}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(event.type)}
                    </Badge>
                  </div>
                );
              })}
              
              {thisMonthEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>Nenhum evento neste mês</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}