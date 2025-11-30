import Product from "../models/productModel.js";
import HandleError from "../utils/handleError.js";
import handleAsyncError from "../middleware/handleAsyncError.js";
import APIFunctionality from "../utils/apiFunctionality.js";

// Create Products
export const createProducts = handleAsyncError(async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get All Products
export const getProducts = handleAsyncError(async (req, res, next) => {
  const resultPerPage = 3;
  const apiFeatures = new APIFunctionality(Product.find(), req.query)
    .search()
    .filter();

    // Getting filter query before pagination
    const filteredQuery = apiFeatures.query.clone();
    const ProductCount = await filteredQuery.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(ProductCount / resultPerPage);
    const page = Number(req.query.page) || 1;

    if(page > totalPages && producytCount > 0) {
      return next(new HandleError("Page number exceeds total pages", 404));
    }

    // Apply pagination
    apiFeatures.pagination(resultPerPage);
  try {
    const products = await apiFeatures.query;

    if(!products || products.length === 0) {
      return next(new HandleError("No products found", 404));
    }
    res.status(200).json({
      success: true,
      products,
      ProductCount,
      resultPerPage,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

//Update Product
export const updateProduct = handleAsyncError(async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new HandleError("Product not found", 404));
    }

    // Update the product with the request body and return the new document
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete Product
export const deleteProduct = handleAsyncError(async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new HandleError("Product not found", 404));
    }

    product = await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Product Deleted Successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Single Product
export const getSingleProduct = handleAsyncError(async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new HandleError("Product not found", 404));
    }
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
