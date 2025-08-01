"use client";

import Header from "../../../../components/Header/page";
import styles from '../order_details.module.css';
import { FaCheckCircle, FaTruck, FaUndo, FaTimesCircle } from 'react-icons/fa';
import { MdPending } from "react-icons/md";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useRoleGuard from '../../../../hooks/useRoleGuard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';

export default function OrderDetails() {
    useRoleGuard(['renter']);
    const { booking_id } = useParams();
    const [details, setDetails] = useState(null);

    useEffect(() => {
        let timeoutId;

        const fetchDetails = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/order_details/${booking_id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });

                const data = await response.json();
                let status = "payment_pending";

                if (data.cancelled) {
                    status = "cancelled";
                } else if (data.payment_status === "reject") {
                    status = "payment_rejected";
                } else if (data.payment_status === "success") {
                    status = "order_confirmed";

                    if (data.delivery_status === "delivered") {
                        status = "item_delivered";

                        if (data.item_returned === "returned") {
                            status = "item_returned";

                            if (data.order_closed === "t" || data.order_closed === true) {
                                status = "closed";
                            } else {
                                timeoutId = setTimeout(async () => {
                                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/close_order/${booking_id}`, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Authorization: `Bearer ${localStorage.getItem("token")}`
                                        }
                                    });

                                    if (res.ok) {
                                        setDetails(prev => ({
                                            ...prev,
                                            order_closed: true,
                                            status: "closed"
                                        }));
                                    }
                                }, 90000);
                            }
                        }
                    }
                }

                data.status = status;
                setDetails(data);
            } catch (err) {
                console.error("Error while fetching order details", err.message);
                toast.error("Failed to load order details.");
            }
        };

        fetchDetails();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [booking_id]);

    const handleCancel = async () => {
        const confirmCancel = confirm("Are you sure you want to cancel this booking?");
        if (!confirmCancel) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/cancel_booking/${booking_id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Booking cancelled successfully");
                setDetails(prev => ({
                    ...prev,
                    cancelled: true,
                    status: 'cancelled'
                }));
            } else {
                toast.error(data.error || "Failed to cancel booking");
            }
        } catch (err) {
            console.error("Cancel booking error:", err.message);
            toast.error("Something went wrong while cancelling the booking.");
        }
    };

    if (!details) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <ClipLoader color="#36d7b7" size={60} />
                <ToastContainer position="top-center" autoClose={3000} />
            </div>
        );
    }

    const statusLabels = {
        payment_pending: "Payment Pending",
        payment_rejected: "Payment Rejected",
        order_confirmed: "Order Confirmed",
        item_delivered: "Item Delivered",
        item_returned: "Item Returned",
        closed: "Closed",
        cancelled: "Cancelled"
    };

    const orderStages = details.status === "cancelled"
        ? ['payment_pending', 'cancelled']
        : ['payment_pending', 'order_confirmed', 'item_delivered', 'item_returned', 'closed'];

    const getStageStatus = (stage) => {
        const currentIndex = orderStages.indexOf(details.status);
        const stageIndex = orderStages.indexOf(stage);
        return currentIndex >= stageIndex && currentIndex !== -1;
    };

    const getProgressPercent = (status) => {
        const index = orderStages.indexOf(status);
        const total = orderStages.length - 1;
        return index >= 0 ? (index / total) * 100 : 0;
    };

    return (
        <div>
            <Header />
            <ToastContainer position="top-center" autoClose={3000} />
            <div className={styles.order_details_main_container}>
                <div className={styles.order_container}>
                    <div className={styles.first_container}>
                        <div className={styles.Id_and_image}>
                            <div className={styles.booking_id}>
                                <h1>Booking Id : {details.booking_id}</h1>
                            </div>
                            <div className={styles.image_and_title}>
                                <div className={styles.image}>
                                    <img src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${details.image1}`} width={200} />
                                </div>
                                <div className={styles.current_and_title}>
                                    <div className={styles.current_stage_heading}>
                                        <h1>Current Status: {statusLabels[details.status]}</h1>
                                    </div>
                                    <div className={styles.item_title}>
                                        <h1>{details.title}</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.price_and_cancel_div}>
                            <div className={styles.price}>₹{details.total_price}</div>
                            {["payment_pending", "order_confirmed"].includes(details.status) && (
                                <div className={styles.cancel_container}>
                                    <div className={styles.cancel_btn} onClick={handleCancel}>
                                        <FaTimesCircle className={` ${styles.rejected}`} />
                                        <h1>Cancel Item</h1>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.tracking_div}>
                        <div className={styles.line_div}>
                            <div className={styles.progress_track}>
                                <div
                                    className={`${styles.progress_fill} ${['payment_rejected', 'cancelled'].includes(details.status) ? styles.progress_fill_rejected : details.status === 'payment_pending' ? styles.progress_fill_pending : styles.progress_fill_success}`}
                                    style={{
                                        width: ['payment_rejected', 'cancelled'].includes(details.status)
                                            ? '100%'
                                            : details.status === 'payment_pending'
                                                ? '10%'
                                                : `${getProgressPercent(details.status)}%`
                                    }}
                                ></div>
                            </div>

                            <div className={styles.stages}>
                                <div className={styles.stage}>
                                    {details.status === "payment_rejected" || details.status === "cancelled" ? (
                                        <>
                                            <FaTimesCircle className={`${styles.icon} ${styles.rejected}`} />
                                            <div className={styles.label}>{statusLabels[details.status]}</div>
                                        </>
                                    ) : details.payment_status === "success" ? (
                                        <>
                                            <FaCheckCircle className={`${styles.icon} ${styles.active}`} />
                                            <div className={styles.label}>Payment Success</div>
                                        </>
                                    ) : (
                                        <>
                                            <MdPending className={`${styles.icon} ${styles.pending}`} />
                                            <div className={styles.label}>Payment Pending</div>
                                        </>
                                    )}
                                </div>

                                {details.status !== "cancelled" && details.status !== "payment_rejected" && (
                                    <>
                                        <div className={styles.stage}>
                                            <FaCheckCircle className={`${styles.icon} ${getStageStatus('order_confirmed') ? styles.active : ''}`} />
                                            <div className={styles.label}>Order Confirmed</div>
                                        </div>
                                        <div className={styles.stage}>
                                            <FaTruck className={`${styles.icon} ${getStageStatus('item_delivered') ? styles.active : ''}`} />
                                            <div className={styles.label}>Item Delivered</div>
                                        </div>
                                        <div className={styles.stage}>
                                            <FaUndo className={`${styles.icon} ${getStageStatus('item_returned') ? styles.active : ''}`} />
                                            <div className={styles.label}>Item Returned</div>
                                        </div>
                                        <div className={styles.stage}>
                                            <IoIosCloseCircleOutline className={`${styles.icon} ${getStageStatus('closed') ? styles.active : ''}`} />
                                            <div className={styles.label}>Closed</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.booking_details}>
                        <div className={styles.booking_heading}>
                            <h1>Booking Details</h1>
                        </div>
                        <div className={styles.delivery_date}>
                            <div className={styles.date}>
                                <h1>Start Date:</h1>
                                <h2>{new Date(details.start_date).toLocaleDateString()}</h2>
                            </div>
                            <div className={styles.date}>
                                <h1>End Date:</h1>
                                <h2>{new Date(details.end_date).toLocaleDateString()}</h2>
                            </div>
                            <div className={styles.date}>
                                <h1>Booking Date:</h1>
                                <h2>{new Date(details.created_at).toLocaleString()}</h2>
                            </div>
                        </div>
                    </div>

                    <div className={styles.payment_details_div}>
                        <div className={styles.payment_heading}>
                            <h1>Payment Details</h1>
                        </div>
                        <div className={styles.subtotal}>
                            <h1>Payment Mode</h1>
                            <h2>{details.payment_mode}</h2>
                        </div>
                        <div className={styles.subtotal}>
                            <h1>Transaction id </h1>
                            <h2>{details.transaction_id}</h2>
                        </div>
                        <div className={styles.subtotal}>
                            <h1>Sub Total</h1>
                            <h2>₹{details.subtotal}</h2>
                        </div>
                        <div className={styles.subtotal}>
                            <h1>Pickup/Delivery Charges</h1>
                            <h2>₹{details.pickupfee}</h2>
                        </div>
                        <div className={styles.platform}>
                            <h1>Platform Fee</h1>
                            <h2>₹{details.platformfee}</h2>
                        </div>
                        <div className={styles.total}>
                            <h1>Total</h1>
                            <h1>₹{details.total_price}</h1>
                        </div>
                    </div>

                    <div className={styles.delivery_type}>
                        <div className={styles.delivery_type_heading}>
                            <h1>Delivery/Pickup Details</h1>
                        </div>
                        <div className={styles.platform}>
                            <h1>Delivery/Pickup Type</h1>
                            <h2>{details.delivery_type}</h2>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}
