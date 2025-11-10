import OrderService from "../services/OrderService.js";

class OrderController {
  // Tạo đơn hàng mới
  static async createOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const orderData = {
        couponId: req.body.couponId,
      };

      const order = await OrderService.createOrder(userId, orderData);
      res.status(201).json({
        success: true,
        message: "Đặt hàng thành công",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  // Lấy danh sách đơn hàng của user
  static async getOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const orders = await OrderService.getOrdersByUser(userId, page, limit);
      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page,
            limit,
            total: orders[0]?.total_count || 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Lấy chi tiết đơn hàng
  static async getOrderById(req, res, next) {
    try {
      const orderId = req.params.id;
      const userId = req.user.role === "admin" ? null : req.user.id;

      const order = await OrderService.getOrderById(orderId, userId);
      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  // Hủy đơn hàng
  static async cancelOrder(req, res, next) {
    try {
      const orderId = req.params.id;
      const userId = req.user.id;

      const order = await OrderService.cancelOrder(orderId, userId);
      res.json({
        success: true,
        message: "Hủy đơn hàng thành công",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Lấy tất cả đơn hàng
  static async getAllOrders(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;

      const orders = await OrderService.getAllOrders(page, limit, status);
      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page,
            limit,
            total: orders[0]?.total_count || 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Cập nhật trạng thái đơn hàng
  static async updateOrderStatus(req, res, next) {
    try {
      const orderId = req.params.id;
      const { status } = req.body;

      const order = await OrderService.updateOrderStatus(orderId, status);
      res.json({
        success: true,
        message: "Cập nhật trạng thái đơn hàng thành công",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default OrderController;
