import OrderModel from "../models/OrderModel.js";
import * as CartModel from "../models/CartModel.js";

class OrderService {
  // Tạo đơn hàng mới từ cart items được gửi lên
  static async createOrder(userId, orderData) {
    try {
      // Validate cartItems
      if (
        !orderData.cartItems ||
        !Array.isArray(orderData.cartItems) ||
        orderData.cartItems.length === 0
      ) {
        throw new Error("Danh sách sản phẩm không được để trống");
      }

      // Lấy thông tin giỏ hàng của user
      const cart = await CartModel.getCart(userId);
      if (!cart) {
        throw new Error("Giỏ hàng trống");
      }

      // Chuẩn bị dữ liệu để tạo order
      const validCartItems = [];

      for (const requestItem of orderData.cartItems) {
        // Tìm item trong giỏ hàng
        const cartItem = cart.items.find((item) => {
          if (requestItem.variantId) {
            return (
              item.id === requestItem.cartItemId &&
              item.productId === requestItem.productId &&
              item.variantId === requestItem.variantId
            );
          } else {
            return (
              item.id === requestItem.cartItemId &&
              item.productId === requestItem.productId
            );
          }
        });

        if (!cartItem) {
          throw new Error(`Không tìm thấy sản phẩm trong giỏ hàng`);
        }

        // Kiểm tra số lượng yêu cầu không vượt quá số lượng trong giỏ
        if (requestItem.quantity > cartItem.quantity) {
          throw new Error(
            `Số lượng sản phẩm "${cartItem.productName}" vượt quá số lượng trong giỏ hàng`
          );
        }

        validCartItems.push({
          cartItemId: cartItem.id,
          productId: cartItem.productId,
          variantId: cartItem.variantId || null,
          quantity: requestItem.quantity,
          unitPrice: cartItem.unitPrice,
          cartQuantity: cartItem.quantity, // Số lượng hiện tại trong giỏ
        });
      }

      // Tạo đơn hàng
      const orderId = await OrderModel.createOrder(
        userId,
        {
          couponId: orderData.couponId || null,
          shipAddress: orderData.shipAddress || null,
        },
        validCartItems
      );

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
