"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from './paymentFailed.module.css';
import useRoleGuard from '../../../hooks/useRoleGuard';

export default function PaymentFailed() {
    useRoleGuard(['renter']);
    const router = useRouter();


    useEffect(() => {
        const timer = setTimeout(() => {


            const returnUrl = `/`;

            router.push(returnUrl);
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1>❌ QR Code Expired</h1>
                <p>Please try booking again. Redirecting shortly...</p>
            </div>
        </div>
    );
}
