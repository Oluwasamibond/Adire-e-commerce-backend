import express from 'express';
import { allMyOrders, createOrder, deleteOrder, getAllOrders, getSingleOrder, updateOrderStatus } from '../controller/orderController.js';
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";
const router = express.Router();

router.post("/new/order", verifyUserAuth, createOrder)
router.get("/admin/order/:id", verifyUserAuth, roleBasedAccess('admin'), getSingleOrder)
router.get("/admin/orders", verifyUserAuth, roleBasedAccess('admin'), getAllOrders)
router.put("/admin/order/:id", verifyUserAuth, roleBasedAccess('admin'), updateOrderStatus)
router.delete("/admin/order/:id", verifyUserAuth, roleBasedAccess('admin'), deleteOrder)
router.get("/orders/user", verifyUserAuth, allMyOrders)

export default router;