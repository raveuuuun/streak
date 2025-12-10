/**
 * Date utility functions for streak calculations and date formatting
 */

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
};

export const getToday = (): string => {
  return formatDate(new Date());
};

export const getYesterday = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
};

export const getDaysDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isToday = (date: string): boolean => {
  return formatDate(new Date()) === date;
};

export const isYesterday = (date: string): boolean => {
  return getYesterday() === date;
};

export const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};

export const isConsecutiveDay = (date1: string, date2: string): boolean => {
  const diff = getDaysDifference(date1, date2);
  return diff === 1;
};

export const addDays = (date: string, days: number): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

export const subtractDays = (date: string, days: number): string => {
  return addDays(date, -days);
};

export const getStartOfWeek = (date?: string): string => {
  const d = date ? new Date(date) : new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(d.setDate(diff));
  return formatDate(monday);
};

export const getStartOfMonth = (date?: string): string => {
  const d = date ? new Date(date) : new Date();
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  return formatDate(firstDay);
};

export const isInCurrentWeek = (date: string): boolean => {
  const weekStart = getStartOfWeek();
  const weekEnd = addDays(weekStart, 6);
  return date >= weekStart && date <= weekEnd;
};

export const isInCurrentMonth = (date: string): boolean => {
  const monthStart = getStartOfMonth();
  const today = getToday();
  return date >= monthStart && date <= today;
};

