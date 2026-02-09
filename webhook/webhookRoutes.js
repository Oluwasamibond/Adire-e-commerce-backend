import express from "express";
import crypto from "crypto";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

const router = express.Router();

router.post("/paystack", async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  // 1. Validate Paystack signature
  const signature = req.headers["x-paystack-signature"];
  if (!signature) {
    return res.status(403).send("Missing Paystack signature");
  }

  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== signature) {
    return res.status(403).send("Invalid Paystack signature");
  }

  // 2. Process webhook event
  const { event, data } = req.body;

  if (event === "charge.success") {
    const orderId = data.metadata?.orderId;

    if (!orderId) {
      return res.status(400).send("Order ID missing in metadata");
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // 3. Prevent double processing (VERY IMPORTANT)
    if (order.isPaid) {
      return res.status(200).send("Order already processed");
    }

    // 4. Mark order as paid
    order.isPaid = true;
    order.paymentInfo = {
      reference: data.reference,
      status: data.status,
    };
    order.paidAt = Date.now();

    // 5. Deduct stock AFTER payment
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);

      if (!product) continue;

      product.stock -= item.quantity;
      await product.save({ validateBeforeSave: false });
    }

    await order.save({ validateBeforeSave: false });
  }

  res.status(200).send("Webhook processed");
});

export default router;
