import OrderModel from "../models/OrderModel.js";
import * as CartModel from "../models/CartModel.js";

class OrderService {
  // Tạo đơn hàng mới từ giỏ hàng
  static async createOrder(userId, orderData) {
    try {
      // Lấy thông tin giỏ hàng
      const cart = await CartModel.getCart(userId);
      if (!cart || cart.items.length === 0) {
        throw new Error("Giỏ hàng trống");
      }

      // Tính tổng tiền
      let totalAmount = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Chuẩn bị dữ liệu đơn hàng
      const orderItems = cart.items.map((item) => ({
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        price: item.price,
      }));

      // Tạo đơn hàng
      const orderId = await OrderModel.createOrder(
        userId,
        {
          totalAmount,
          couponId: orderData.couponId,
        },
        orderItems
      );

      // Xóa giỏ hàng sau khi đặt hàng thành công
      await CartModel.clearCart(userId);

      return await OrderModel.getOrderById(orderId);
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách đơn hàng của user
  static async getOrdersByUser(userId, page, limit) {
    try {
      return await OrderModel.getOrdersByUser(userId, page, limit);
    } catch (error) {
      throw error;
    }
  }

  // Lấy chi tiết đơn hàng
  static async getOrderById(orderId, userId = null) {
    try {
      const order = await OrderModel.getOrderById(orderId, userId);
      if (!order) {
        throw new Error("Không tìm thấy đơn hàng");
      }
      return order;
    } catch (error) {
      throw error;
    }
  }

  // Hủy đơn hàng
  static async cancelOrder(orderId, userId) {
    try {
      const order = await OrderModel.getOrderById(orderId, userId);
      if (!order) {
        throw new Error("Không tìm thấy đơn hàng");
      }

      if (order.status !== "PENDING") {
        throw new Error("Chỉ có thể hủy đơn hàng ở trạng thái chờ xử lý");
      }

      const success = await OrderModel.cancelOrder(orderId, userId);
      if (!success) {
        throw new Error("Không thể hủy đơn hàng");
      }

      return await OrderModel.getOrderById(orderId, userId);
    } catch (error) {
      throw error;
    }
  }

  // Admin: Lấy tất cả đơn hàng
  static async getAllOrders(page, limit, status = null) {
    try {
      return await OrderModel.getAllOrders(page, limit, status);
    } catch (error) {
      throw error;
    }
  }

  // Admin: Cập nhật trạng thái đơn hàng
  static async updateOrderStatus(orderId, status) {
    try {
      const order = await OrderModel.getOrderById(orderId);
      if (!order) {
        throw new Error("Không tìm thấy đơn hàng");
      }

      if (status === "CANCELLED" && order.status !== "PENDING") {
        throw new Error("Chỉ có thể hủy đơn hàng ở trạng thái chờ xử lý");
      }

      const success = await OrderModel.updateOrderStatus(orderId, status);
      if (!success) {
        throw new Error("Không thể cập nhật trạng thái đơn hàng");
      }

      return await OrderModel.getOrderById(orderId);
    } catch (error) {
      throw error;
    }
  }
}

export default OrderService;
