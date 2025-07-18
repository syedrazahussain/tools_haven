'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './user_login.module.css';
import toast, { Toaster } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';

export default function User_login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'renter'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:5000/auth/is_verify', {
          headers: { token },
        });

        const isVerified = await res.json();
        if (res.ok && isVerified === true) {
          router.replace(role === 'toolsmaster' ? '/toolsmaster_dashboard' : '/');
        }
      } catch (error) {
        console.error('Token verification failed', error);
      }
    };

    checkAuth();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        toast.success('Login successful!');

        router.push(data.role === 'toolsmaster' ? '/toolsmaster_dashboard' : '/');
      } else {
        toast.error(data.error || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Fetch failed:', error);
      toast.error('Server not responding. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.main_login_container}>
      <Toaster position="top-center" reverseOrder={false} />

      <div className={styles.form_container}>
        <form onSubmit={handleSubmit}>
          <div className={styles.heading}>
            <h1>User Login</h1>
          </div>

          <div className={styles.input_field}>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.input_field}>
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.input_field}>
            <label htmlFor="role">Login As:</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange}>
              <option value="renter">Renter</option>
              <option value="toolsmaster">Tools Master</option>
            </select>
          </div>

          <div className={styles.have_account}>
            <h1>
              Don&apos;t have an account?{' '}
              <Link className={styles.user_login_color} href="/user_register">
                Register
              </Link>
            </h1>

          </div>

          <div className={styles.register_btn}>
            <button type="submit" disabled={loading}>
              {loading ? <FaSpinner className={styles.spinner} /> : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
