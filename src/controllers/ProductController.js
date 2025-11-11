import { validationResult } from "express-validator";
import * as ProductService from "../services/ProductService.js";

/**
 * Controller lấy danh sách sản phẩm
 */
export async function getAllProducts(req, res, next) {
  try {
    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 10;
    // const categoryId = req.query.categoryId
    //   ? parseInt(req.query.categoryId)
    //   : null;

    const result = await ProductService.getProducts();
    res.json({
      message: "Lấy danh sách sản phẩm thành công",
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller lấy chi tiết sản phẩm
 */
export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await ProductService.getProductById(id);
    res.json({
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller tìm kiếm sản phẩm
 */
export async function searchProducts(req, res, next) {
  try {
    const { keyword } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await ProductService.searchProducts(keyword, page, limit);
    res.json({
      message:"Tìm kiếm sản phẩm thành công",
      data: result,
      
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller thêm sản phẩm mới
 */
export async function createProduct(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await ProductService.createProduct(req.body);
    res.status(201).json({
      message: "Thêm sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller cập nhật sản phẩm
 */
export async function updateProduct(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const product = await ProductService.updateProduct(id, req.body);
    res.json({
      message: "Cập nhật sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller xóa sản phẩm
 */
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    await ProductService.deleteProduct(id);
    res.json({
      message: "Xóa sản phẩm thành công",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller lấy danh sách biến thể
 */
export async function getProductVariants(req, res, next) {
  try {
    const { id } = req.params;
    const variants = await ProductService.getProductVariants(id);
    res.json({
      data: variants,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller thêm biến thể mới
 */
export async function createVariant(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const variant = await ProductService.createVariant(id, req.body);
    res.status(201).json({
      message: "Thêm biến thể thành công",
      data: variant,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller cập nhật biến thể
 */
export async function updateVariant(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const variant = await ProductService.updateVariant(id, req.body);
    res.json({
      message: "Cập nhật biến thể thành công",
      data: variant,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller xóa biến thể
 */
export async function deleteVariant(req, res, next) {
  try {
    const { id } = req.params;
    const productId = req.body.productId;
    await ProductService.deleteVariant(id, productId);
    res.json({
      message: "Xóa biến thể thành công",
    });
  } catch (error) {
    next(error);
  }
}
