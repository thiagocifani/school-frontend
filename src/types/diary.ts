export interface Diary {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  teacher: {
    id: number;
    name: string;
    email: string;
  };
  schoolClass: {
    id: number;
    name: string;
    section: string;
  };
  subject: {
    id: number;
    name: string;
    code: string;
  };
  academicTerm: {
    id: number;
    name: string;
    year: number;
  };
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  studentsCount: number;
  lessons?: Lesson[];
  students?: DiaryStudent[];
}

export interface Lesson {
  id: number;
  lessonNumber: number;
  date: string;
  topic: string;
  content: string;
  homework?: string;
  durationMinutes: number;
  status: 'planned' | 'completed' | 'cancelled';
  diary: {
    id: number;
    name: string;
    subject: string;
    class: string;
  };
  attendanceSummary: {
    total: number;
    present: number;
    absent: number;
    late: number;
    justified: number;
    present_percentage: number;
  };
  attendances?: LessonAttendance[];
  grades?: LessonGrade[];
  occurrences?: LessonOccurrence[];
}

export interface DiaryStudent {
  id: number;
  name: string;
  registrationNumber: string;
  average: number;
  attendancePercentage: number;
  gradesCount: number;
  occurrencesCount: number;
}

export interface LessonAttendance {
  id: number;
  student: {
    id: number;
    name: string;
    registrationNumber: string;
  };
  status: 'present' | 'absent' | 'late' | 'justified';
  observation?: string;
}

export interface LessonGrade {
  id: number;
  student: {
    id: number;
    name: string;
  };
  value: number;
  gradeType: string;
  date: string;
  observation?: string;
}

export interface LessonOccurrence {
  id: number;
  student: {
    id: number;
    name: string;
  };
  title: string;
  description: string;
  occurrenceType: 'disciplinary' | 'medical' | 'positive' | 'other';
  severity: 'low' | 'medium' | 'high';
  date: string;
}

export interface DiaryStatistics {
  totalLessons: number;
  completedLessons: number;
  plannedLessons: number;
  progressPercentage: number;
  totalStudents: number;
  averageAttendance: number;
  gradesCount: number;
  occurrencesCount: number;
}