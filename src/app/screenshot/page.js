"use client";
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'edge'; 


import Header from "../../../components/Header/page";
import styles from "./screenshot.module.css";
import { BsCalendarDate } from "react-icons/bs";
import { LiaClipboardListSolid, LiaRupeeSignSolid } from "react-icons/lia";
import { RiScreenshot2Line } from "react-icons/ri";
import { GiConfirmed } from "react-icons/gi";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useRoleGuard from '../../../hooks/useRoleGuard';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';







const steps = [
    { id: 1, className: 'step11', label: 'Date & Delivery', icon: <BsCalendarDate /> },

    { id: 2, className: 'step2', label: 'Summary', icon: <LiaClipboardListSolid /> },
    { id: 3, className: 'step3', label: 'Payment', icon: <LiaRupeeSignSolid /> },
     { id: 4, className: 'step4',  label: 'Add Screenshot', icon: <RiScreenshot2Line /> },
     { id: 5, className: 'step5', label: 'Success', icon: <GiConfirmed /> },
];


export default function ScreenshotPage({ currentStep }) {
  useRoleGuard(['renter']);


  const [screenshot, setScreenshot] = useState(null);
  const [order_closed, setorder_closed] = useState(false);
  const [preview, setPreview] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  


  const item_id = searchParams.get("item_id");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const pickup = searchParams.get("pickup");
  const subtotal = searchParams.get("subtotal");
  const pickupFee = searchParams.get("pickupFee");
  const platformFee = searchParams.get("platformFee");
  const total = searchParams.get("total");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!screenshot) {
      toast.error("Upload screenshot!");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("screenshot", screenshot);
    data.append("transaction_id", transactionId);
    data.append("item_id", item_id);
    data.append("start_date", startDate);
    data.append("end_date", endDate);
    data.append("delivery_type", pickup);
    data.append("subtotal", subtotal);
    data.append("pickupFee", pickupFee);
    data.append("platformFee", platformFee);
    data.append("total_price", total);
    data.append("order_closed", order_closed);
    data.append("payment_mode", "UPI")
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/bookings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: data,
      });

      if (res.ok) {
        
        toast.success("Your Tool Is Successfully Booked");
        setTimeout(() => {
          router.push("/payment_success");
        }, 2000);
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className={styles.screenshot_main_container}>
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

        {/* Form */}
        <div className={styles.form_container}>
          <form onSubmit={handleSubmit} className={styles.form} encType="multipart/form-data">
            <h2>Upload Payment Proof</h2>

            <label>Upload Screenshot *</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => {
                const file = e.target.files[0];
                setScreenshot(file);
                setPreview(URL.createObjectURL(file));
              }}
            />

            {/* Image Preview */}
            {preview && (
              <div style={{ marginTop: "1rem", textAlign: "center" }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
              </div>
            )}

            <label>Transaction ID / UPI Ref No</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />

            <button type="submit" disabled={loading}>
              {loading ? (
                <span className={styles.spinner}></span>
              ) : (
                "Submit"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
