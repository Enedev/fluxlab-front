/**
 * Custom Hook: useRedirectIfAuthenticated
 * 
 * Automatically redirects authenticated users away from login/signup pages
 * to the dashboard
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function useRedirectIfAuthenticated() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
}

export default useRedirectIfAuthenticated;
