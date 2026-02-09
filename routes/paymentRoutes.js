import express from "express";
import {
  initializePaystackPayment,
  verifyPaystackPayment,
} from "../controller/paymentController.js";
//import { verifyUserAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.post("/paystack/initialize",  initializePaystackPayment);

router.get("/paystack/verify",  verifyPaystackPayment);

export default router;
