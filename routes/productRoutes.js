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
router.get("/admin/reviews",verifyUserAuth, roleBasedAccess("admin"), getProductReviews);
router.delete("/admin/review", verifyUserAuth, roleBasedAccess("admin"), deleteReview);

router.put("/admin/product/update/:id", verifyUserAuth, roleBasedAccess("admin"), updateProduct);
router.delete("/admin/product/delete/:id", verifyUserAuth, roleBasedAccess("admin"), deleteProduct);
router.get("/:id",  getSingleProduct);


export default router;
