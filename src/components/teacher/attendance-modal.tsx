'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ClipboardCheck, Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson?: any;
  students: any[];
  onSuccess: () => void;
}

export function AttendanceModal({ isOpen, onClose, lesson, students, onSuccess }: AttendanceModalProps) {
  const [attendanceData, setAttendanceData] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lesson && students) {
      // Initialize attendance data
      const initialData: {[key: number]: string} = {};
      
      if (lesson.attendances && lesson.attendances.length > 0) {
        // Load existing attendance data
        lesson.attendances.forEach((att: any) => {
          initialData[att.studentId] = att.status;
        });
      } else {
        // Default all to present
        students.forEach(student => {
          initialData[student.id] = 'present';
        });
      }
      
      setAttendanceData(initialData);
    }
  }, [lesson, students, isOpen]);

  const updateAttendance = (studentId: number, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Here you would make the API call
      const attendancePayload = {
        lessonId: lesson.id,
        attendances: Object.entries(attendanceData).map(([studentId, status]) => ({
          studentId: parseInt(studentId),
          status
        }))
      };
      
      console.log('Saving attendance:', attendancePayload);
      
      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      present: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Presente', icon: CheckCircle },
      absent: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Ausente', icon: XCircle },
      late: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Atrasado', icon: Clock },
      justified: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Justificado', icon: AlertCircle }
    };
    
    const { color, label, icon: Icon } = config[status as keyof typeof config];
    
    return (
      <Badge className={`${color} border flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getAttendanceStats = () => {
    const stats = { present: 0, absent: 0, late: 0, justified: 0 };
    Object.values(attendanceData).forEach(status => {
      stats[status as keyof typeof stats]++;
    });
    return stats;
  };

  const stats = getAttendanceStats();

  if (!isOpen || !lesson) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Registro de Frequência</h2>
            <p className="text-sm text-gray-600 mt-1">
              {lesson.topic} • {new Date(lesson.date).toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Presentes</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Ausentes</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Atrasados</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
            </div>
            
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Justificados</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.justified}</p>
            </div>
          </div>
        </div>

        {/* Student List */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">Matrícula: {student.registrationNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {getStatusBadge(attendanceData[student.id] || 'present')}
                    
                    <div className="flex space-x-2">
                      {[
                        { value: 'present', label: 'Presente', color: 'bg-green-100 hover:bg-green-200 text-green-800', icon: CheckCircle },
                        { value: 'absent', label: 'Ausente', color: 'bg-red-100 hover:bg-red-200 text-red-800', icon: XCircle },
                        { value: 'late', label: 'Atrasado', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800', icon: Clock },
                        { value: 'justified', label: 'Justificado', color: 'bg-blue-100 hover:bg-blue-200 text-blue-800', icon: AlertCircle }
                      ].map((option) => {
                        const isSelected = attendanceData[student.id] === option.value;
                        const Icon = option.icon;
                        
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateAttendance(student.id, option.value)}
                            className={`
                              p-2 rounded-lg border transition-all duration-200 
                              ${isSelected 
                                ? `${option.color} border-current shadow-sm` 
                                : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-300'
                              }
                            `}
                            title={option.label}
                          >
                            <Icon className="h-4 w-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {students.length} alunos
                </span>
                <span className="flex items-center gap-1">
                  <ClipboardCheck className="h-4 w-4" />
                  {((stats.present / students.length) * 100).toFixed(0)}% de presença
                </span>
              </div>
              
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Salvando...' : 'Salvar Frequência'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}