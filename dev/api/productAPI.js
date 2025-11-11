import axiosInstance from "./axiosConfig";

const productAPI = {
  // Lấy tất cả sản phẩm
  getAllProducts: async () => {
    return await axiosInstance.get("/product/");
  },

  // Lấy sản phẩm theo ID
  getProductById: async (productId) => {
    return await axiosInstance.get(`/product/${productId}`);
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (keyword, page = 1, limit = 10) => {
    return await axiosInstance.get("/product/search", {
      params: { keyword, page, limit },
    });
  },

  // Lấy sản phẩm theo category
  getProductsByCategory: async (categoryId) => {
    return await axiosInstance.get(`/product/category/${categoryId}`);
  },

  // Admin: Thêm sản phẩm mới
  createProduct: async (productData) => {
    return await axiosInstance.post("/product/add", productData);
  },

  // Admin: Cập nhật sản phẩm
  updateProduct: async (productId, productData) => {
    return await axiosInstance.put(`/product/update/${productId}`, productData);
  },

  // Admin: Xóa sản phẩm
  deleteProduct: async (productId) => {
    return await axiosInstance.delete(`/product/delete/${productId}`);
  },
};

export default productAPI;
