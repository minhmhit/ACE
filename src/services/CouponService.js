import CouponModel from "../models/CouponModel.js";

class CouponService {
  // Lấy danh sách mã giảm giá
  static async getAllCoupons(page, limit) {
    try {
      return await CouponModel.getAllCoupons(page, limit);
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra mã giảm giá hợp lệ
  static async verifyCoupon(code) {
    try {
      const coupon = await CouponModel.verifyCoupon(code);
      if (!coupon) {
        throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn");
      }
      return coupon;
    } catch (error) {
      throw error;
    }
  }

  // Tạo mã giảm giá mới
  static async createCoupon(couponData) {
    try {
      // Validate ngày bắt đầu và kết thúc
      const validFrom = new Date(couponData.validFrom);
      const validUntil = new Date(couponData.validUntil);

      if (validFrom > validUntil) {
        throw new Error("Ngày bắt đầu phải trước ngày kết thúc");
      }

      if (couponData.discountPercent <= 0 || couponData.discountPercent > 100) {
        throw new Error("Phần trăm giảm giá phải từ 1 đến 100");
      }

      return await CouponModel.createCoupon({
        ...couponData,
        validFrom,
        validUntil,
      });
    } catch (error) {
      if (error.message === "Mã giảm giá đã tồn tại") {
        throw error;
      }
      throw new Error("Không thể tạo mã giảm giá");
    }
  }

  // Cập nhật mã giảm giá
  static async updateCoupon(id, couponData) {
    try {

      if (couponData.validFrom && couponData.validUntil) {
        const validFrom = new Date(couponData.validFrom);
        const validUntil = new Date(couponData.validUntil);

        if (validFrom > validUntil) {
          throw new Error("Ngày bắt đầu phải trước ngày kết thúc");
        }
      }

      if (
        couponData.discountPercent &&
        (couponData.discountPercent <= 0 || couponData.discountPercent > 100)
      ) {
        throw new Error("Phần trăm giảm giá phải từ 1 đến 100");
      }

      return await CouponModel.updateCoupon(id, {
        ...couponData,
      });
    } catch (error) {
      if (
        error.message === "Mã giảm giá đã tồn tại" ||
        error.message === "Không tìm thấy mã giảm giá"
      ) {
        throw error;
      }
      throw new Error("Không thể cập nhật mã giảm giá");
    }
  }

  // Xóa mã giảm giá
  static async deleteCoupon(id) {
    try {
      await CouponModel.deleteCoupon(id);
      return true;
    } catch (error) {
      if (
        error.message ===
          "Không thể xóa mã giảm giá đang được sử dụng trong đơn hàng" ||
        error.message === "Không tìm thấy mã giảm giá"
      ) {
        throw error;
      }
      throw new Error("Không thể xóa mã giảm giá");
    }
  }
}

export default CouponService;
