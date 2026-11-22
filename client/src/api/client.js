import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: standard error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If 401 and token was present, token may be expired
      const isAuthCheck = error.config.url.includes('/auth/me');
      if (!isAuthCheck && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
};

// Jobs API
export const jobAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getEmployerJobs: (params) => api.get('/jobs/employer/my-jobs', { params }),
  getEmployerStats: () => api.get('/jobs/employer/stats'),
};

// Resumes API
export const resumeAPI = {
  uploadResume: (formData) =>
    api.post('/resumes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyResumes: () => api.get('/resumes'),
  setDefaultResume: (id) => api.put(`/resumes/${id}/default`),
  deleteResume: (id) => api.delete(`/resumes/${id}`),
  getDownloadUrl: (id) => `/api/resumes/${id}/download`,
};

// Applications API
export const applicationAPI = {
  applyToJob: (data) => api.post('/applications', data),
  getMyApplications: (params) => api.get('/applications/my-applications', { params }),
  getJobApplicants: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  getAllEmployerApplications: (params) => api.get('/applications/employer/all', { params }),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  updateNotes: (id, data) => api.patch(`/applications/${id}/notes`, data),
};

// Notifications API
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  updateJobStatus: (id, status) => api.patch(`/admin/jobs/${id}/status`, { status }),
};
