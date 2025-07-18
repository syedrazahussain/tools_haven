"use client";
export const dynamic = 'force-dynamic';

import Header from "../../../components/Header/page";
import styles from "./screenshot.module.css";
import { BsCalendarDate } from "react-icons/bs";
import { LiaClipboardListSolid, LiaRupeeSignSolid } from "react-icons/lia";
import { RiScreenshot2Line } from "react-icons/ri";
import { GiConfirmed } from "react-icons/gi";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useRoleGuard from '../../../hooks/useRoleGuard/page';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';








export default function ScreenshotPage() {
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
      const res = await fetch("http://localhost:5000/user/bookings", {
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
        {/* Steps */}
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
