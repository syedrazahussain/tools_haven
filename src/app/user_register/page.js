'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './user_register.module.css';
import toast, { Toaster } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function User_register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'renter'
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        toast.success('User registered successfully!');
        router.push('/user_login')
      } else {
        toast.error(data.error || 'Registration failed.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong!');
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
            <h1>Register / Signup</h1>
          </div>

          <div className={styles.input_field}>
            <label>Name:</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
          </div>

          <div className={styles.input_field}>
            <label>Phone:</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>

          <div className={styles.input_field}>
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className={styles.input_field}>
            <label>Password:</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          <div className={styles.input_field}>
            <label>Confirm Password:</label>
            <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} required />
          </div>

          <div className={styles.input_field}>
            <label>Account Type:</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="renter">Renter</option>
              <option value="toolsmaster">Toolsmaster</option>
            </select>
          </div>

          <div className={styles.have_account}>
            <h1>
              Already have an account?{' '}
              <Link className={styles.login_link_color} href="/user_login">Login</Link>
            </h1>
          </div>

          <div className={styles.register_btn}>
            <button type="submit" disabled={loading}>
              {loading ? <FaSpinner className="animate-spin" /> : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
