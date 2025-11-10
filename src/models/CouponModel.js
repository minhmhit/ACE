import pool from "../config/db.js";

class CouponModel {
  // Lấy danh sách mã giảm giá
  static async getAllCoupons(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [coupons] = await pool.query(
      `SELECT *, 
              COUNT(*) OVER() as total_count
       FROM coupons
       ORDER BY validUntil DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return coupons;
  }

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
    const { code, discountPercent, validFrom, validUntil } = couponData;

    // Kiểm tra code đã tồn tại (trừ coupon hiện tại)
    const codeExists = await this.checkCodeExists(code, id);
    if (codeExists) {
      throw new Error("Mã giảm giá đã tồn tại");
    }

    const [result] = await pool.query(
      `UPDATE coupons 
       SET code = ?, discountPercent = ?, validFrom = ?, validUntil = ?
       WHERE id = ?`,
      [code, discountPercent, validFrom, validUntil, id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Không tìm thấy mã giảm giá");
    }

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
