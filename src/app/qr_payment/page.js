"use client";
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'edge'; 

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./qr_payment.module.css";
import Header from "../../../components/Header/page";
import { BsCalendarDate } from "react-icons/bs";
import { LiaClipboardListSolid, LiaRupeeSignSolid } from "react-icons/lia";
import { RiScreenshot2Line } from "react-icons/ri";
import { GiConfirmed } from "react-icons/gi";
import useRoleGuard from "../../../hooks/useRoleGuard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const steps = [
    { id: 1, className: 'step11', label: 'Date & Delivery', icon: <BsCalendarDate /> },

    { id: 2, className: 'step2', label: 'Summary', icon: <LiaClipboardListSolid /> },
    { id: 3, className: 'step3', label: 'Payment', icon: <LiaRupeeSignSolid /> },
     { id: 4, label: 'Add Screenshot', icon: <RiScreenshot2Line /> },
     { id: 5, className: 'step5', label: 'Success', icon: <GiConfirmed /> },
];


export default function QRPayment({ currentStep }) {
    useRoleGuard(["renter"]);
    const searchParams = useSearchParams();
    const router = useRouter();

    const qr = searchParams.get("qr");
    const itemid = searchParams.get("item_id");
    const title = searchParams.get("title");
    const image = searchParams.get("image");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const location = searchParams.get("location");
    const pickup = searchParams.get("pickup");
    const subtotal = searchParams.get("subtotal");
    const pickupFee = searchParams.get("pickupFee");
    const platformFee = searchParams.get("platformFee");
    const total = searchParams.get("total");

    const [timer, setTimer] = useState(300); // 5 minutes
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    router.push("/payment_failed");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [router]);

    const handlePaymentDone = async () => {
        try {
            setLoading(true);

            const queryParams = new URLSearchParams({
                item_id: itemid || "",
                startDate: startDate || "",
                endDate: endDate || "",
                pickup: pickup || "",
                subtotal: subtotal || "0",
                pickupFee: pickupFee || "0",
                platformFee: platformFee || "0",
                total: total || "0",
                title: title || "",
                location: location || "",
                image: image || "",
            });

            toast.info("Redirecting to upload screenshot...");
            setTimeout(() => {
                router.push(`/screenshot?${queryParams.toString()}`);
            }, 1500);
        } catch (error) {
            toast.error("Error during redirection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className={styles.container}>
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

                <div className={styles.two_div}>
                    <div className={styles.scanner_cards}>
                        <h1>Scan to Pay</h1>
                        {qr ? (
                            <Image
                                src={qr}
                                alt="QR Code"
                                className={styles.qrImage}
                                width={300}
                                height={300}
                                priority
                            />
                        ) : (
                            <p>QR code not found.</p>
                        )}
                        <p>Time remaining: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</p>

                        <button className={styles.doneBtn} onClick={handlePaymentDone} disabled={loading}>
                            {loading ? <span className={styles.spinner}></span> : "I have paid"}
                        </button>
                    </div>

                    <div className={styles.note}>
                        <p>
                            Thank you for initiating the payment. Please read the following carefully: <br /><br />
                            ✅ After clicking &quot;I have paid&quot;, the system will attempt to verify your payment. <br />
                            📸 A payment confirmation screen or receipt will be requested next. <br /><br />
                            You may need to upload a screenshot of your payment. <br />
                            This helps us verify your transaction manually or through our system. <br /><br />
                            ⚠️ Do not refresh or close this page until your payment has been verified. <br />
                            ❌ If no confirmation is received, or if the screenshot is not uploaded: <br /><br />
                            Your payment will not be verified. <br />
                            Your booking will not be confirmed. <br /><br />
                            🕒 If verification fails or times out: <br />
                            You&apos;ll be redirected to a &quot;Payment Failed&quot; page. <br />
                            You can try again from your Order Details section. <br />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
