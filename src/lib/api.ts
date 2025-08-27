import axios from 'axios';
import type { 
  Student, Teacher, Guardian, SchoolClass, Subject, Lesson, 
  Attendance, Grade, Occurrence, Tuition, Salary, FinancialAccount,
  FinancialDashboard, LoginRequest, LoginResponse, User, AcademicTerm,
  EducationLevel, GradeLevel, Diary, DiaryStatistics, FinancialTransaction,
  FinancialTransactionFilters, FinancialTransactionResponse, CashFlowData,
  BulkCreateResponse, PaymentRequest
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  validateToken: () => api.get<{ user: User }>('/auth/validate'),
};

// Students API
export const studentApi = {
  getAll: (params?: any) => api.get<Student[]>('/students', { params }),
  getById: (id: number) => api.get<Student>(`/students/${id}`),
  create: (data: Partial<Student>) => {
    console.log("🐛 DEBUG - studentApi.create payload:", { student: data });
    return api.post<Student>('/students', { student: data });
  },
  update: (id: number, data: Partial<Student>) => {
    console.log("🐛 DEBUG - studentApi.update payload para ID", id, ":", { student: data });
    return api.put<Student>(`/students/${id}`, { student: data });
  },
  delete: (id: number) => api.delete(`/students/${id}`),
  getReport: (id: number, termId: number) => 
    api.get(`/students/${id}/report?term_id=${termId}`),
};

// Teachers API
export const teacherApi = {
  getAll: (params?: any) => api.get<Teacher[]>('/teachers', { params }),
  getById: (id: number) => api.get<Teacher>(`/teachers/${id}`),
  create: (data: any) => {
    console.log("🐛 DEBUG - teacherApi.create payload:", { teacher: data });
    return api.post<Teacher>('/teachers', { teacher: data });
  },
  update: (id: number, data: any) => {
    console.log("🐛 DEBUG - teacherApi.update payload para ID", id, ":", { teacher: data });
    return api.put<Teacher>(`/teachers/${id}`, { teacher: data });
  },
  delete: (id: number) => api.delete(`/teachers/${id}`),
};

// Classes API
export const classApi = {
  getAll: (params?: any) => api.get<SchoolClass[]>('/classes', { params }),
  getById: (id: number) => api.get<SchoolClass>(`/classes/${id}`),
  create: (data: Partial<SchoolClass>) => {
    console.log("🐛 DEBUG - classApi.create payload:", { school_class: data });
    return api.post<SchoolClass>('/classes', { school_class: data });
  },
  update: (id: number, data: Partial<SchoolClass>) => {
    console.log("🐛 DEBUG - classApi.update payload para ID", id, ":", { school_class: data });
    return api.put<SchoolClass>(`/classes/${id}`, { school_class: data });
  },
  delete: (id: number) => api.delete(`/classes/${id}`),
  getStudents: (id: number) => api.get<Student[]>(`/classes/${id}/students`),
  getLessons: (id: number) => api.get<Lesson[]>(`/classes/${id}/lessons`),
  createLesson: (id: number, data: Partial<Lesson>) => 
    api.post<Lesson>(`/classes/${id}/lessons`, data),
};

// Subjects API
export const subjectApi = {
  getAll: () => api.get<Subject[]>('/subjects'),
  getById: (id: number) => api.get<Subject>(`/subjects/${id}`),
  create: (data: Partial<Subject>) => api.post<Subject>('/subjects', data),
  update: (id: number, data: Partial<Subject>) => api.put<Subject>(`/subjects/${id}`, data),
  delete: (id: number) => api.delete(`/subjects/${id}`),
};

// Lessons API
export const lessonApi = {
  getAll: (params?: any) => api.get<Lesson[]>('/lessons', { params }),
  getById: (id: number) => api.get<Lesson>(`/lessons/${id}`),
  create: (data: Partial<Lesson>) => api.post<Lesson>('/lessons', data),
  update: (id: number, data: Partial<Lesson>) => api.put<Lesson>(`/lessons/${id}`, data),
  delete: (id: number) => api.delete(`/lessons/${id}`),
  getAttendances: (id: number) => api.get<Attendance[]>(`/lessons/${id}/attendances`),
};

// Attendances API
export const attendanceApi = {
  getAll: (params?: any) => api.get<Attendance[]>('/attendances', { params }),
  update: (id: number, data: Partial<Attendance>) => 
    api.put<Attendance>(`/attendances/${id}`, data),
  bulkUpdate: (attendances: Array<{ id: number; status: string; observation?: string }>) =>
    api.put('/attendances/bulk_update', { attendances }),
  getReport: (params: any) => api.get('/attendances/report', { params }),
};

// Grades API
export const gradeApi = {
  getAll: (params?: any) => api.get<Grade[]>('/grades', { params }),
  getById: (id: number) => api.get<Grade>(`/grades/${id}`),
  create: (data: Partial<Grade>) => {
    console.log('Grade API create called with:', data);
    console.log('Full request payload:', { grade: data });
    const token = localStorage.getItem('token');
    console.log('Auth token exists:', !!token);
    return api.post<Grade>('/grades', { grade: data });
  },
  update: (id: number, data: Partial<Grade>) => api.put<Grade>(`/grades/${id}`, data),
  delete: (id: number) => api.delete(`/grades/${id}`),
  getReport: (params: any) => api.get('/grades/report', { params }),
};

// Occurrences API
export const occurrenceApi = {
  getAll: (params?: any) => api.get<Occurrence[]>('/occurrences', { params }),
  getById: (id: number) => api.get<Occurrence>(`/occurrences/${id}`),
  create: (data: Partial<Occurrence>) => api.post<Occurrence>('/occurrences', data),
  update: (id: number, data: Partial<Occurrence>) => api.put<Occurrence>(`/occurrences/${id}`, data),
  delete: (id: number) => api.delete(`/occurrences/${id}`),
};

// Salaries API
export const salaryApi = {
  getAll: (params?: any) => api.get<Salary[]>('/salaries', { params }),
  getById: (id: number) => api.get<Salary>(`/salaries/${id}`),
  create: (data: Partial<Salary>) => api.post<Salary>('/salaries', { salary: data }),
  update: (id: number, data: Partial<Salary>) => api.put<Salary>(`/salaries/${id}`, { salary: data }),
  delete: (id: number) => api.delete(`/salaries/${id}`),
  pay: (id: number) => api.put(`/salaries/${id}/pay`),
  bulkGenerate: (month: number, year: number) => 
    api.post('/salaries/bulk_generate', { month, year }),
  getStatistics: (params?: any) => api.get('/salaries/statistics', { params }),
};

// Tuitions API
export const tuitionApi = {
  getAll: (params?: any) => api.get<Tuition[]>('/tuitions', { params }),
  getById: (id: number) => api.get<Tuition>(`/tuitions/${id}`),
  create: (data: Partial<Tuition>) => api.post<Tuition>('/tuitions', { tuition: data }),
  update: (id: number, data: Partial<Tuition>) => api.put<Tuition>(`/tuitions/${id}`, { tuition: data }),
  delete: (id: number) => api.delete(`/tuitions/${id}`),
  pay: (id: number, paymentData: any) => api.put(`/tuitions/${id}/pay`, paymentData),
  bulkGenerate: (month: number, year: number, amount: number) => 
    api.post('/tuitions/bulk_generate', { month, year, amount }),
  getStatistics: (params?: any) => api.get('/tuitions/statistics', { params }),
  getOverdueReport: () => api.get('/tuitions/overdue_report'),
};

// Finances API
export const financeApi = {
  getDashboard: (month?: string) => 
    api.get<FinancialDashboard>('/finances/dashboard', { params: { month } }),
  getTuitions: (params?: any) => api.get<Tuition[]>('/finances/tuitions', { params }),
  updateTuition: (id: number, data: Partial<Tuition>) =>
    api.put<Tuition>(`/finances/tuitions/${id}`, data),
  getSalaries: (params?: any) => api.get<Salary[]>('/finances/salaries', { params }),
  updateSalary: (id: number, data: Partial<Salary>) =>
    api.put<Salary>(`/finances/salaries/${id}`, data),
  getFinancialAccounts: (params?: any) => 
    api.get<FinancialAccount[]>('/finances/financial_accounts', { params }),
  createFinancialAccount: (data: Partial<FinancialAccount>) =>
    api.post<FinancialAccount>('/finances/financial_accounts', data),
  getReports: (params: any) => api.get('/finances/reports', { params }),
};

// Reports API
export const reportApi = {
  getStudentReport: (params: any) => api.get('/reports/student_report', { params }),
  getAttendanceReport: (params: any) => api.get('/reports/attendance_report', { params }),
  getFinancialReport: (params: any) => api.get('/reports/financial_report', { params }),
  getGradesReport: (params: any) => api.get('/reports/grades_report', { params }),
};

// Academic Terms API
export const academicTermApi = {
  getAll: () => api.get<AcademicTerm[]>('/academic_terms'),
  getById: (id: number) => api.get<AcademicTerm>(`/academic_terms/${id}`),
  create: (data: Partial<AcademicTerm>) => api.post<AcademicTerm>('/academic_terms', data),
  update: (id: number, data: Partial<AcademicTerm>) => api.put<AcademicTerm>(`/academic_terms/${id}`, data),
  delete: (id: number) => api.delete(`/academic_terms/${id}`),
  setActive: (id: number) => api.put(`/academic_terms/${id}/set_active`),
};

// Education Levels API
export const educationLevelApi = {
  getAll: () => api.get<EducationLevel[]>('/education_levels'),
  getById: (id: number) => api.get<EducationLevel>(`/education_levels/${id}`),
  create: (data: Partial<EducationLevel>) => api.post<EducationLevel>('/education_levels', data),
  update: (id: number, data: Partial<EducationLevel>) => api.put<EducationLevel>(`/education_levels/${id}`, data),
  delete: (id: number) => api.delete(`/education_levels/${id}`),
};

// Grade Levels API
export const gradeLevelApi = {
  getAll: (params?: any) => {
    console.log("🐛 DEBUG - gradeLevelApi.getAll called with params:", params);
    return api.get<GradeLevel[]>('/grade_levels', { params }).then(response => {
      console.log("🐛 DEBUG - gradeLevelApi.getAll response:", response.data);
      return response;
    });
  },
  getById: (id: number) => api.get<GradeLevel>(`/grade_levels/${id}`),
  create: (data: Partial<GradeLevel>) => {
    console.log("🐛 DEBUG - gradeLevelApi.create payload:", { grade_level: data });
    return api.post<GradeLevel>('/grade_levels', { grade_level: data });
  },
  update: (id: number, data: Partial<GradeLevel>) => {
    console.log("🐛 DEBUG - gradeLevelApi.update payload para ID", id, ":", { grade_level: data });
    return api.put<GradeLevel>(`/grade_levels/${id}`, { grade_level: data });
  },
  delete: (id: number) => api.delete(`/grade_levels/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getOverview: () => api.get('/dashboard'),
};

// Diaries API
export const diaryApi = {
  getAll: (params?: any) => api.get<Diary[]>('/diaries', { params }),
  getById: (id: number) => api.get<Diary>(`/diaries/${id}`),
  create: (data: Partial<Diary>) => api.post<Diary>('/diaries', data),
  update: (id: number, data: Partial<Diary>) => api.put<Diary>(`/diaries/${id}`, data),
  delete: (id: number) => api.delete(`/diaries/${id}`),
  getStudents: (id: number) => api.get(`/diaries/${id}/students`),
  getStatistics: (id: number) => api.get<DiaryStatistics>(`/diaries/${id}/statistics`),
  getGrades: (id: number) => api.get<any[]>(`/grades`, { params: { diary_id: id } }),
  getOccurrences: (id: number, date?: string) => api.get<any[]>(`/diaries/${id}/occurrences`, { params: date ? { date } : {} }),
  
  // Lessons within diary
  getLessons: (diaryId: number, params?: any) => 
    api.get<Lesson[]>(`/diaries/${diaryId}/lessons`, { params }),
  getLesson: (diaryId: number, lessonId: number) => 
    api.get<Lesson>(`/diaries/${diaryId}/lessons/${lessonId}`),
  createLesson: (diaryId: number, data: Partial<Lesson>) => 
    api.post<Lesson>(`/diaries/${diaryId}/lessons`, data),
  updateLesson: (diaryId: number, lessonId: number, data: Partial<Lesson>) =>
    api.put<Lesson>(`/diaries/${diaryId}/lessons/${lessonId}`, data),
  deleteLesson: (diaryId: number, lessonId: number) =>
    api.delete(`/diaries/${diaryId}/lessons/${lessonId}`),
  completeLesson: (diaryId: number, lessonId: number) =>
    api.put(`/diaries/${diaryId}/lessons/${lessonId}/complete_lesson`),
  cancelLesson: (diaryId: number, lessonId: number) =>
    api.put(`/diaries/${diaryId}/lessons/${lessonId}/cancel_lesson`),
  
  // Attendance within lessons
  getLessonAttendances: (diaryId: number, lessonId: number) =>
    api.get(`/diaries/${diaryId}/lessons/${lessonId}/attendances`),
  updateAttendances: (diaryId: number, lessonId: number, attendances: any[]) => {
    console.log('API call to:', `/diaries/${diaryId}/lessons/${lessonId}/update_attendances`);
    return api.put(`/diaries/${diaryId}/lessons/${lessonId}/update_attendances`, { attendances });
  },
};

// Financial Transactions API (Unified)
export const financialTransactionApi = {
  getAll: (filters?: FinancialTransactionFilters) => 
    api.get<FinancialTransactionResponse>('/financial_transactions', { params: filters }),
  
  getById: (id: number) => 
    api.get<{ transaction: FinancialTransaction }>(`/financial_transactions/${id}`),
  
  create: (data: Partial<FinancialTransaction>) =>
    api.post<{ transaction: FinancialTransaction }>('/financial_transactions', { financial_transaction: data }),
  
  update: (id: number, data: Partial<FinancialTransaction>) =>
    api.put<{ transaction: FinancialTransaction }>(`/financial_transactions/${id}`, { financial_transaction: data }),
  
  delete: (id: number) => 
    api.delete(`/financial_transactions/${id}`),
  
  pay: (id: number, paymentData: PaymentRequest) =>
    api.put<{ transaction: FinancialTransaction; message: string }>(`/financial_transactions/${id}/pay`, paymentData),
  
  generateCoraInvoice: (id: number) =>
    api.post<{ success: boolean; transaction: FinancialTransaction; coraInvoice: any }>(`/financial_transactions/${id}/generate_cora_invoice`),
  
  // Cash flow dashboard
  getCashFlow: (startDate?: string, endDate?: string) =>
    api.get<CashFlowData>('/financial_transactions/cash_flow', { 
      params: { start_date: startDate, end_date: endDate } 
    }),
  
  // Bulk operations
  bulkCreateTuitions: (month: number, year: number, amount: number) =>
    api.post<BulkCreateResponse>('/financial_transactions/bulk_create_tuitions', { month, year, amount }),
  
  bulkCreateSalaries: (month: number, year: number) =>
    api.post<BulkCreateResponse>('/financial_transactions/bulk_create_salaries', { month, year }),
  
  // Statistics
  getStatistics: (year?: number, month?: number) =>
    api.get<{ stats: any }>('/financial_transactions/statistics', { params: { year, month } }),
};

// Cora Invoices API
export const coraInvoiceApi = {
  getAll: (params?: any) => 
    api.get<{ invoices: any[]; pagination: any }>('/cora_invoices', { params }),
  
  getById: (id: number) => 
    api.get<{ invoice: any }>(`/cora_invoices/${id}`),
  
  generatePixVoucher: (id: number) =>
    api.post<{ 
      success: boolean; 
      message: string; 
      invoice: any; 
      pix_data: { 
        qr_code: string; 
        qr_code_url: string; 
        amount: string; 
        recipient: string; 
      } 
    }>(`/cora_invoices/${id}/generate_pix_voucher`),
  
  generateBoleto: (id: number) =>
    api.post<{ 
      success: boolean; 
      message: string; 
      invoice: any; 
      boleto_data: { 
        url: string; 
        amount: string; 
        due_date: string; 
        student_name?: string; 
      } 
    }>(`/cora_invoices/${id}/generate_boleto`),
  
  cancel: (id: number) =>
    api.patch<{ success: boolean; message: string; invoice: any }>(`/cora_invoices/${id}/cancel`),
  
  getByTransaction: (transactionId: number) =>
    api.get<{ invoice: any }>('/cora_invoices/by_transaction', { 
      params: { transaction_id: transactionId } 
    }),
};

// Admin API
export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  getSystemStats: () => api.get('/admin/system_stats'),
  
  // Students
  students: {
    getAll: (params?: any) => api.get('/admin/students', { params }),
    getById: (id: number) => api.get(`/admin/students/${id}`),
    create: (data: any) => api.post('/admin/students', { student: data }),
    update: (id: number, data: any) => api.put(`/admin/students/${id}`, { student: data }),
    delete: (id: number) => api.delete(`/admin/students/${id}`),
    export: (format: 'csv' | 'json' = 'csv') => 
      api.get('/admin/students/export', { 
        headers: { Accept: format === 'csv' ? 'text/csv' : 'application/json' }
      }),
    bulkImport: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/admin/students/bulk_import', formData);
    }
  },
  
  // Guardians
  guardians: {
    getAll: (params?: any) => api.get('/admin/guardians', { params }),
    getById: (id: number) => api.get(`/admin/guardians/${id}`),
    create: (data: any) => api.post('/admin/guardians', { guardian: data }),
    update: (id: number, data: any) => api.put(`/admin/guardians/${id}`, { guardian: data }),
    delete: (id: number) => api.delete(`/admin/guardians/${id}`),
    getStudents: (id: number) => api.get(`/admin/guardians/${id}/students`)
  },
  
  // Users
  users: {
    getAll: (params?: any) => api.get('/admin/users', { params }),
    getById: (id: number) => api.get(`/admin/users/${id}`),
    create: (data: any) => api.post('/admin/users', { user: data }),
    update: (id: number, data: any) => api.put(`/admin/users/${id}`, { user: data }),
    delete: (id: number) => api.delete(`/admin/users/${id}`),
    changeRole: (id: number, role: string) => api.put(`/admin/users/${id}/change_role`, { role }),
    resetPassword: (id: number, password?: string) => 
      api.put(`/admin/users/${id}/reset_password`, { password })
  },
  
  // Teachers
  teachers: {
    getAll: (params?: any) => api.get('/admin/teachers', { params }),
    getById: (id: number) => api.get(`/admin/teachers/${id}`),
    create: (data: any) => api.post('/admin/teachers', { teacher: data }),
    update: (id: number, data: any) => api.put(`/admin/teachers/${id}`, { teacher: data }),
    delete: (id: number) => api.delete(`/admin/teachers/${id}`),
    export: () => api.get('/admin/teachers/export'),
    bulkImport: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/admin/teachers/bulk_import', formData);
    }
  },
  
  // Classes
  classes: {
    getAll: (params?: any) => api.get('/admin/classes', { params }),
    getById: (id: number) => api.get(`/admin/classes/${id}`),
    create: (data: any) => {
      console.log("🐛 DEBUG - adminApi.classes.create payload:", { school_class: data });
      return api.post('/admin/classes', { school_class: data });
    },
    update: (id: number, data: any) => {
      console.log("🐛 DEBUG - adminApi.classes.update payload para ID", id, ":", { school_class: data });
      return api.put(`/admin/classes/${id}`, { school_class: data });
    },
    delete: (id: number) => api.delete(`/admin/classes/${id}`),
    bulkAddStudents: (id: number, studentIds: number[]) => 
      api.post(`/admin/classes/${id}/bulk_add_students`, { student_ids: studentIds }),
    removeStudent: (id: number, studentId: number) => 
      api.delete(`/admin/classes/${id}/remove_student`, { params: { student_id: studentId } })
  }
};

export { api };