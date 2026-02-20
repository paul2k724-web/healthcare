import { useState, useEffect } from 'react';

type UserRole = 'customer' | 'provider' | 'admin';

export function useAuth() {
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('demo_role') as UserRole) || 'customer';
  });

  const [user] = useState({
    id: '1',
    name: 'Demo User',
    email: 'user@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
  });

  useEffect(() => {
    localStorage.setItem('demo_role', role);
  }, [role]);

  return {
    user,
    role,
    setRole,
    isCustomer: role === 'customer',
    isProvider: role === 'provider',
    isAdmin: role === 'admin'
  };
}
