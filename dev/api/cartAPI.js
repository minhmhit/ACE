import axiosInstance from "./axiosConfig";

const cartAPI = {
  // Lấy giỏ hàng của user
  getCart: async () => {
    return await axiosInstance.get("/cart/");
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (cartData) => {
    return await axiosInstance.post("/cart/add", cartData);
  },

  // Cập nhật số lượng sản phẩm trong giỏ
  updateCartItem: async (itemId, quantity) => {
    return await axiosInstance.put(`/cart/update/${itemId}`, { quantity });
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: async (itemId) => {
    return await axiosInstance.delete(`/cart/remove/${itemId}`);
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    return await axiosInstance.delete("/cart/clear");
  },
};

export default cartAPI;
