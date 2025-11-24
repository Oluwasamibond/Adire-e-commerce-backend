import express from "express";
import {
  createProducts,
  deleteProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
} from "../controller/productController.js";

const router = express.Router();

router.post("/", createProducts);
router.get("/", getProducts);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/:id", getSingleProduct);

export default router;
