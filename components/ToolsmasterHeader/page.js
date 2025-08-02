'use client';
import Image from 'next/image';
import styles from './toolsmasterheader.module.css';
import logo1 from '../../public/logo1.webp';
import profile from '../../public/profile.png';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true); // ✅ Track verification status
    const router = useRouter();
    const pathname = usePathname();

    const isProtectedRoute = (path) => {
        const publicRoutes = ['/user_login', '/user_register'];
        return !publicRoutes.includes(path);
    };

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoggedIn(false);
                setLoading(false);
                if (isProtectedRoute(pathname)) {
                    router.push('/user_login');
                }
                return;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/is_verify`, {
                    method: 'GET',
                    headers: {
                        token: token
                    }
                });

                const result = await response.json();

                if (response.ok && result === true) {
                    setIsLoggedIn(true);

                     
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    setIsLoggedIn(false);
                    if (isProtectedRoute(pathname)) {
                        router.push('/user_login');
                    }
                }
            } catch (err) {
                console.error("Error verifying token", err);
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                setIsLoggedIn(false);
                if (isProtectedRoute(pathname)) {
                    router.push('/user_login');
                }
            } finally {
                setLoading(false); // ✅ Done verifying
            }
        };

        verifyToken();
    }, [pathname]);

    // ✅ Wait until verification completes
    if (loading) return null;


    return (
        <div className={styles.main_header_container}>
            <div className={styles.left_container}>
                <Image src={logo1} alt='logo' height={60} width={60} />
                <h1>Tools Master Panel </h1>
            </div>

            <div className={styles.right_container}>


                <div className={styles.block_div}>
                    <Image src={profile} alt='profile' height={40} width={40} />
                    <div className={styles.accounts_popup}>
                        {isLoggedIn ? (
                            <div
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('role');
                                    setIsLoggedIn(false);
                                    router.push('/user_login');
                                }}
                            >
                                Logout
                            </div>
                        ) : (
                            <>
                                <div className={styles.login} onClick={() => router.push('/user_login')}>
                                    Login
                                </div>
                                <div className={styles.signup} onClick={() => router.push('/user_register')}>
                                    Signup
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
