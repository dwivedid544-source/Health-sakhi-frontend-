import axiosClient from './axiosClient';

const affiliateApi = {
  // Retrieve affiliate profile and dashboard statistics
  getDashboard: async () => {
    const response = await axiosClient.get('/affiliate/dashboard');
    return response.data;
  },

  // Onboard user as an affiliate
  register: async (website_url, payment_details) => {
    const response = await axiosClient.post('/affiliate/register', {
      website_url,
      payment_details,
    });
    return response.data;
  },

  // Create custom referral link
  createLink: async (unique_slug, target_url) => {
    const response = await axiosClient.post('/affiliate/links', {
      unique_slug,
      target_url,
    });
    return response.data;
  },

  // Get custom referral links
  getLinks: async () => {
    const response = await axiosClient.get('/affiliate/links');
    return response.data;
  },

  // Get referrals history list
  getReferrals: async () => {
    const response = await axiosClient.get('/affiliate/referrals');
    return response.data;
  },

  // Get commissions list
  getCommissions: async () => {
    const response = await axiosClient.get('/affiliate/commissions');
    return response.data;
  },

  // Submit payout request
  requestPayout: async (amount, payout_method) => {
    const response = await axiosClient.post('/affiliate/payouts', {
      amount: parseFloat(amount),
      payout_method,
    });
    return response.data;
  },

  // Get payout requests history
  getPayouts: async () => {
    const response = await axiosClient.get('/affiliate/payouts');
    return response.data;
  },

  // Get referral link for invite
  getReferralLink: async () => {
    const response = await axiosClient.get('/affiliate/referral-link');
    return response.data;
  },
};

export default affiliateApi;
