'use client';

import Header from "../../../components/Header/page";
import Image from "next/image";
import styles from "./summary.module.css";
import { useSearchParams, useRouter } from "next/navigation";
import { BsCalendarDate } from "react-icons/bs";
import { LiaClipboardListSolid, LiaRupeeSignSolid } from "react-icons/lia";
import { RiScreenshot2Line } from "react-icons/ri";
import { GiConfirmed } from "react-icons/gi";
import useRoleGuard from "../../../hooks/useRoleGuard/page";
import { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";

export default function SummaryPage() {
    const authorized = useRoleGuard(['renter']);
    const searchParams = useSearchParams();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authorized !== undefined) {
            setIsLoading(false);
        }
    }, [authorized]);

    const itemid = searchParams.get("itemid") || "Itemid";
    const title = searchParams.get("title") || "Item";
    const location = searchParams.get("location") || "N/A";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const price = parseInt(searchParams.get("price") || "0", 10);
    const pickup = searchParams.get("pickup") || "N/A";
    const image = searchParams.get("image");
    const upi_id = searchParams.get("upi_id");

    const startDate = startDateParam ? new Date(startDateParam) : null;
    const endDate = endDateParam ? new Date(endDateParam) : null;

    const formattedStart = startDate?.toLocaleDateString("en-GB") || "Invalid date";
    const formattedEnd = endDate?.toLocaleDateString("en-GB") || "Invalid date";

    const rentalDays =
        startDate && endDate
            ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
            : 1;

    const subtotal = rentalDays * price;
    const pickupFee = pickup === "self" ? 0 : 40;
    const platformFee = 5;
    const total = subtotal + pickupFee + platformFee;

    const handlePayClick = async () => {
        try {
            const res = await fetch("http://localhost:5000/user/generate-qr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ upi_id: upi_id, amount: total }),
            });

            if (!res.ok) {
                throw new Error("Failed to generate QR code.");
            }

            const data = await res.json();

            const queryParams = new URLSearchParams({
                qr: data.qr,
                item_id: itemid,
                title,
                image: image || "",
                location,
                startDate: startDateParam || "",
                endDate: endDateParam || "",
                pickup,
                subtotal: subtotal.toString(),
                pickupFee: pickupFee.toString(),
                platformFee: platformFee.toString(),
                total: total.toString(),
                upi_id: upi_id || "",
            });

            router.push(`/paymentmode?${queryParams.toString()}`);
        } catch (error) {
            console.error("Payment failed:", error);
            alert("Something went wrong during payment. Please try again.");
        }
    };

    if (isLoading || !authorized) {
        return (
            <div className={styles.loading_container}>
                <FaSpinner className="animate-spin text-4xl text-gray-600 mx-auto mt-20" />
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className={styles.summary_container}>
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
                    {/* <div className={styles.step4_side_Line}></div>
                    <div className={styles.step} id={styles.step4}>
                        <i className={styles.icon}><RiScreenshot2Line /></i>
                        <h1 id={styles.heading_screenshot}>Add Screenshot</h1>

                    </div> */}
                    <div className={styles.step5_side_Line}></div>
                    <div className={styles.step} id={styles.step5}>
                        <i className={styles.icon}><GiConfirmed /></i>
                        <h1 id={styles.heading_success}>Success</h1>

                    </div>
                    <div className={styles.step6_side_Line}></div>

                </div>


                <div className={styles.summary_content_container}>
                    <div className={styles.booking_heading}>
                        <h1>Your Selected Item Summary</h1>
                    </div>

                    <div className={styles.summary_image}>
                        <Image
                            src={image ? `http://localhost:5000/uploads/${image}` : "/hammer.jpg"}
                            alt="Item image"
                            height={150}
                            width={150}
                            unoptimized
                        />
                        <div className={styles.summary_name}>
                            <h1>{title}</h1>
                            <h2>{location}</h2>
                        </div>

                        <div className={styles.price_and_date_div}>
                            <div className={styles.date_and_time}>
                                <h1>{formattedStart} to {formattedEnd}</h1>
                            </div>
                            <div className={styles.summary_price}>
                                <p>Days: {rentalDays}</p>
                                <h1>₹{price} /day</h1>
                            </div>
                        </div>
                    </div>

                    <div className={styles.subtotal}><h1>Sub Total</h1><h2>₹{subtotal}</h2></div>
                    <div className={styles.subtotal}><h1>Pickup/Delivery Charges</h1><h2>₹{pickupFee}</h2></div>
                    <div className={styles.platform}><h1>Platform Fee</h1><h2>₹{platformFee}</h2></div>
                    <div className={styles.total}><h1>Total</h1><h2>₹{total}</h2></div>

                    <div className={styles.pay_btn}>
                        <button onClick={handlePayClick}>Pay ₹{total}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
