// Model thống kê Dashboard — chứa các query tổng hợp dữ liệu
import pool from "../config/db.js";

const DashboardModel = {
  // ==================== SALES ====================

  /**
   * Thống kê doanh thu theo khoảng thời gian
   */
  async getSalesStats(from, to) {
    const [rows] = await pool.query(
      `SELECT
         COUNT(o.id)          AS totalOrders,
         COALESCE(SUM(o.totalAmount), 0) AS totalRevenue,
         COALESCE(AVG(o.totalAmount), 0) AS averageOrderValue
       FROM orders o
       WHERE o.status = 'COMPLETED'
         AND o.orderDate BETWEEN ? AND ?`,
      [from, to]
    );
    return rows[0];
  },

  async getRevenueByDay(from, to) {
    const [rows] = await pool.query(
      `SELECT
         DATE(o.orderDate) AS date,
         COUNT(o.id)       AS orderCount,
         COALESCE(SUM(o.totalAmount), 0) AS revenue
       FROM orders o
       WHERE o.status = 'COMPLETED'
         AND o.orderDate BETWEEN ? AND ?
       GROUP BY DATE(o.orderDate)
       ORDER BY date ASC`,
      [from, to]
    );
    return rows;
  },

  async getPaymentMethodBreakdown(from, to) {
    const [rows] = await pool.query(
      `SELECT
         pm.code   AS method,
         COUNT(p.payment_id) AS count,
         COALESCE(SUM(p.amount), 0) AS amount
       FROM payments p
       JOIN payment_methods pm ON pm.payment_method_id = p.payment_method_id
       JOIN orders o ON o.id = p.order_id
       WHERE p.status = 'SUCCESS'
         AND o.orderDate BETWEEN ? AND ?
       GROUP BY pm.code
       ORDER BY amount DESC`,
      [from, to]
    );
    return rows;
  },

  // ==================== ORDERS ====================

  async getOrderStats() {
    const [rows] = await pool.query(
      `SELECT
         COUNT(id) AS total,
         SUM(status = 'PENDING')   AS pending,
         SUM(status = 'SHIPPING')  AS shipping,
         SUM(status = 'COMPLETED') AS completed,
         SUM(status = 'CANCELLED') AS cancelled
       FROM orders`
    );
    return rows[0];
  },

  async getRecentOrders(limit = 10) {
    const [rows] = await pool.query(
      `SELECT o.id, o.orderDate, o.status, o.totalAmount,
              u.name AS customerName, u.email AS customerEmail
       FROM orders o
       JOIN users u ON u.id = o.userId
       ORDER BY o.orderDate DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  // ==================== PRODUCTS ====================

  async getTopSellingProducts(from, to, limit = 10) {
    const [rows] = await pool.query(
      `SELECT
         p.id, p.name, p.imageUrl, p.price,
         SUM(oi.quantity) AS totalSold,
         SUM(oi.quantity * oi.unitPrice) AS totalRevenue
       FROM order_items oi
       JOIN products p ON p.id = oi.productId
       JOIN orders o ON o.id = oi.orderId
       WHERE o.status = 'COMPLETED'
         AND o.orderDate BETWEEN ? AND ?
       GROUP BY p.id
       ORDER BY totalSold DESC
       LIMIT ?`,
      [from, to, limit]
    );
    return rows;
  },

  async getLowStockProducts(threshold = 10) {
    const [rows] = await pool.query(
      `SELECT
         p.id, p.name, p.imageUrl, p.price,
         i.quantity AS stock,
         c.name AS categoryName
       FROM inventories i
       JOIN products p ON p.id = i.productId
       LEFT JOIN categories c ON c.id = p.categoryId
       WHERE i.quantity <= ? AND p.isActive = 1
       ORDER BY i.quantity ASC`,
      [threshold]
    );
    return rows;
  },

  // ==================== HR ====================

  async getHrStats() {
    const [empStats] = await pool.query(
      `SELECT
         COUNT(id) AS totalEmployees,
         SUM(status = 'ACTIVE')     AS active,
         SUM(status = 'PROBATION')  AS probation,
         SUM(status = 'ON_LEAVE')   AS onLeave,
         SUM(status = 'RESIGNED')   AS resigned,
         SUM(status = 'TERMINATED') AS terminated
       FROM employees`
    );

    const [deptStats] = await pool.query(
      `SELECT d.name AS department, COUNT(e.id) AS count
       FROM departments d
       LEFT JOIN employees e ON e.department_id = d.id AND e.status IN ('ACTIVE','PROBATION')
       WHERE d.is_active = 1
       GROUP BY d.id
       ORDER BY count DESC`
    );

    const [leaveStats] = await pool.query(
      `SELECT
         SUM(status = 'PENDING')  AS pendingLeaves,
         SUM(status = 'APPROVED') AS approvedLeaves
       FROM leave_requests`
    );

    const [resignStats] = await pool.query(
      `SELECT COUNT(id) AS pendingResignations
       FROM resignation_requests
       WHERE status = 'PENDING'`
    );

    return {
      employees: empStats[0],
      byDepartment: deptStats,
      leaves: leaveStats[0],
      resignations: resignStats[0],
    };
  },

  // ==================== PAYROLL ====================

  async getPayrollStats(periodId) {
    let periodQuery;
    let params;

    if (periodId) {
      periodQuery = `SELECT * FROM payroll_periods WHERE id = ?`;
      params = [periodId];
    } else {
      periodQuery = `SELECT * FROM payroll_periods ORDER BY year_no DESC, month_no DESC LIMIT 1`;
      params = [];
    }

    const [periods] = await pool.query(periodQuery, params);
    if (periods.length === 0) return null;

    const period = periods[0];

    const [stats] = await pool.query(
      `SELECT
         COUNT(id)                       AS employeeCount,
         COALESCE(SUM(gross_salary), 0)  AS totalGross,
         COALESCE(SUM(net_salary), 0)    AS totalNet,
         COALESCE(SUM(payable_salary), 0) AS totalPayable,
         SUM(status = 'DRAFT')     AS draft,
         SUM(status = 'FINALIZED') AS finalized,
         SUM(status = 'PAID')      AS paid
       FROM payrolls
       WHERE payroll_period_id = ?`,
      [period.id]
    );

    return { period, ...stats[0] };
  },

  // ==================== OVERVIEW ====================

  async getOverview() {
    const [counts] = await pool.query(
      `SELECT
         (SELECT COUNT(id) FROM users WHERE isActive = 1 AND deletedAt IS NULL) AS totalUsers,
         (SELECT COUNT(id) FROM products WHERE isActive = 1) AS totalProducts,
         (SELECT COUNT(id) FROM orders) AS totalOrders,
         (SELECT COALESCE(SUM(totalAmount), 0) FROM orders WHERE status = 'COMPLETED') AS totalRevenue,
         (SELECT COUNT(id) FROM employees WHERE status IN ('ACTIVE','PROBATION')) AS totalActiveEmployees,
         (SELECT COUNT(id) FROM leave_requests WHERE status = 'PENDING') AS pendingLeaveRequests,
         (SELECT COUNT(id) FROM resignation_requests WHERE status = 'PENDING') AS pendingResignations,
         (SELECT COUNT(id) FROM inventories i JOIN products p ON p.id = i.productId WHERE i.quantity <= 10 AND p.isActive = 1) AS lowStockProducts`
    );
    return counts[0];
  },
};

export default DashboardModel;
