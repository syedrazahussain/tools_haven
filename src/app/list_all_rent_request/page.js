'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useRoleGuard from '../../../hooks/useRoleGuard/page';
import ToolsmasterHeader from '../../../components/ToolsmasterHeader/page';

export default function ListAllRequest() {
    useRoleGuard(['toolsmaster']);
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [items, setItems] = useState({});
    const [loading, setLoading] = useState(true);

    const handleViewDetails = (booking_id) => {
        router.push(`/rent_request/${booking_id}`);
    };

    useEffect(() => {
        const fetchBookings = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch('http://localhost:5000/user/get_request', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        token: token
                    }
                });
                const data = await response.json();
                const cleanData = data.filter(b => b.booking_id && b.user_id);
                setBookings(cleanData);

                const itemPromises = cleanData.map(async (booking) => {
                    if (booking.item_id) {
                        const itemRes = await fetch(`http://localhost:5000/user/item/${booking.item_id}`);
                        const itemData = await itemRes.json();
                        return { [booking.item_id]: itemData };
                    }
                    return {};
                });

                const allItems = await Promise.all(itemPromises);
                const mergedItems = Object.assign({}, ...allItems);
                setItems(mergedItems);
            } catch (error) {
                console.error('Failed to fetch bookings or items:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const created = new Date(timestamp);
        const diffMs = now - created;

        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (seconds < 60) return `${seconds}s ago`;
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getBadgeStyle = (timestamp) => {
        const age = new Date() - new Date(timestamp);
        const hours = age / (1000 * 60 * 60);

        if (hours < 1) return 'bg-green-100 text-green-800 border-green-300';
        if (hours < 24) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        return 'bg-red-100 text-red-800 border-red-300';
    };

    const formatPaymentStatus = (status) => {
        switch (status) {
            case 'success': return '✅ Success';
            case 'pending': return '🕒 Pending';
            case 'reject': return '❌ Rejected';
            default: return status ?? 'unknown';
        }
    };

    const getPaymentBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'reject': return 'bg-red-100 text-red-800';
            case 'success': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading)
  return (
    <div className="p-6 text-gray-600 text-lg flex items-center gap-3">
      <div className="w-5 h-5 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      Loading all rent details...
    </div>
  );
    return (
        <>
        <ToolsmasterHeader />
        <div className="min-h-screen p-6 bg-gray-50 mt-10">
            <h1 className="text-3xl font-semibold mb-6">📋 All Booking Requests</h1>

            {bookings.length === 0 ? (
                <p className="text-gray-600">No booking requests found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((b, index) => {
                        const item = items[b.item_id];
                        const imageUrl = item?.image1
                            ? `http://localhost:5000/uploads/${item.image1}`
                            : null;

                        return (
                            <div
                                key={index}
                                className="relative bg-white shadow-md rounded-xl p-5 border border-gray-200 flex flex-col justify-between hover:shadow-lg transition"
                            >
                                {/* Time Ago Badge */}
                                <div className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full border ${getBadgeStyle(b.created_at)}`}>
                                    ⏱ {getTimeAgo(b.created_at)}
                                </div>

                                {/* Thumbnail */}
                                {imageUrl && (
                                    <div className="mb-3">
                                        <img
                                            src={imageUrl}
                                            alt="Item"
                                            className="w-full h-40 object-cover rounded-md border border-gray-300"
                                            onError={(e) => (e.target.style.display = 'none')}
                                        />
                                    </div>
                                )}

                                <div>
                                    <h2 className="text-lg font-bold text-gray-800 mb-2">
                                        Booking #{b.booking_id ?? 'N/A'}
                                    </h2>
                                    <p className="text-gray-600 text-sm mb-1">
                                        <strong>User ID:</strong> {b.user_id ?? 'N/A'}
                                    </p>
                                    <p className="text-gray-600 text-sm mb-1">
                                        <strong>Start:</strong>{' '}
                                        {b.start_date ? new Date(b.start_date).toISOString().slice(0, 10) : 'N/A'}
                                    </p>
                                    <p className="text-gray-600 text-sm mb-1">
                                        <strong>End:</strong>{' '}
                                        {b.end_date ? new Date(b.end_date).toISOString().slice(0, 10) : 'N/A'}
                                    </p>
                                    <p className="text-gray-600 text-sm mb-1">
                                        <strong>Delivery:</strong> {b.delivery_type ?? 'N/A'}
                                    </p>
                                    <p className="text-gray-600 text-sm mb-3">
                                        <strong>Total:</strong> ₹{b.total_price ?? 'N/A'}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {b.cancelled === true || b.cancelled === 'true' ? (
                                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-800">
                                                ❌ Cancelled
                                            </span>
                                        ) : (
                                            <>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full font-medium ${getPaymentBadgeClass(b.payment_status)}`}
                                                >
                                                    {formatPaymentStatus(b.payment_status)}
                                                </span>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full font-medium ${b.delivery_status === 'not delivered'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                        }`}
                                                >
                                                    {b.delivery_status ?? 'unknown'}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleViewDetails(b.booking_id)}
                                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg"
                                >
                                    View Details
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
        </>
    );
}
