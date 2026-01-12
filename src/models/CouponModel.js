import {pool} from "../config/db.js";

class CouponModel {
  // Lấy danh sách mã giảm giá
  static async getAllCoupons(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const today = new Date();
     
    const [coupons] = await pool.query(
      `SELECT *, 
              COUNT(*) OVER() as total_count
       FROM coupons
       
       ORDER BY validUntil DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    // Lọc các mã giảm giá còn hiệu lực
    const couponsAvailable = coupons.filter(coupon => {
      const validFrom = new Date(coupon.validFrom);
      const validUntil = new Date(coupon.validUntil);
      return validFrom <= today && validUntil >= today;
    });
    return couponsAvailable;
  };

  // Lấy chi tiết mã giảm giá
  static async getCouponById(id) {
    const [coupon] = await pool.query("SELECT * FROM coupons WHERE id = ?", [
      id,
    ]);
    return coupon[0];
  }

  // Kiểm tra mã giảm giá tồn tại
  static async checkCodeExists(code, excludeId = null) {
    const [result] = await pool.query(
      "SELECT id FROM coupons WHERE code = ? AND id != COALESCE(?, -1)",
      [code, excludeId]
    );
    return result.length > 0;
  }

  // Kiểm tra mã giảm giá hợp lệ
  static async verifyCoupon(code) {
    const [coupon] = await pool.query(
      `SELECT * FROM coupons 
       WHERE code = ? 
       AND validFrom <= NOW() 
       AND validUntil >= NOW()`,
      [code]
    );
    return coupon[0];
  }

  // Tạo mã giảm giá mới
  static async createCoupon(couponData) {
    const { code, discountPercent, validFrom, validUntil } = couponData;

    // Kiểm tra code đã tồn tại
    const codeExists = await this.checkCodeExists(code);
    if (codeExists) {
      throw new Error("Mã giảm giá đã tồn tại");
    }

    const [result] = await pool.query(
      `INSERT INTO coupons (code, discountPercent, validFrom, validUntil)
       VALUES (?, ?, ?, ?)`,
      [code, discountPercent, validFrom, validUntil]
    );

    return this.getCouponById(result.insertId);
  }

  // Cập nhật mã giảm giá
  static async updateCoupon(id, couponData) {
    // Kiểm tra coupon có tồn tại không
    const existingCoupon = await this.getCouponById(id);
    if (!existingCoupon) {
      throw new Error("Không tìm thấy mã giảm giá");
    }

    // Kiểm tra code đã tồn tại (nếu có truyền code mới)
    if (couponData.code && couponData.code !== existingCoupon.code) {
      const codeExists = await this.checkCodeExists(couponData.code, id);
      if (codeExists) {
        throw new Error("Mã giảm giá đã tồn tại");
      }
    }

    // Tạo câu query động chỉ cập nhật các trường được truyền lên
    const updates = [];
    const values = [];

    if (couponData.code !== undefined) {
      updates.push("code = ?");
      values.push(couponData.code);
    }

    if (couponData.discountPercent !== undefined) {
      updates.push("discountPercent = ?");
      values.push(couponData.discountPercent);
    }

    if (couponData.validFrom !== undefined) {
      updates.push("validFrom = ?");
      values.push(couponData.validFrom);
    }

    if (couponData.validUntil !== undefined) {
      updates.push("validUntil = ?");
      values.push(couponData.validUntil);
    }

    // Nếu không có trường nào để cập nhật
    if (updates.length === 0) {
      return existingCoupon;
    }

    // Thêm id vào cuối mảng values
    values.push(id);

    // Thực hiện update
    const [result] = await pool.query(
      `UPDATE coupons SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    return this.getCouponById(id);
  }

  // Xóa mã giảm giá
  static async deleteCoupon(id) {
    // Kiểm tra mã giảm giá có đang được sử dụng trong đơn hàng không
    const [orders] = await pool.query(
      "SELECT COUNT(*) as count FROM orders WHERE couponId = ?",
      [id]
    );

    if (orders[0].count > 0) {
      throw new Error(
        "Không thể xóa mã giảm giá đang được sử dụng trong đơn hàng"
      );
    }

    const [result] = await pool.query("DELETE FROM coupons WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      throw new Error("Không tìm thấy mã giảm giá");
    }

    return true;
  }
}

export default CouponModel;
