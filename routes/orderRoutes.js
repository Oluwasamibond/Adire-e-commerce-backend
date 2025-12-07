import express from 'express';
import { createOrder } from '../controller/orderController.js';
import { verifyUserAuth } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post("/new/order", verifyUserAuth, createOrder)