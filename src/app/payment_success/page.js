"use client";

import styles from './paymentSuccess.module.css';
import { BsCalendarDate } from "react-icons/bs";
import { LiaClipboardListSolid, LiaRupeeSignSolid } from "react-icons/lia";
import { RiScreenshot2Line } from "react-icons/ri";
import { GiConfirmed } from "react-icons/gi";
import { FaHome } from "react-icons/fa";
import { useRouter } from "next/navigation";
import useRoleGuard from '../../../hooks/useRoleGuard/page';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';

export default function PaymentSuccess() {
    useRoleGuard(['renter']);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const goToHome = () => {
        setLoading(true);
        toast.success("Redirecting to homepage...");
        setTimeout(() => {
            router.push("/");
        }, 1500);
    };

    return (
        <div className={styles.container}>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className={styles.step_line_div}>
                <div className={styles.step1_side_line}></div>
                <div className={styles.step} id={styles.step1}>
                    <i className={styles.icon}><BsCalendarDate /></i>
                    <h1 className={styles.heading}>Date & Delivery</h1>
                </div>
                <div className={styles.step2_side_Line}></div>
                <div className={styles.step} id={styles.step2}>
                    <i className={styles.icon}><LiaClipboardListSolid /></i>
                    <h1 id={styles.heading_summary}>Summary</h1>
                </div>
                <div className={styles.step3_side_Line}></div>
                <div className={styles.step} id={styles.step3}>
                    <i className={styles.icon}><LiaRupeeSignSolid /></i>
                    <h1 id={styles.heading_payment}>Payment</h1>
                </div>
                <div className={styles.step4_side_Line}></div>
                <div className={styles.step} id={styles.step4}>
                    <i className={styles.icon}><RiScreenshot2Line /></i>
                    <h1 id={styles.heading_screenshot}>Add Screenshot</h1>
                </div>
                <div className={styles.step5_side_Line}></div>
                <div className={styles.step} id={styles.step5}>
                    <i className={styles.icon}><GiConfirmed /></i>
                    <h1 id={styles.heading_success}>Success</h1>
                </div>
                <div className={styles.step6_side_Line}></div>
            </div>

            <div className={styles.card}>
                <h1>✅ Booked Successful!</h1>
                <p>Your tool has been booked. 🎉</p>
                <p>Your payment is currently <strong>pending</strong> until manually confirmed by admin.</p>
                <p>Please be patient and check the status in your dashboard.</p>

                <div className={styles.home_btn}>
                    <button onClick={goToHome} disabled={loading}>
                        {loading ? <span className={styles.spinner}></span> : <>Go To Home Page <i><FaHome /></i></>}
                    </button>
                </div>
            </div>
        </div>
    );
}
