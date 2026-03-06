import axios from "axios";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import HandleError from "../utils/handleError.js";
import handleAsyncError from "../middleware/handleAsyncError.js";

/**
 * Initialize Paystack Payment
 */
export const initializePaystackPayment = handleAsyncError(
  async (req, res, next) => {
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    const {
      orderItems,
      shippingInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      userEmail,
      userName,
    } = req.body;

    // ✅ Validation
    if (!orderItems || !orderItems.length) {
      return next(new HandleError("No products in the order", 400));
    }

    if (!userEmail || !userName || !shippingInfo || !totalPrice) {
      return next(new HandleError("Incomplete order details", 400));
    }

    // 1️⃣ Create order in DB first
    const order = await Order.create({
      user: req.user?._id,
      orderItems,
      shippingInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      orderStatus: "Processing",
      paymentInfo: {
        status: "Pending",
        isPaid: false,
      },
    });

    // 2️⃣ Initialize Paystack transaction
    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: userEmail,
        amount: Math.round(totalPrice * 100), // in kobo
        currency: "NGN",
        callback_url: process.env.PAYSTACK_CALLBACK_URL,
        metadata: {
          orderId: order._id.toString(),
          userId: req.user?._id?.toString() || null,
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
      orderId: order._id,
    });
  },
);

/**
 * Verify Paystack Payment
 */
export const verifyPaystackPayment = handleAsyncError(
  async (req, res, next) => {
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    const { reference } = req.query;

    if (!reference) {
      return next(new HandleError("Payment reference required", 400));
    }

    // Verify payment with Paystack
    const { data } = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackKey}`,
        },
      },
    );

    const paymentData = data?.data;

    if (!paymentData || paymentData.status !== "success") {
      return next(new HandleError("Payment verification failed", 400));
    }

    // Get order
    const orderId = paymentData.metadata?.orderId;
    const order = await Order.findById(orderId);

    if (!order) {
      return next(new HandleError("Order not found", 404));
    }

    if (order.paymentInfo?.isPaid) {
      return res.status(200).json({
        success: true,
        message: "Order already processed",
        order,
      });
    }

    // Deduct stock
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

    // ✅ Update order after successful payment
    order.paymentInfo = {
      id: paymentData.reference,
      status: paymentData.status,
      isPaid: true,
    };
    order.paidAt = Date.now();
    order.orderStatus = "Confirmed";

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed",
      order,
    });
  },
);
