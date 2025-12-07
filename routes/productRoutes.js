import express from "express";
import {
  createProductReview,
  createProducts,
  deleteProduct,
  deleteReview,
  getAdminProducts,
  getProductReviews,
  getProducts,
  getSingleProduct,
  updateProduct,
} from "../controller/productController.js";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.get("/admin/products", verifyUserAuth, roleBasedAccess("admin"), getAdminProducts)
router.post("/admin/product/create", verifyUserAuth, roleBasedAccess("admin"), createProducts);
router.get("/",  getProducts);

router.put("/review", verifyUserAuth, createProductReview);
router.get("/reviews", getProductReviews);
router.delete("/review", verifyUserAuth, deleteReview);

router.put("/admin/product/:id", verifyUserAuth, roleBasedAccess("admin"), updateProduct);
router.delete("/admin/product/:id", verifyUserAuth, roleBasedAccess("admin"), deleteProduct);
router.get("/:id",  getSingleProduct);


export default router;
