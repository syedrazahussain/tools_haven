'use client';

import Header from '../../../components/Header/page';
import styles from './my_order.module.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useRoleGuard from '../../../hooks/useRoleGuard';
import toast, { Toaster } from 'react-hot-toast';

export default function MyOrder() {
    useRoleGuard(['renter']);
    const [order, setOrder] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/my_order`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(errText || 'Failed to fetch orders');
                }

                const data = await response.json();
                if (Array.isArray(data)) {
                    setOrder(data);
                    if (data.length === 0) {
                        toast('You have no orders yet.');
                    }
                } else {
                    toast.error("Unexpected response from server.");
                    setOrder([]);
                }
            } catch (err) {
                console.error('Error fetching orders:', err);
                toast.error('Failed to fetch orders.');
                setOrder([]);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusInfo = (ord) => {
        const normalizeBool = (val) =>
            val === true || val === 'true' || val === 't' || val === 'T' || val === 1 || val === '1';

        if (normalizeBool(ord.cancelled)) {
            return { label: '❌ Cancelled', style: styles.cancelled };
        }

        if (ord.payment_status === 'pending') {
            return { label: '⌛ Payment Pending', style: styles.pending };
        }

        if (ord.payment_status === 'reject') {
            return { label: '❌ Payment Rejected', style: styles.cancelled };
        }

        if (normalizeBool(ord.order_closed)) {
            return { label: '✅ Closed', style: styles.closed };
        }

        if (ord.item_returned === 'returned' && ord.delivery_status === 'delivered') {
            return { label: '🔁 Returned', style: styles.returned };
        }

        if (ord.delivery_status === 'delivered' && ord.payment_status === 'success') {
            return { label: '🚚 Delivered', style: styles.delivered };
        }

        if (ord.payment_status === 'success') {
            return { label: '💰 Booked', style: styles.booked };
        }

        return { label: '⏳ Pending', style: styles.pending };
    };

    return (
        <div>
            <Header />
            <Toaster position="top-center" />

            <div className={styles.my_order_main_container}>
                {loading ? (
                    <div className={styles.spinner_container}>
                        <div className={styles.spinner}></div>
                    </div>
                ) : (
                    <div className={styles.order_card_container}>
                        {order.map((ord, key) => {
                            const { label, style } = getStatusInfo(ord);
                            return (
                                <div className={`${styles.card} ${style}`} key={key}>
                                    <div className={styles.image}>
                                        <div className={styles.Booking_time}>
                                            Booking Date: {new Date(ord.created_at).toLocaleString()}
                                        </div>
                                        <Image

                                            

                                            src={
                                                ord.image1.startsWith("http")
                                                    ? ord.image1
                                                    : `/uploads/${ord.image1}`
                                            }
                                            alt="item image"
                                            height={100}
                                            width={100}
                                        />
                                    </div>

                                    <div className={styles.title_side}>
                                        <div className={styles.status_title}>
                                            <h1>Booking ID: {ord.booking_id}</h1>
                                            <span className={`${styles.status} ${style}`}>{label}</span>
                                        </div>
                                        <div className={styles.item_title}>
                                            <h1>Item ID: {ord.item_id}</h1>
                                        </div>
                                    </div>

                                    <div className={styles.item_name}>
                                        <h1>{ord.title || 'Item Name'}</h1>
                                    </div>

                                    <div className={styles.view_details}>
                                        <button onClick={() => router.push(`/order_details/${ord.booking_id}`)}>View Details</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
