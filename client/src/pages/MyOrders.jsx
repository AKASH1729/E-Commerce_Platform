import React, { useEffect, useState, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MyOrders = () => {
  const { user, axios, currency } = useAppContext(); // Get user info, axios instance, currency
  const [myOrders, setMyOrders] = useState([]);     // Store user orders
  const [loading, setLoading] = useState(true);     // Loading state

  // ----------------- FETCH USER ORDERS -----------------
  const fetchMyOrders = useCallback(async () => {
    if (!user?._id) return; // Wait for user to load
    setLoading(true);
    try {
      const { data } = await axios.get("/api/order/user"); // Backend endpoint
      if (data.success) {
        setMyOrders(data.orders || []);
      } else {
        setMyOrders([]);
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Fetch MyOrders error:", error);
      setMyOrders([]);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [axios, user]);

  // Fetch orders on component mount or when user changes
  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  // Optional: auto-refresh orders every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchMyOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchMyOrders]);

  // ----------------- CONDITIONAL RENDER -----------------
  if (!user) return <div className="mt-16">Please login to see your orders.</div>;
  if (loading) return <div className="mt-16">Loading your orders...</div>;
  if (myOrders.length === 0) return <div className="mt-16">No orders found.</div>;

  // ----------------- RENDER ORDERS -----------------
  return (
    <div className="mt-16 pb-16">
      <div className="flex flex-col items-end w-max mb-8">
        <p className="text-2xl font-medium uppercase">My Orders</p>
        <div className="w-16 h-0.5 bg-primary rounded-full"></div>
      </div>

      {myOrders.map((order) => (
        <div
          key={order._id}
          className="border border-gray-300 rounded-lg p-4 mb-10 max-w-2xl w-full"
        >
          {/* Order Header */}
          <p className="flex justify-between text-sm text-gray-500 mb-4 flex-wrap">
            <span>OrderId: {order._id}</span>
            <span>Payment: {order.paymentType}</span>
            <span>Total Amount: {currency}{order.amount || 0}</span>
          </p>

          {/* Order Items */}
          {order.items?.map((item, index) => {
            if (!item.product) return null; // Skip null product references

            const productImage = Array.isArray(item.product.image) ? item.product.image[0] : "";

            return (
              <div
                key={item.product._id || index}
                className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 ${
                  index !== order.items.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <img
                      src={productImage}
                      alt={item.product.name || "Product"}
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-800">{item.product.name}</h2>
                    <p className="text-sm text-gray-500">
                      Category: {item.product.category || "-"}
                    </p>
                  </div>
                </div>

                {/* Quantity, Status, Date, Amount */}
                <div className="flex flex-col justify-center md:ml-8 mb-4 md:mb-0">
                  <p>Quantity: {item.quantity || 1}</p>
                  <p
                    className={`font-medium ${
                      order.status === "Completed" ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    Status: {order.status}
                  </p>
                  <p>Date: {new Date(order.createdAt).toLocaleDateString("en-US")}</p>
                  <p className="text-primary font-medium">
                    Amount: {currency}{item.product.offerPrice * (item.quantity || 1)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MyOrders;
