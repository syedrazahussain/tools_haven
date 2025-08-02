'use client';

import Image from 'next/image';
import styles from './header.module.css';
import logo1 from '../../public/logo1.webp';
import profile from '../../public/profile.png';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FaBars } from 'react-icons/fa';

export default function Header1() {
    const [showLocationOptions, setShowLocationOptions] = useState(false);
    const [manualLocation, setManualLocation] = useState('');
    const [userLocation, setUserLocation] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showAccountPopup, setShowAccountPopup] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    const handleCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation(`Lat: ${latitude.toFixed(3)}, Lng: ${longitude.toFixed(3)}`);
                setShowLocationOptions(false);
            },
            (error) => {
                console.error("Error getting location", error);
            }
        );
    };

    const handleManualSubmit = () => {
        if (manualLocation.trim()) {
            setUserLocation(manualLocation);
            setShowLocationOptions(false);
        }
    };

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
                setLoading(false);
            }
        };

        verifyToken();
    }, [pathname]);

    // Close account popup on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(`.${styles.account}`)) {
                setShowAccountPopup(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    if (loading) return null;

    return (
        <header className={styles.header}>
            <div className={styles.container}>

                <div className={styles.left_content}>
                    <div className={styles.logoArea}>
                        <Image src={logo1} alt="logo" width={50} height={50} />
                        <h1>Tools Haven</h1>
                    </div>

                    <button className={styles.hamburger} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <FaBars />
                    </button>
                </div>

                <div className={styles.rightMenuDesktop}>
                    <div className={styles.location} onClick={() => setShowLocationOptions(!showLocationOptions)}>
                        {userLocation || "📍 Select Location"}
                        {showLocationOptions && (
                            <div className={styles.locationPopup} onClick={(e) => e.stopPropagation()}>
                                <button onClick={handleCurrentLocation}>Use My Current Location</button>
                                <div className={styles.manualInput}>
                                    <input
                                        type="text"
                                        placeholder="Enter city or area"
                                        value={manualLocation}
                                        onChange={(e) => setManualLocation(e.target.value)}
                                    />
                                    <button onClick={handleManualSubmit}>Submit</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.account} onClick={() => setShowAccountPopup(!showAccountPopup)}>
                        <Image src={profile} alt="profile" width={35} height={35} />
                        <div
                            className={`${styles.accountPopup} ${showAccountPopup ? styles.show : ''}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isLoggedIn ? (
                                <div onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('role');
                                    setIsLoggedIn(false);
                                    router.push('/user_login');
                                }}>
                                    Logout
                                </div>
                            ) : (
                                <>
                                    <div onClick={() => router.push('/user_login')}>Login</div>
                                    <div onClick={() => router.push('/user_register')}>Signup</div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className={styles.mobileMenuWrapper}>
                        <div className={styles.location} onClick={() => setShowLocationOptions(!showLocationOptions)}>
                            {userLocation || "📍 Select Location"}
                            {showLocationOptions && (
                                <div className={styles.locationPopup} onClick={(e) => e.stopPropagation()}>
                                    <button onClick={handleCurrentLocation}>Use My Current Location</button>
                                    <div className={styles.manualInput}>
                                        <input
                                            type="text"
                                            placeholder="Enter city or area"
                                            value={manualLocation}
                                            onChange={(e) => setManualLocation(e.target.value)}
                                        />
                                        <button onClick={handleManualSubmit}>Submit</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.account} onClick={() => setShowAccountPopup(!showAccountPopup)}>
                            <Image src={profile} alt="profile" width={35} height={35} />
                            <div
                                className={`${styles.accountPopup} ${showAccountPopup ? styles.show : ''}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {isLoggedIn ? (
                                    <div onClick={() => {
                                        localStorage.removeItem('token');
                                        localStorage.removeItem('role');
                                        setIsLoggedIn(false);
                                        router.push('/user_login');
                                    }}>
                                        Logout
                                    </div>
                                ) : (
                                    <>
                                        <div onClick={() => router.push('/user_login')}>Login</div>
                                        <div onClick={() => router.push('/user_register')}>Signup</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
