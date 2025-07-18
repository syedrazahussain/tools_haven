'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';
import styles from '../rent_request.module.css';
import ToolsmasterHeader from '../../../../components/ToolsmasterHeader/page';
import {
  FaCalendarAlt,
  FaUser,
  FaMoneyBill,
  FaTools,
  FaTruck,
} from 'react-icons/fa';
import useRoleGuard from '../../../../hooks/useRoleGuard/page';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

export default function RentRequestPage(paramsPromise) {
  useRoleGuard(['toolsmaster']);
  const router = useRouter();
  const { book_id } = use(paramsPromise.params);

  const [booking, setBooking] = useState(null);
  const [item, setItem] = useState(null);
  const [userinfo, setUserinfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState({
    approve: false,
    reject: false,
    deliver: false,
    notDeliver: false,
    return: false,
    notReturn: false,
    cancel: false,
  });
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    const fetchBookingAndItem = async () => {
      try {
        const bookingRes = await fetch(`http://localhost:5000/user/get_request/${book_id}`);
        const bookingData = await bookingRes.json();
        setBooking(bookingData);

        if (bookingData?.item_id && bookingData?.user_id) {
          const itemRes = await fetch(`http://localhost:5000/user/item/${bookingData.item_id}`);
          const itemData = await itemRes.json();
          setItem(itemData);

          const userinfoRes = await fetch(`http://localhost:5000/user/userinfo/${bookingData.user_id}`);
          const userData = await userinfoRes.json();
          setUserinfo(userData);
        }
      } catch (err) {
        console.error('Failed to load booking or item or userinfo', err);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingAndItem();
  }, [book_id]);

  const updateStatus = async (url, status, btnKey) => {
    setLoadingBtn(prev => ({ ...prev, [btnKey]: true }));
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || 'Failed to update status');

      toast.success(result.message);
      setTimeout(() => router.refresh(), 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoadingBtn(prev => ({ ...prev, [btnKey]: false }));
    }
  };

  const cancelBooking = async () => {
    setLoadingBtn(prev => ({ ...prev, cancel: true }));
    try {
      const res = await fetch(`http://localhost:5000/user/cancel_booking/${booking.booking_id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Booking cancelled successfully');
        setBooking(prev => ({
          ...prev,
          cancelled: true,
          status: 'cancelled',
        }));
      } else {
        toast.error(data.error || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Cancel booking error:', err.message);
      toast.error('Something went wrong');
    } finally {
      setLoadingBtn(prev => ({ ...prev, cancel: false }));
    }
  };

  if (loading)
  return (
    <div className="p-6 text-gray-600 text-lg flex items-center gap-3">
      <div className="w-5 h-5 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      Loading booking details...
    </div>
  );

  if (!booking) return <div className="p-6 text-red-600 text-lg">Booking not found.</div>;

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <ToolsmasterHeader />
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>📦 Rent Requests Dashboard</h1>

        {booking.cancelled && (
          <div className="bg-red-100 text-red-700 font-semibold p-3 mb-4 rounded shadow">
            🚫 This booking has been cancelled.
          </div>
        )}

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Booking #{booking.booking_id}</h2>
              <p>
                <FaCalendarAlt />{' '}
                {new Date(booking.start_date).toLocaleDateString()} –{' '}
                {new Date(booking.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {item?.image1 && (
            <div className={styles.imageWrapper}>
              <img
                src={`http://localhost:5000/uploads/${item.image1}`}
                alt="Item"
                className={styles.thumbnail}
              />
            </div>
          )}

          <div className={styles.grid}>
            {/* Item Info */}
            <div className={styles.section}>
              <h3><FaTools /> Item Info</h3>
              <p><strong>Item ID:</strong> {booking.item_id}</p>
              <p><strong>Item Name:</strong> {item?.title}</p>
              <p><strong>Category:</strong> {item?.category}</p>
            </div>

            {/* User Info */}
            <div className={styles.section}>
              <h3><FaUser /> User Info</h3>
              <p><strong>User ID:</strong> {booking.user_id}</p>
              <p><strong>Name:</strong> {userinfo?.username}</p>
              <p><strong>Email:</strong> {userinfo?.email}</p>
              <p><strong>Phone:</strong> {userinfo?.phone}</p>
            </div>

            {/* Payment Info */}
            <div className={styles.section}>
              <h3><FaMoneyBill /> Payment</h3>
              <p><strong>Payment Mode:</strong> {booking.payment_mode}</p>
              <p><strong>Subtotal:</strong> ₹{booking.subtotal}</p>
              <p><strong>Pickup Fee:</strong> ₹{booking.pickupfee}</p>
              <p><strong>Platform Fee:</strong> ₹{booking.platformfee}</p>
              <p><strong>Total:</strong> ₹{booking.total_price}</p>
              <p><strong>Transaction ID:</strong> {booking.transaction_id}</p>
              <p><strong>Payment Status:</strong> {booking.payment_status}</p>
            </div>

            {/* Delivery Info */}
            <div className={styles.section}>
              <h3><FaTruck /> Delivery Info</h3>
              <p><strong>Delivery Type:</strong> {booking.delivery_type}</p>
              <p><strong>Delivery Status:</strong> {booking.delivery_status}</p>
              <p><strong>Item Returned:</strong> {booking.item_returned}</p>
            </div>

            {/* Screenshot */}
            <div className={styles.section}>
              <h3>🧾 Payment Screenshot</h3>
              {booking.screenshot ? (
                <img
                  src={`http://localhost:5000/${booking.screenshot.replace('\\', '/')}`}
                  alt="Payment Screenshot"
                  className={styles.screenshot}
                />
              ) : (
                <p>No screenshot uploaded.</p>
              )}
            </div>
          </div>

          <div className={styles.progressWrapper}>
            <div className={`${styles.step} ${booking.payment_status === 'success' ? styles.active : ''}`}>
              🧾 Payment {booking.payment_status}
            </div>
            <div className={`${styles.step} ${booking.delivery_status === 'delivered' ? styles.active : ''}`}>
              🚚 {booking.delivery_status}
            </div>
            <div className={`${styles.step} ${booking.item_returned === 'returned' ? styles.active : ''}`}>
              🔁 {booking.item_returned}
            </div>
          </div>

          {!booking.cancelled && (
            <div className={styles.actions}>
              <div className={styles.btn}>
                <button
                  className={styles.btnApprove}
                  onClick={() =>
                    updateStatus(
                      `http://localhost:5000/user/update_payment_status/${booking.booking_id}`,
                      'success',
                      'approve'
                    )
                  }
                >
                  {loadingBtn.approve ? '⏳ Approving...' : '✅ Approve Payment'}
                </button>

                <button
                  className={styles.btnApprove}
                  onClick={() =>
                    updateStatus(
                      `http://localhost:5000/user/update_payment_status/${booking.booking_id}`,
                      'reject',
                      'reject'
                    )
                  }
                >
                  {loadingBtn.reject ? '⏳ Rejecting...' : '❌ Reject Payment'}
                </button>
              </div>

              <div className={styles.btn}>
                <button
                  className={styles.btnDeliver}
                  onClick={() =>
                    updateStatus(
                      `http://localhost:5000/user/update_delivery_status/${booking.booking_id}`,
                      'delivered',
                      'deliver'
                    )
                  }
                >
                  {loadingBtn.deliver ? '⏳ Marking...' : '📦 Mark Delivered'}
                </button>

                <button
                  className={styles.btnDeliver}
                  onClick={() =>
                    updateStatus(
                      `http://localhost:5000/user/update_delivery_status/${booking.booking_id}`,
                      'not delivered',
                      'notDeliver'
                    )
                  }
                >
                  {loadingBtn.notDeliver ? '⏳ Marking...' : '📦 Mark Not Delivered'}
                </button>
              </div>

              <div className={styles.btn}>
                <button
                  className={styles.btnReturn}
                  onClick={() =>
                    updateStatus(
                      `http://localhost:5000/user/update_return_status/${booking.booking_id}`,
                      'returned',
                      'return'
                    )
                  }
                >
                  {loadingBtn.return ? '⏳ Marking...' : '🔁 Mark Returned'}
                </button>

                <button
                  className={styles.btnReturn}
                  onClick={() =>
                    updateStatus(
                      `http://localhost:5000/user/update_return_status/${booking.booking_id}`,
                      'not returned',
                      'notReturn'
                    )
                  }
                >
                  {loadingBtn.notReturn ? '⏳ Marking...' : '🔁 Mark Not Returned'}
                </button>
              </div>

              <div className={styles.btn}>
                <button
                  className={styles.btnDeliver}
                  style={{ backgroundColor: '#ef4444', marginTop: '20px' }}
                  onClick={() => setShowCancelDialog(true)}
                >
                  {loadingBtn.cancel ? '❌ Cancelling...' : '❌ Cancel Booking'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md text-center">
            <h2 className="text-lg font-semibold mb-4">Cancel Booking?</h2>
            <p className="mb-6">Are you sure you want to cancel this booking?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowCancelDialog(false)}
              >
                No
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => {
                  setShowCancelDialog(false);
                  cancelBooking();
                }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
