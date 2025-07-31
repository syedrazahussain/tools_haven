'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useRoleGuard(allowedRoles = []) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // ✅ Only run on client
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (!token || !allowedRoles.includes(role)) {
        router.replace('/unauthorized');
      } else {
        setAuthorized(true);
      }
    }
  }, [allowedRoles, router]);

  return authorized;
}
