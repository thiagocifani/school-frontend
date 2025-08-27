export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'guardian' | 'financial';
  cpf?: string;
  phone?: string;
}

export interface Student {
  id: number;
  name: string;
  birthDate?: string;
  birth_date?: string; // API response format
  registrationNumber?: string;
  registration_number?: string; // API response format
  status: 'active' | 'inactive' | 'transferred';
  cpf?: string;
  gender?: 'male' | 'female' | 'other';
  birthPlace?: string;
  birth_place?: string; // API response format
  age?: number;
  // Medical and family information (supporting both camelCase and snake_case)
  hasSiblingEnrolled?: boolean;
  has_sibling_enrolled?: boolean; // API response format
  siblingName?: string;
  sibling_name?: string; // API response format
  hasSpecialistMonitoring?: boolean;
  has_specialist_monitoring?: boolean; // API response format
  specialistDetails?: string;
  specialist_details?: string; // API response format
  hasMedicationAllergy?: boolean;
  has_medication_allergy?: boolean; // API response format
  medicationAllergyDetails?: string;
  medication_allergy_details?: string; // API response format
  hasFoodAllergy?: boolean;
  has_food_allergy?: boolean; // API response format
  foodAllergyDetails?: string;
  food_allergy_details?: string; // API response format
  hasMedicalTreatment?: boolean;
  has_medical_treatment?: boolean; // API response format
  medicalTreatmentDetails?: string;
  medical_treatment_details?: string; // API response format
  usesSpecificMedication?: boolean;
  uses_specific_medication?: boolean; // API response format
  specificMedicationDetails?: string;
  specific_medication_details?: string; // API response format
  schoolClass?: SchoolClass;
  school_class?: SchoolClass; // API response format
  guardians?: Guardian[];
  recentGrades?: Grade[];
  attendanceSummary?: AttendanceSummary;
  recentOccurrences?: Occurrence[];
}

export interface Teacher {
  id: number;
  user?: User;
  salary?: number;
  hireDate?: string;
  status?: 'active' | 'inactive';
  specialization?: string;
  classes?: SchoolClass[];
  subjects?: Subject[];
  recentLessons?: Lesson[];
  salarySummary?: SalarySummary;
}

export interface Guardian {
  id: number;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  age?: number;
  rg?: string;
  profession?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  address: string;
  neighborhood?: string;
  complement?: string;
  zipCode?: string;
  emergencyPhone?: string;
  students: Student[];
  relationship?: string;
}

export interface SchoolClass {
  id: number;
  name: string;
  gradeLevel?: GradeLevel;
  section: string;
  academicTerm?: AcademicTerm;
  mainTeacher?: Teacher;
  maxStudents: number;
  studentsCount?: number;
  students?: Student[];
  subjects?: ClassSubject[];
  period: 'morning' | 'afternoon' | 'evening';
}

export interface AcademicTerm {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  termType: 'bimester' | 'quarter' | 'semester';
  year: number;
  active: boolean;
}

export interface EducationLevel {
  id: number;
  name: string;
  description?: string;
  ageRange?: string;
}

export interface GradeLevel {
  id: number;
  name: string;
  educationLevel: EducationLevel;
  order: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  workload?: number;
}

export interface Lesson {
  id: number;
  date: string;
  topic: string;
  content?: string;
  homework?: string;
  classSubject?: ClassSubject;
  subject?: Subject;
  class?: SchoolClass;
  teacher?: Teacher;
  attendances?: Attendance[];
}

export interface ClassSubject {
  id: number;
  schoolClass: SchoolClass;
  subject: Subject;
  teacher: Teacher;
  weeklyHours: number;
}

export interface Attendance {
  id: number;
  status: 'present' | 'absent' | 'late' | 'justified';
  observation?: string;
  student: Student;
  lesson: Lesson;
}

export interface AttendanceSummary {
  totalClasses: number;
  present: number;
  absent: number;
  late?: number;
  justified?: number;
  percentage: number;
}

export interface Grade {
  id: number;
  value: number;
  gradeType: string;
  date: string;
  observation?: string;
  student: Student;
  classSubject: ClassSubject;
  academicTerm: AcademicTerm;
  subject?: Subject;
  term?: string;
}

export interface Occurrence {
  id: number;
  date: string;
  occurrenceType: 'disciplinary' | 'medical' | 'positive' | 'other';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  notifiedGuardians: boolean;
  student: Student;
  teacher: Teacher;
}

export interface Tuition {
  id: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'pix';
  discount?: number;
  lateFee?: number;
  totalAmount: number;
  daysOverdue?: number;
  observation?: string;
  student: Student;
}

export interface Salary {
  id: number;
  amount: number;
  month: number;
  year: number;
  monthYear: string;
  paymentDate?: string;
  status: 'pending' | 'paid';
  bonus?: number;
  deductions?: number;
  totalAmount: number;
  teacher: Teacher;
}

export interface SalarySummary {
  totalPaid: number;
  totalPending: number;
  lastPayment?: string;
}

export interface FinancialAccount {
  id: number;
  description: string;
  amount: number;
  accountType: 'income' | 'expense';
  category: string;
  date: string;
  status: 'pending' | 'paid' | 'cancelled';
  referenceType?: string;
  referenceId?: number;
}

export interface FinancialDashboard {
  monthlyReceivable: number;
  monthlyReceived: number;
  monthlyPayable: number;
  monthlyPaid: number;
  balance: number;
  pendingTuitions: TuitionSummary[];
  upcomingSalaries: SalarySummary[];
  recentTransactions: TransactionSummary[];
}

export interface TuitionSummary {
  id: number;
  student: {
    name: string;
    class?: string;
  };
  amount: number;
  dueDate: string;
  daysOverdue?: number;
}

export interface TransactionSummary {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
}

export interface StudentReport {
  student: {
    name: string;
    registration: string;
    class?: string;
  };
  term: {
    name: string;
    period: string;
  };
  grades: Record<string, {
    grades: Array<{ type: string; value: number; date: string }>;
    average?: number;
  }>;
  attendance: AttendanceSummary;
  occurrences: Array<{
    date: string;
    type: string;
    title: string;
    description: string;
    severity: string;
    teacher: string;
  }>;
}

export interface AttendanceReport {
  class: {
    id: number;
    name: string;
  };
  period: string;
  students: Array<{
    student: {
      id: number;
      name: string;
      registrationNumber: string;
    };
    totalClasses: number;
    present: number;
    absent: number;
    percentage: number;
  }>;
}

export interface FinancialReport {
  period: string;
  income: {
    total: number;
    accounts: number;
    tuitions: number;
    byCategory: Record<string, number>;
  };
  expenses: {
    total: number;
    accounts: number;
    salaries: number;
    byCategory: Record<string, number>;
  };
  balance: number;
  tuitions: {
    totalDue: number;
    totalPaid: number;
    pendingCount: number;
    overdueCount: number;
    collectionRate: number;
  };
  salaries: {
    totalDue: number;
    totalPaid: number;
    pendingCount: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// Financial Transaction (Unified model)
export interface FinancialTransaction {
  id: number;
  transactionType: 'tuition' | 'salary' | 'expense' | 'income';
  amount: number;
  finalAmount: number;
  formattedAmount: string;
  formattedFinalAmount: string;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'pix' | 'boleto';
  description: string;
  observation?: string;
  discount?: number;
  lateFee?: number;
  daysOverdue?: number;
  canBePaid: boolean;
  canBeCancelled: boolean;
  statusBadgeClass: string;
  typeIcon: string;
  externalId?: string;
  reference?: {
    type: string;
    id: number;
    name: string;
    registrationNumber?: string;
    className?: string;
    email?: string;
  };
  coraInvoice?: {
    invoiceId: string;
    boletoUrl?: string;
    pixQrCode?: string;
    pixQrCodeUrl?: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CashFlowSummary {
  period: string;
  receivables: {
    total: number;
    paid: number;
    pending: number;
  };
  payables: {
    total: number;
    paid: number;
    pending: number;
  };
  netFlow: number;
  transactionsCount: number;
}

export interface DailyBreakdown {
  date: string;
  receivablesDue: number;
  payablesDue: number;
  receivablesPaid: number;
  payablesPaid: number;
  netFlow: number;
}

export interface MonthlyBreakdown {
  month: number;
  year: number;
  name: string;
  receivables: {
    total: number;
    paid: number;
    pending: number;
  };
  payables: {
    total: number;
    paid: number;
    pending: number;
  };
  netFlow: number;
}

export interface CashFlowData {
  summary: CashFlowSummary;
  dailyBreakdown: DailyBreakdown[];
  monthlyBreakdown: MonthlyBreakdown[];
  recentTransactions: FinancialTransaction[];
  overdueTransactions: FinancialTransaction[];
}

export interface FinancialTransactionFilters {
  type?: 'tuition' | 'salary' | 'expense' | 'income';
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface FinancialTransactionResponse {
  transactions: FinancialTransaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    perPage: number;
  };
  summary: {
    totalCount: number;
    totalAmount: number;
    receivables: {
      count: number;
      amount: number;
      paid: number;
      pending: number;
    };
    payables: {
      count: number;
      amount: number;
      paid: number;
      pending: number;
    };
  };
}

export interface BulkCreateResponse {
  success: boolean;
  message: string;
  createdCount: number;
  transactions: FinancialTransaction[];
}

export interface PaymentRequest {
  paymentMethod: 'cash' | 'card' | 'transfer' | 'pix' | 'boleto';
  paidDate?: string;
}

// Export diary types
export * from './diary';