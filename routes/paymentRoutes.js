import express from "express";
import {
  initializePaystackPayment,
  verifyPaystackPayment,
} from "../controller/paymentController.js";
import { verifyUserAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.post("/paystack/initialize", verifyUserAuth, initializePaystackPayment);

router.get("/paystack/verify", verifyUserAuth,  verifyPaystackPayment);

export default router;
