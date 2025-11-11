import axiosInstance from "./axiosConfig";

const variantAPI = {
  // Lấy tất cả variants của một sản phẩm
  getVariantsByProduct: async (productId) => {
    return await axiosInstance.get(`/variants/product/${productId}`);
  },

  // Lấy chi tiết một variant
  getVariantById: async (variantId) => {
    return await axiosInstance.get(`/variants/${variantId}`);
  },

  // Admin: Thêm variant mới
  createVariant: async (variantData) => {
    return await axiosInstance.post("/variants/", variantData);
  },

  // Admin: Cập nhật variant
  updateVariant: async (variantId, variantData) => {
    return await axiosInstance.put(`/variants/${variantId}`, variantData);
  },

  // Admin: Xóa variant
  deleteVariant: async (variantId) => {
    return await axiosInstance.delete(`/variants/${variantId}`);
  },
};

export default variantAPI;
