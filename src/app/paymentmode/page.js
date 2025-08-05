'use client';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'edge';

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, IndianRupee, Wallet } from 'lucide-react';
import useRoleGuard from '../../../hooks/useRoleGuard';

import { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import styles from './paymentmode.module.css';
import toast, { Toaster } from 'react-hot-toast';
import Header1 from '../../../components/Header/page';
import { BsCalendarDate } from "react-icons/bs";
import { LiaClipboardListSolid, LiaRupeeSignSolid } from "react-icons/lia";
import { RiScreenshot2Line } from "react-icons/ri";
import { GiConfirmed } from "react-icons/gi";

const steps = [
    { id: 1, className: 'step11', label: 'Date & Delivery', icon: <BsCalendarDate /> },

    { id: 2, className: 'step2', label: 'Summary', icon: <LiaClipboardListSolid /> },
    { id: 3, className: 'step3', label: 'Payment', icon: <LiaRupeeSignSolid /> },
    // { id: 4, label: 'Add Screenshot', icon: <RiScreenshot2Line /> },
    { id: 5, label: 'Success', icon: <GiConfirmed /> },
];


export default function PaymentMode({ currentStep }) {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const authorized = useRoleGuard(['renter']);
    const searchParams = useSearchParams();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [missingItemId, setMissingItemId] = useState(false);




    useEffect(() => {


        if (authorized !== undefined) {
            setIsLoading(false);
        }

        const itemIdCheck = searchParams.get("item_id");

        if (!itemIdCheck) {
            toast.error("Missing item ID.");
            setMissingItemId(true);
        }


    }, [authorized, searchParams]);



    const qr = searchParams.get("qr");
    const itemid = searchParams.get("item_id") || "";

    const title = searchParams.get("title") || "Item";
    const location = searchParams.get("location") || "N/A";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const price = parseInt(searchParams.get("price") || "0", 10);
    const pickup = searchParams.get("pickup") || "N/A";
    const image = searchParams.get("image");
    const upi_id = searchParams.get("upi_id");
    const subtotal = searchParams.get("subtotal") || "0";
    const pickupFee = searchParams.get("pickupFee") || "0";
    const platformFee = searchParams.get("platformFee") || "0";
    const total = (
        parseFloat(subtotal) +
        parseFloat(pickupFee) +
        parseFloat(platformFee)
    ).toString(); // Just in case it’s not passed in URL, calculate it.


    const startDate = startDateParam ? new Date(startDateParam) : null;
    const endDate = endDateParam ? new Date(endDateParam) : null;


    const rentalDays =
        startDate && endDate
            ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
            : 1;



    const handleContinue = async () => {
        if (!selectedMethod) return toast.error('Please select a payment method');

        if (selectedMethod === 'upi') {
            const queryParams = new URLSearchParams({
                item_id: itemid,
                title,
                location,
                startDate: startDateParam || "",
                endDate: endDateParam || "",
                price: price.toString(),
                pickup,
                subtotal,
                pickupFee,
                platformFee,
                total,
                image: image || "",
                upi_id: upi_id || "",
                qr: qr || ""
            });

            return router.push(`/qr_payment?${queryParams.toString()}`);
        }

        try {

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/bookings/cod`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    item_id: itemid,
                    start_date: startDateParam,
                    end_date: endDateParam,
                    delivery_type: pickup,
                    subtotal,
                    pickupFee,
                    platformFee,
                    total_price: total,
                    order_closed: false,
                    payment_mode: "Cash on delivery (cod)",
                }),
            });

            if (res.ok) {
                toast.success("Booking successful with Cash on Delivery");



                setTimeout(() => {
                    router.push("/cod_success");
                }, 1500);
            }
            else {
                toast.error("Booking failed. Try again.");
            }
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loading_container}>
                <FaSpinner className="animate-spin text-4xl text-gray-600 mx-auto mt-20" />
            </div>
        );
    }

    if (!authorized) {
        return (
            <div className="text-center mt-10 text-red-600 font-semibold">
                Unauthorized access. Please login as a renter.
            </div>
        );
    }

    if (missingItemId) {
        return (
            <div className="text-center mt-10 text-red-600 font-semibold">
                Missing item ID in the URL.
            </div>
        );
    }



    return (
        <>
            <Header1 />
            <Toaster position="top-center" />



            <div className="main_container1 min-h-screen bg-gray-100  px-4 py-10">
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

                <div className={styles.card}>


                    <div className="cards bg-white shadow-2xl rounded-2xl w-full max-w-lg p-8 space-y-6">
                        <h1 className="text-2xl font-bold text-center">Choose Payment Method</h1>

                        <div className="space-y-4">
                            {/* Cash on Delivery Option */}
                            <div
                                onClick={() => setSelectedMethod('cod')}
                                className={`cursor-pointer border-2 rounded-xl p-5 flex items-center justify-between transition-all duration-200 hover:shadow-md ${selectedMethod === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <Wallet className="w-6 h-6 text-green-600" />
                                    <div>
                                        <h2 className="font-semibold">Cash on Delivery</h2>
                                        <p className="text-sm text-gray-500">Pay when the tool is delivered</p>
                                    </div>
                                </div>
                                {selectedMethod === 'cod' && <CheckCircle className="text-green-500" />}
                            </div>

                            {/* UPI Payment Option */}
                            <div
                                onClick={() => setSelectedMethod('upi')}
                                className={`cursor-pointer border-2 rounded-xl p-5 flex items-center justify-between transition-all duration-200 hover:shadow-md ${selectedMethod === 'upi' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <IndianRupee className="w-6 h-6 text-blue-600" />
                                    <div>
                                        <h2 className="font-semibold">UPI Payment</h2>
                                        <p className="text-sm text-gray-500">Pay instantly using via UPI QR code</p>
                                    </div>
                                </div>
                                {selectedMethod === 'upi' && <CheckCircle className="text-blue-500" />}
                            </div>
                        </div>

                        <button
                            onClick={handleContinue}
                            className="w-full bg-black text-white rounded-xl py-3 font-semibold hover:bg-gray-800 transition-all"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>

        </>
    );
}
