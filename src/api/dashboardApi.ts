import apiClient from './apiClient';
import type { AppointmentStats, Appointment } from '../types/appointment';
import { getAppointmentStats, getUpcomingAppointments } from './appointmentsApi';
import { getAllStaff } from './staffApi';
import { getAllServices } from './servicesApi';
import { getAllBlogPosts } from './blogApi';
import { getAllGalleryItems } from './galleryApi';
import { getAllMessages } from './contactMessagesApi';
import { getSettings } from './businessSettingsApi';

export interface DashboardData {
  healthOk: boolean | null;
  appointmentStats: AppointmentStats | null;
  upcomingAppointments: Appointment[] | null;
  activeStaffCount: number | null;
  activeServicesCount: number | null;
  publishedBlogCount: number | null;
  activeGalleryCount: number | null;
  unreadMessagesCount: number | null;
  settingsConfigured: boolean | null;
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [
    healthResult,
    statsResult,
    upcomingResult,
    staffResult,
    servicesResult,
    blogResult,
    galleryResult,
    messagesResult,
    settingsResult,
  ] = await Promise.allSettled([
    apiClient.get('/api/health'),
    getAppointmentStats(),
    getUpcomingAppointments(7),
    getAllStaff(),
    getAllServices(),
    getAllBlogPosts({ isPublished: true }),
    getAllGalleryItems({ isActive: true }),
    getAllMessages({ unreadOnly: true }),
    getSettings(),
  ]);

  return {
    healthOk: healthResult.status === 'fulfilled',
    appointmentStats: statsResult.status === 'fulfilled' ? statsResult.value.data : null,
    upcomingAppointments: upcomingResult.status === 'fulfilled' ? upcomingResult.value.data : null,
    activeStaffCount: staffResult.status === 'fulfilled'
      ? staffResult.value.data.filter(s => s.isActive).length
      : null,
    activeServicesCount: servicesResult.status === 'fulfilled'
      ? servicesResult.value.data.filter(s => s.isActive).length
      : null,
    publishedBlogCount: blogResult.status === 'fulfilled'
      ? blogResult.value.data.length
      : null,
    activeGalleryCount: galleryResult.status === 'fulfilled'
      ? galleryResult.value.data.length
      : null,
    unreadMessagesCount: messagesResult.status === 'fulfilled'
      ? messagesResult.value.data.length
      : null,
    settingsConfigured: settingsResult.status === 'fulfilled'
      ? settingsResult.value !== null
      : null,
  };
}
