"use client";

import styles from './cod_success.module.css';
import { BsCalendarDate } from "react-icons/bs";
import { LiaClipboardListSolid, LiaRupeeSignSolid } from "react-icons/lia";
import { RiScreenshot2Line } from "react-icons/ri";
import { GiConfirmed } from "react-icons/gi";
import { FaHome } from "react-icons/fa";
import { useRouter } from "next/navigation";
import useRoleGuard from '../../../hooks/useRoleGuard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';


const steps = [
    { id: 1, className: 'step11', label: 'Date & Delivery', icon: <BsCalendarDate /> },

    { id: 2, className: 'step2', label: 'Summary', icon: <LiaClipboardListSolid /> },
    { id: 3, className: 'step3', label: 'Payment', icon: <LiaRupeeSignSolid /> },
    // { id: 4, label: 'Add Screenshot', icon: <RiScreenshot2Line /> },
     { id: 5, className: 'step5', label: 'Success', icon: <GiConfirmed /> },
];


export default function CashOnDeliverySuccess({ currentStep }) {
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

             <div className={styles.stepTracker}>
                    {steps.map((step, index) => {
                        const isCompleted = currentStep > step.id;
                        const isCurrent = currentStep === step.id;
                        const isUpcoming = currentStep < step.id;

                        const showLeftLine = index !== 0;
                        const showRightLine = index !== steps.length - 1;

                        return (
                            <div className={styles.stepItem} key={step.id}>
                                {/* Left Line */}
                                {showLeftLine && (
                                    <div
                                        className={`${styles.stepLine} ${styles.leftLine} ${isCompleted ? styles.lineActive : styles.lineInactive
                                            }`}
                                    />
                                )}

                                {/* Step Circle */}
                                <div
                                    className={`${styles.stepCircle} ${styles[step.className]} ${isCompleted
                                        ? styles.completed
                                        : isCurrent
                                            ? styles.current
                                            : styles.upcoming}`}
                                >
                                    <span className={styles.icon}>{step.icon}</span>
                                </div>


                                {/* Step Label */}
                                <div
                                    className={`${styles.stepLabel} ${step.className ? styles[step.className] : ''} ${currentStep >= step.id ? styles.labelActive : styles.labelInactive}`}
                                >
                                    {step.label}
                                </div>


                                {showRightLine && (
                                    <div
                                        className={`${styles.stepLine} ${styles.rightLine} ${isCompleted || isCurrent ? styles.lineActive : styles.lineInactive
                                            }`}
                                    />
                                )}

                            </div>
                        );
                    })}
                </div>


            {/* Confirmation Card */}
            <div className={styles.card}>
                <h1>✅ Order Placed Successfully!</h1>
                <p>Your order has been successfully booked with <strong>Cash on Delivery</strong>.</p>
                <p>Please keep the payment ready at the time of delivery. 📦</p>
                <p>You can view your order details and status in your dashboard.</p>

                <div className={styles.home_btn}>
                    <button onClick={goToHome} disabled={loading}>
                        {loading ? <span className={styles.spinner}></span> : <>Go To Home Page <i><FaHome /></i></>}
                    </button>
                </div>
            </div>
        </div>
    );
}
