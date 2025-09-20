import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Stripe from "stripe";

// ----------------- PLACE ORDER COD -----------------
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.user?._id; // Logged-in user ID from auth middleware
    const { items, address } = req.body;

    if (!userId || !address || !items?.length) {
      return res.status(400).json({ success: false, message: "Invalid order data" });
    }

    // Calculate total amount including tax
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue;
      amount += product.offerPrice * item.quantity;
    }
    amount = Math.round(amount * 1.02);

    // Create order in DB
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
      status: "Pending",
      isPaid: false,
    });

    return res.json({ success: true, message: "Order placed successfully", order });
  } catch (error) {
    console.error("COD Order Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------- PLACE ORDER STRIPE -----------------
export const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { items, address } = req.body;
    const { origin } = req.headers;

    if (!userId || !address || !items?.length) {
      return res.status(400).json({ success: false, message: "Invalid order data" });
    }

    let productData = [];
    let amount = 0;

    // Prepare product data for Stripe
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      amount += product.offerPrice * item.quantity;
    }
    amount = Math.round(amount * 1.02);

    // Create order in DB
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
      status: "Pending",
      isPaid: false,
    });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Convert to Stripe line_items format
    const line_items = productData.map((item) => ({
      price_data: {
        currency: "AUD",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 1.02 * 100), // in cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: { orderId: order._id.toString(), userId },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Order Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------- STRIPE WEBHOOK -----------------
export const stripeWebhooks = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed":
      {
        const session = event.data.object;
        const { orderId, userId } = session.metadata;

        // Mark order as paid and clear cart
        await Order.findByIdAndUpdate(orderId, { isPaid: true, status: "Completed" });
        await User.findByIdAndUpdate(userId, { cartItems: {} });
      }
      break;

    case "payment_intent.payment_failed":
      {
        const paymentIntent = event.data.object;
        const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntent.id });
        if (sessions.data[0]) {
          const { orderId } = sessions.data[0].metadata;
          await Order.findByIdAndDelete(orderId); // Remove failed order
        }
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

// ----------------- GET USER ORDERS -----------------
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(400).json({ success: false, message: "UserId required" });

    // Populate product details
    const orders = await Order.find({ userId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (error) {
    console.error("Get User Orders Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------- GET ALL ORDERS -----------------
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product")
      .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
