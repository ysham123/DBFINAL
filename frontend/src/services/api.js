import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data)
};

// Client APIs
export const clientAPI = {
  getProfile: () => api.get('/clients/profile'),
  updateProfile: (data) => api.put('/clients/profile', data)
};

// Request APIs
export const requestAPI = {
  create: (formData) => api.post('/requests', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyRequests: () => api.get('/requests/my-requests'),
  getAllRequests: () => api.get('/requests/all'),
  getRequest: (id) => api.get(`/requests/${id}`),
  cancelRequest: (id) => api.patch(`/requests/${id}/cancel`)
};

// Quote APIs
export const quoteAPI = {
  create: (data) => api.post('/quotes', data),
  getQuotesForRequest: (requestId) => api.get(`/quotes/request/${requestId}`),
  respondToQuote: (quoteId, data) => api.patch(`/quotes/${quoteId}/respond`, data)
};

// Order APIs
export const orderAPI = {
  getAllOrders: () => api.get('/orders/all'),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { completion_status: status })
};

// Bill APIs
export const billAPI = {
  create: (data) => api.post('/bills', data),
  getAllBills: () => api.get('/bills/all'),
  getMyBills: () => api.get('/bills/my-bills'),
  getBill: (id) => api.get(`/bills/${id}`),
  payBill: (id) => api.patch(`/bills/${id}/pay`),
  disputeBill: (id, data) => api.patch(`/bills/${id}/dispute`, data),
  reviseBill: (id, data) => api.patch(`/bills/${id}/revise`, data)
};

// Dashboard APIs
export const dashboardAPI = {
  getFrequentClients: () => api.get('/dashboard/frequent-clients'),
  getUncommittedClients: () => api.get('/dashboard/uncommitted-clients'),
  getAcceptedQuotes: (year, month) => api.get('/dashboard/accepted-quotes', { params: { year, month } }),
  getProspectiveClients: () => api.get('/dashboard/prospective-clients'),
  getLargestJobs: () => api.get('/dashboard/largest-jobs'),
  getOverdueBills: () => api.get('/dashboard/overdue-bills'),
  getBadClients: () => api.get('/dashboard/bad-clients'),
  getGoodClients: () => api.get('/dashboard/good-clients')
};

export default api;
