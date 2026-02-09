import dotenv from "dotenv";
dotenv.config();

console.log("ENV CHECK:", process.env.PAYSTACK_SECRET_KEY);

import express from "express";
import mongoose from "mongoose";

import productRoutes from "./routes/productRoutes.js";
import errorHandleMiddleware from "./middleware/error.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoute from "./routes/paymentRoutes.js"
import webhookRoutes from "./webhook/webhookRoutes.js"
import cookieParser from "cookie-parser";
import cors from "cors";



const port = process.env.PORT || 5000;
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  webhookRoutes
);

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());


// all routes

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoute)


app.use(errorHandleMiddleware);

app.get("/", (req, res) => {
  res.send("Adirebymkz server running...");
});

main()
  .then(() => console.log("Mongodb is connected"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.DB_URI);
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
