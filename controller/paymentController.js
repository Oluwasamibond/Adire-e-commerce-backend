import axios from "axios";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js"; // ✅ NEW
import HandleError from "../utils/handleError.js";
import handleAsyncError from "../middleware/handleAsyncError.js";

/**
 * Initialize Paystack Payment
 */
export const initializePaystackPayment = handleAsyncError(
  async (req, res, next) => {
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("user", "email name");

    if (!order) {
      return next(new HandleError("Order not found", 404));
    }

    if (order.isPaid) {
      return next(new HandleError("Order already paid", 400));
    }

    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: order.user.email,
        amount: Math.round(order.totalPrice * 100), // kobo
        currency: "NGN",
        callback_url: process.env.PAYSTACK_CALLBACK_URL,
        metadata: {
          orderId: order._id.toString(),
          userId: order.user._id.toString(),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${paystackKey}`,
        },
      },
    );

    res.status(200).json({
      success: true,
      authorization_url: paystackResponse.data.data.authorization_url,
      reference: paystackResponse.data.data.reference,
    });
  },
);

/**
 * Verify Paystack Payment (PAYMENT TRUTH LIVES HERE)
 */
export const verifyPaystackPayment = handleAsyncError(
  async (req, res, next) => {
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    const { reference } = req.query;

    if (!reference) {
      return next(new HandleError("Payment reference required", 400));
    }

    // 1️⃣ Verify payment with Paystack
    const { data } = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackKey}`,
        },
      },
    );

    console.log("Paystack verify response:", data);

    const paymentData = data?.data;

    if (!paymentData || paymentData.status !== "success") {
      return next(new HandleError("Payment verification failed", 400));
    }

    // 2️⃣ Get order from metadata
    const orderId = paymentData.metadata?.orderId;
    const order = await Order.findById(orderId);

    if (!order) {
      return next(new HandleError("Order not found", 404));
    }

    // 🛑 IMPORTANT: Prevent double processing
    if (order.isPaid) {
      return res.status(200).json({
        success: true,
        message: "Order already processed",
        order,
      });
    }

    // 3️⃣ Deduct stock (AFTER payment success)
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return next(new HandleError("Product not found", 404));
      }

      if (product.stock < item.quantity) {
        return next(
          new HandleError(`Not enough stock for ${product.name}`, 400),
        );
      }

      product.stock -= item.quantity;
      await product.save({ validateBeforeSave: false });
    }

    // 4️⃣ Mark order as paid
    order.isPaid = true;
    order.paymentInfo = {
      reference: paymentData.reference,
      status: paymentData.status,
    };
    order.paidAt = Date.now();

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Payment verified, stock updated, order confirmed",
      order,
    });
  },
);
