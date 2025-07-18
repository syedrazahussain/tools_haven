'use client';
import { useRouter } from 'next/navigation';
import styles from './unauthorized.module.css';

export default function Unauthorized() {
  const router = useRouter();

  const handleRedirect = () => {
    router.push('/user_login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.heading}>🚫 Access Denied</h1>
        <p className={styles.text}>
          You are not authorized to view this page.
          Please login as per your role
        </p>
        
        <button className={styles.button} onClick={handleRedirect}>
          Go to Login
        </button>
      </div>
    </div>
  );
}
