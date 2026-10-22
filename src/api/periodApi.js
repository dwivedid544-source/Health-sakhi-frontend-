import axiosClient from './axiosClient';

const getDashboard = async (date) => {
  const url = date ? `/period/dashboard?date=${date}` : '/period/dashboard';
  const response = await axiosClient.get(url);
  return response.data;
};

const getCalendar = async (month, year) => {
  const response = await axiosClient.get(`/period/calendar?month=${month}&year=${year}`);
  return response.data;
};

const startPeriod = async (startDate, endDate, month, year, deleteLogId = null, keepBoth = false) => {
  const response = await axiosClient.post('/period/start', { startDate, endDate, month, year, deleteLogId, keepBoth });
  return response.data;
};

const getProfile = async () => {
  const response = await axiosClient.get('/period/profile');
  return response.data;
};

const setupProfile = async (profileData) => {
  const response = await axiosClient.post('/period/setup', profileData);
  return response.data;
};

const updateProfile = async (profileData, month, year) => {
  const response = await axiosClient.put('/period/profile', { ...profileData, month, year });
  return response.data;
};

const getLogs = async () => {
  const response = await axiosClient.get('/period/logs');
  return response.data;
};

const resetMonth = async (month, year) => {
  const response = await axiosClient.post('/period/reset-month', { month, year });
  return response.data;
};

export default {
  getDashboard,
  getCalendar,
  startPeriod,
  getProfile,
  setupProfile,
  updateProfile,
  getLogs,
  resetMonth
};
