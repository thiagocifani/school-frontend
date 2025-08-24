import { api } from '../api';
import { Diary, Lesson, DiaryStudent, DiaryStatistics, LessonAttendance } from '@/types/diary';

export const diaryApi = {
  // Diary endpoints
  getAll: (params?: any) => api.get<Diary[]>('/diaries', { params }),
  getById: (id: number) => api.get<Diary>(`/diaries/${id}`),
  create: (data: Partial<Diary>) => api.post<Diary>('/diaries', data),
  update: (id: number, data: Partial<Diary>) => api.put<Diary>(`/diaries/${id}`, data),
  delete: (id: number) => api.delete(`/diaries/${id}`),
  
  // Diary specific endpoints
  getStudents: (id: number) => api.get<DiaryStudent[]>(`/diaries/${id}/students`),
  getStatistics: (id: number) => api.get<DiaryStatistics>(`/diaries/${id}/statistics`),
  getGrades: (id: number) => api.get<any[]>(`/grades`, { params: { diary_id: id } }),
  getOccurrences: (id: number, date?: string) => api.get<any[]>(`/diaries/${id}/occurrences`, { params: date ? { date } : {} }),
  
  // Lessons endpoints
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
  
  // Lesson specific endpoints
  getLessonAttendances: (diaryId: number, lessonId: number) => 
    api.get<LessonAttendance[]>(`/diaries/${diaryId}/lessons/${lessonId}/attendances`),
  updateAttendances: (diaryId: number, lessonId: number, attendances: any[]) => 
    api.put(`/diaries/${diaryId}/lessons/${lessonId}/update_attendances`, { attendances }),
  completeLesson: (diaryId: number, lessonId: number) => 
    api.put(`/diaries/${diaryId}/lessons/${lessonId}/complete_lesson`),
  cancelLesson: (diaryId: number, lessonId: number) => 
    api.put(`/diaries/${diaryId}/lessons/${lessonId}/cancel_lesson`),
};