import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: Number,
    phoneNo: Number,
  },

  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      yard: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    },
  ],

  orderStatus: {
    type: String,
    default: "Processing",
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  paymentInfo: {
    id: String,
    status: String,
    isPaid: {
      type: Boolean,
      default: false,
    },
  },

  paidAt: Date,

  itemsPrice: {
    type: Number,
    required: true,
    default: 0,
  },

  taxPrice: {
    type: Number,
    required: true,
    default: 0,
  },

  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },

  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },

  deliveredAt: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", orderSchema);