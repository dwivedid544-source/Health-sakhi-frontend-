import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from storage on app mount
  useEffect(() => {
    const restoreSession = () => {
      try {
        const token = localStorage.getItem('hs_access_token');
        const storedMember = sessionStorage.getItem('hs_current_member');
        const storedRole = sessionStorage.getItem('temp_role');

        if (token && storedMember) {
          const memberObj = JSON.parse(storedMember);
          setUser({
            id: memberObj.id,
            email: memberObj.email,
            fullName: memberObj.name,
            planBadge: memberObj.plan
          });
          setRole(storedRole);
        }
      } catch (err) {
        console.error('Error restoring auth session:', err);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const handleRewardsSwap = (userId) => {
    localStorage.removeItem('hs_reward_balance');
    localStorage.removeItem('hs_book_rewards');
    localStorage.removeItem('hs_unlocked_gifts');
    localStorage.removeItem('hs_redemptions');
    
    const backup = localStorage.getItem(`hs_rewards_backup_${userId}`);
    if (backup) {
      try {
        const parsed = JSON.parse(backup);
        if (parsed.hs_reward_balance) localStorage.setItem('hs_reward_balance', parsed.hs_reward_balance);
        if (parsed.hs_book_rewards) localStorage.setItem('hs_book_rewards', parsed.hs_book_rewards);
        if (parsed.hs_unlocked_gifts) localStorage.setItem('hs_unlocked_gifts', parsed.hs_unlocked_gifts);
        if (parsed.hs_redemptions) localStorage.setItem('hs_redemptions', parsed.hs_redemptions);
      } catch (e) {
        console.error('Failed to restore rewards', e);
      }
    }
  };

  const login = async (email, role = 'member', password) => {
    const data = await authApi.login(email, role, password);
    if (data.success && data.directLogin && data.token) {
      localStorage.setItem('hs_access_token', data.token);
      localStorage.setItem('hs_refresh_token', data.refreshToken);
      sessionStorage.setItem('hs_access_token', data.token);
      sessionStorage.setItem('hs_refresh_token', data.refreshToken);
      
      handleRewardsSwap(data.user.id);
      
      const mappedUser = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.profile.full_name,
        planBadge: data.user.profile.plan_badge
      };
      
      sessionStorage.setItem('hs_current_member', JSON.stringify({
        id: mappedUser.id,
        name: mappedUser.fullName,
        email: mappedUser.email,
        plan: mappedUser.planBadge
      }));
      sessionStorage.setItem('temp_role', data.role);
      
      setUser(mappedUser);
      setRole(data.role);
    }
    return data;
  };

  const verifyOtp = async (email, otp) => {
    const data = await authApi.verifyOtp(email, otp);
    
    if (data.success && data.token) {
      localStorage.setItem('hs_access_token', data.token);
      localStorage.setItem('hs_refresh_token', data.refreshToken);
      sessionStorage.setItem('hs_access_token', data.token);
      sessionStorage.setItem('hs_refresh_token', data.refreshToken);
      
      handleRewardsSwap(data.user.id);
      
      const mappedUser = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.profile.full_name,
        planBadge: data.user.profile.plan_badge
      };
      
      // Keep sessionStorage updated to support compatibility with existing pages
      sessionStorage.setItem('hs_current_member', JSON.stringify({
        id: mappedUser.id,
        name: mappedUser.fullName,
        email: mappedUser.email,
        plan: mappedUser.planBadge
      }));
      sessionStorage.setItem('temp_role', data.role);
      
      setUser(mappedUser);
      setRole(data.role);
    }
    
    return data;
  };

  const logout = async () => {
    try {
      if (user?.id) {
        const userRewards = {
          hs_reward_balance: localStorage.getItem('hs_reward_balance'),
          hs_book_rewards: localStorage.getItem('hs_book_rewards'),
          hs_unlocked_gifts: localStorage.getItem('hs_unlocked_gifts'),
          hs_redemptions: localStorage.getItem('hs_redemptions')
        };
        localStorage.setItem(`hs_rewards_backup_${user.id}`, JSON.stringify(userRewards));
      }

      const refreshToken = localStorage.getItem('hs_refresh_token');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout API failure:', err);
    } finally {
      // Clear all auth flags and state
      localStorage.removeItem('hs_access_token');
      localStorage.removeItem('hs_refresh_token');
      sessionStorage.removeItem('hs_access_token');
      sessionStorage.removeItem('hs_refresh_token');
      localStorage.removeItem('hs_reward_balance');
      localStorage.removeItem('hs_book_rewards');
      localStorage.removeItem('hs_unlocked_gifts');
      localStorage.removeItem('hs_redemptions');
      sessionStorage.removeItem('hs_current_member');
      sessionStorage.removeItem('temp_role');
      setUser(null);
      setRole(null);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, role, loading, isAuthenticated, login, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
