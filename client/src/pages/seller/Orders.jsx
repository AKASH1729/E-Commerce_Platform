import React, { useEffect, useState, useCallback } from "react";
import { useAppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import toast from "react-hot-toast";

const Orders = () => {
  const { user, axios, currency } = useAppContext(); // Get seller info, axios, currency
  const [orders, setOrders] = useState([]); // Store seller orders
  const [loading, setLoading] = useState(true); // Loading spinner

  // ----------------- FETCH SELLER ORDERS -----------------
  const fetchOrders = useCallback(async () => {
    if (!user?._id) return; // Wait for user to load
    setLoading(true);
    try {
      const { data } = await axios.get("/api/order/seller", { withCredentials: true }); // Get all orders
      if (data.success) {
        setOrders(data.orders || []); // Save orders
      } else {
        setOrders([]);
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      setOrders([]);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [axios, user]);

  // Fetch on component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Optional: auto-refresh orders every 15 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ----------------- RENDER CONDITIONAL STATES -----------------
  if (!user) return <div className="mt-16">Please login to see your orders.</div>;
  if (loading) return <div className="mt-16">Loading orders...</div>;
  if (orders.length === 0) return <div className="mt-16">No orders found.</div>;

  // ----------------- RENDER ORDERS -----------------
  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-auto">
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg font-medium">Orders List</h2>

        {orders.map((order) => (
          <div
            key={order._id}
            className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-5 max-w-4xl rounded-md border border-gray-300 bg-white"
          >
            {/* Items */}
            <div className="flex items-start gap-4 flex-1">
              <img className="w-12 h-12 object-cover" src={assets.box_icon} alt="boxIcon" />
              <div>
                {order.items?.map((item, index) => (
                  <p key={item.product?._id || index} className="font-medium">
                    {item.product?.name || "Product missing"}{" "}
                    <span className="text-primary">x {item.quantity || 1}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="text-sm md:text-base text-black/60 flex-1">
              <p className="text-black/80">
                {order.address?.firstName || "-"} {order.address?.lastName || "-"}
              </p>
              <p>{order.address?.street || "-"}, {order.address?.city || "-"}</p>
              <p>{order.address?.state || "-"}, {order.address?.zipcode || "-"}, {order.address?.country || "-"}</p>
              <p>{order.address?.phone || "-"}</p>
            </div>

            {/* Amount */}
            <p className="font-medium text-lg whitespace-nowrap">{currency}{order.amount || 0}</p>

            {/* Payment Info */}
            <div className="text-sm text-gray-600 text-right space-y-1">
              <p><span className="font-medium">Method:</span> {order.paymentType || "-"}</p>
              <p><span className="font-medium">Date:</span> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</p>
              <p>
                <span className="font-medium">Payment:</span>{" "}
                {order.isPaid ? (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Paid</span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Pending</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
