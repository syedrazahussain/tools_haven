"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./qr_payment.module.css";
import Header from "../../../components/Header/page";
import { BsCalendarDate } from "react-icons/bs";
import { LiaClipboardListSolid, LiaRupeeSignSolid } from "react-icons/lia";
import { RiScreenshot2Line } from "react-icons/ri";
import { GiConfirmed } from "react-icons/gi";
import useRoleGuard from "../../../hooks/useRoleGuard/page";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function QRPayment() {
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

                <div className={styles.two_div}>
                    <div className={styles.scanner_cards}>
                        <h1>Scan to Pay</h1>
                        <img src={qr} alt="QR Code" className={styles.qrImage} />
                        <p>Time remaining: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</p>

                        <button className={styles.doneBtn} onClick={handlePaymentDone} disabled={loading}>
                            {loading ? <span className={styles.spinner}></span> : "I have paid"}
                        </button>
                    </div>

                    <div className={styles.note}>
                        <p>
                            Thank you for initiating the payment. Please read the following carefully: <br /><br />
                            ✅ After clicking "I have paid", the system will now attempt to verify your payment. <br />
                            📸 A payment confirmation screen or receipt will be requested next. <br /><br />
                            You may need to upload a screenshot of your payment. <br />
                            This helps us verify your transaction manually or through our system. <br /><br />
                            ⚠️ Do not refresh or close this page until your payment has been verified. <br />
                            ❌ If no confirmation is received, or if the screenshot is not uploaded: <br /><br />
                            Your payment will not be verified. <br />
                            Your booking will not be confirmed. <br /><br />
                            🕒 If verification fails or times out: <br />
                            You’ll be redirected to a “Payment Failed” page. <br />
                            You can try again from your Order Details section. <br />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
