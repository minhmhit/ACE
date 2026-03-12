// Service Dashboard — xử lý logic nghiệp vụ thống kê
import DashboardModel from "../models/DashboardModel.js";

const DashboardService = {
  /**
   * Thống kê doanh thu bán hàng
   * @param {string} from - ngày bắt đầu (YYYY-MM-DD)
   * @param {string} to   - ngày kết thúc (YYYY-MM-DD)
   */
  async getSalesStats(from, to) {
    const [summary, revenueByDay, paymentMethods] = await Promise.all([
      DashboardModel.getSalesStats(from, to),
      DashboardModel.getRevenueByDay(from, to),
      DashboardModel.getPaymentMethodBreakdown(from, to),
    ]);

    return {
      totalOrders: Number(summary.totalOrders),
      totalRevenue: Number(summary.totalRevenue),
      averageOrderValue: Number(Number(summary.averageOrderValue).toFixed(0)),
      revenueByDay,
      paymentMethodBreakdown: paymentMethods,
    };
  },

  /**
   * Thống kê đơn hàng theo trạng thái
   */
  async getOrderStats(recentLimit) {
    const [stats, recentOrders] = await Promise.all([
      DashboardModel.getOrderStats(),
      DashboardModel.getRecentOrders(recentLimit),
    ]);

    return {
      total: Number(stats.total),
      byStatus: {
        PENDING: Number(stats.pending),
        SHIPPING: Number(stats.shipping),
        COMPLETED: Number(stats.completed),
        CANCELLED: Number(stats.cancelled),
      },
      recentOrders,
    };
  },

  /**
   * Top sản phẩm bán chạy
   */
  async getTopProducts(from, to, limit) {
    return DashboardModel.getTopSellingProducts(from, to, limit);
  },

  /**
   * Sản phẩm tồn kho thấp
   */
  async getLowStockProducts(threshold) {
    return DashboardModel.getLowStockProducts(threshold);
  },

  /**
   * Thống kê nhân sự
   */
  async getHrStats() {
    return DashboardModel.getHrStats();
  },

  /**
   * Thống kê lương theo kỳ
   */
  async getPayrollStats(periodId) {
    const result = await DashboardModel.getPayrollStats(periodId);
    if (!result) {
      const error = new Error("Không tìm thấy kỳ lương");
      error.statusCode = 404;
      throw error;
    }
    return result;
  },

  /**
   * Tổng quan hệ thống (compact)
   */
  async getOverview() {
    return DashboardModel.getOverview();
  },
};

export default DashboardService;
