export const checkAuth = async () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return { isAuth: false, role: null };

  try {
    const res = await fetch('http://localhost:5000/auth/is_verify', {
      headers: { token },
    });

    const isVerified = await res.json();
    return { isAuth: isVerified === true, role };
  } catch (err) {
    console.error('Auth check failed:', err);
    return { isAuth: false, role: null };
  }
};
