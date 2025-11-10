import CouponService from "../services/CouponService.js";

class CouponController {
  // Lấy danh sách mã giảm giá
  static async getAllCoupons(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const coupons = await CouponService.getAllCoupons(page, limit);
      res.json({
        success: true,
        data: {
          coupons,
          pagination: {
            page,
            limit,
            total: coupons[0]?.total_count || 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Kiểm tra mã giảm giá hợp lệ
  static async verifyCoupon(req, res, next) {
    try {
      const { code } = req.body;
      const coupon = await CouponService.verifyCoupon(code);
      res.json({
        success: true,
        message: "Mã giảm giá hợp lệ",
        data: {
          couponId: coupon.id,
          code: coupon.code,
          discountPercent: coupon.discountPercent,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Tạo mã giảm giá mới
  static async createCoupon(req, res, next) {
    try {
      const coupon = await CouponService.createCoupon(req.body);
      res.status(201).json({
        success: true,
        message: "Tạo mã giảm giá mới thành công",
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  }

  // Cập nhật mã giảm giá
  static async updateCoupon(req, res, next) {
    try {
      const { id } = req.params;
      const coupon = await CouponService.updateCoupon(id, req.body);
      res.json({
        success: true,
        message: "Cập nhật mã giảm giá thành công",
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  }

  // Xóa mã giảm giá
  static async deleteCoupon(req, res, next) {
    try {
      const { id } = req.params;
      await CouponService.deleteCoupon(id);
      res.json({
        success: true,
        message: "Xóa mã giảm giá thành công",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CouponController;
