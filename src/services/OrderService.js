import OrderModel from "../models/OrderModel.js";
import * as CartModel from "../models/CartModel.js";
import * as PaymentService from "./PaymentService.js";
import * as AddressService from "./AddressService.js";
import * as UserModel from "../models/UserModel.js";

class OrderService {
  // Tạo đơn hàng mới từ cart items được gửi lên
  static async createOrder(userId, orderData) {
    try {
      const paymentMethodCode = orderData.paymentMethodCode || "COD";
      if (!["COD", "VNPAY"].includes(paymentMethodCode)) {
        throw new Error("Phương thức thanh toán không hợp lệ (COD, VNPAY)");
      }

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
            `Số lượng sản phẩm "${cartItem.productName}" vượt quá số lượng trong giỏ hàng`,
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

      // Xử lý địa chỉ: nếu có addressId thì lấy từ DB, nếu có newAddress thì tạo mới
      let addressId = null;
      let shipAddress = orderData.shipAddress || null;

      if (orderData.addressId) {
        // Verify địa chỉ thuộc về user
        const address = await UserModel.getAddressByIdAndUserId(
          orderData.addressId,
          userId,
        );
        if (!address) {
          throw new Error("Địa chỉ không tồn tại");
        }
        addressId = orderData.addressId;
        shipAddress = address.full_address; // Lấy full_address từ DB
      } else if (orderData.newAddress) {
        // Tạo địa chỉ mới
        const newAddressData = orderData.newAddress;

        // Kiểm tra dữ liệu bắt buộc
        if (
          !newAddressData.receiverName ||
          !newAddressData.phoneNumber ||
          !newAddressData.fullAddress
        ) {
          throw new Error("Thông tin địa chỉ không đầy đủ");
        }

        try {
          const createdAddress = await AddressService.createAddress(userId, {
            receiverName: newAddressData.receiverName,
            phoneNumber: newAddressData.phoneNumber,
            fullAddress: newAddressData.fullAddress,
            addressType: newAddressData.addressType || "home",
            isDefault: newAddressData.isDefault || false,
          });
          addressId = createdAddress.id;
          shipAddress = createdAddress.fullAddress;
        } catch (addressError) {
          throw new Error(`Lỗi khi tạo địa chỉ: ${addressError.message}`);
        }
      }

      // Validate cần có ít nhất một trong hai: addressId hoặc shipAddress trực tiếp
      if (!addressId && !shipAddress) {
        throw new Error("Vui lòng cung cấp địa chỉ giao hàng");
      }

      // Tạo đơn hàng
      const orderId = await OrderModel.createOrder(
        userId,
        {
          couponId: orderData.couponId || null,
          shipAddress: shipAddress || null,
          addressId: addressId || null,
        },
        validCartItems,
        {
          // COD: finalize ngay. VNPAY: chỉ tạo đơn + items, chờ IPN mới finalize.
          finalizeSale: paymentMethodCode === "COD",
        },
      );

      const order = await OrderModel.getOrderById(orderId);

      if (paymentMethodCode === "VNPAY") {
        const payment = await PaymentService.createPayment(userId, {
          orderId,
          paymentMethodCode: "VNPAY",
          orderInfo: `Thanh toan don hang ${orderId}`,
        });

        return {
          ...order,
          payment,
        };
      }

      return order;
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

  // Tạo đơn mới để thanh toán lại từ một đơn đã hủy
  static async rePaymentCancelledOrder(userId, orderId, paymentMethodCode) {
    try {
      const method = paymentMethodCode || "VNPAY";
      if (method !== "VNPAY") {
        throw new Error("Chỉ hỗ trợ thanh toán lại qua VNPAY");
      }

      const oldOrder = await OrderModel.getOrderById(orderId, userId);
      if (!oldOrder) {
        throw new Error("Không tìm thấy đơn hàng");
      }

      if (oldOrder.status !== "CANCELLED") {
        throw new Error("Chỉ có thể thanh toán lại đơn hàng đã hủy");
      }

      if (!oldOrder.items || oldOrder.items.length === 0) {
        throw new Error("Đơn hàng không có sản phẩm để thanh toán lại");
      }

      const newOrderId = await OrderModel.createOrderFromExisting(
        {
          userId: oldOrder.userId,
          totalAmount: oldOrder.totalAmount,
          shipAddress: oldOrder.shipAddress,
          address_id: oldOrder.address_id,
          couponId: oldOrder.couponId,
        },
        oldOrder.items,
      );

      const newOrder = await OrderModel.getOrderById(newOrderId, userId);

      const payment = await PaymentService.createPayment(userId, {
        orderId: newOrderId,
        paymentMethodCode: "VNPAY",
        orderInfo: `Thanh toan lai don hang ${orderId}`,
      });

      return {
        ...newOrder,
        payment,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default OrderService;
