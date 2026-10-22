import axiosClient from './axiosClient';

const authApi = {
  /**
   * Initiate passwordless login by sending an OTP to the user's email
   * @param {string} email
   * @param {string} role (Admin, Member, Advisor, Affiliate)
   */
  login: async (email, role, password) => {
    const response = await axiosClient.post('/auth/login', { email, role, password });
    return response.data;
  },

  /**
   * Validate the 6-digit OTP code and retrieve access/refresh tokens
   * @param {string} email
   * @param {string} otp
   */
  verifyOtp: async (email, otp) => {
    const response = await axiosClient.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  /**
   * Invalidate active session tokens on user logout
   * @param {string} refreshToken
   */
  logout: async (refreshToken) => {
    const response = await axiosClient.post('/auth/logout', { refreshToken });
    return response.data;
  },

  register: async (email, fullName, phone, referral_code, role = 'member', specialty, password) => {
    const response = await axiosClient.post('/auth/register', { email, fullName, phone, referral_code, role, specialty, password });
    return response.data;
  }
};

export default authApi;
