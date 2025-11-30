import express from "express";
import {
  createProducts,
  deleteProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
} from "../controller/productController.js";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.post("/", verifyUserAuth, roleBasedAccess("admin"), createProducts);
router.get("/", verifyUserAuth, roleBasedAccess("admin"), getProducts);
router.put("/:id", verifyUserAuth, roleBasedAccess("admin"), updateProduct);
router.delete("/:id", verifyUserAuth, roleBasedAccess("admin"), deleteProduct);
router.get("/:id", verifyUserAuth, getSingleProduct);

export default router;
