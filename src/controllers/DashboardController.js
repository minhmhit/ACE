// Controller Dashboard — xử lý request/response cho các API thống kê
import DashboardService from "../services/DashboardService.js";

/**
 * Helper: lấy khoảng ngày mặc định 30 ngày gần nhất
 */
function getDateRange(query) {
  const to = query.to
    ? new Date(query.to + "T23:59:59")
    : new Date();
  const from = query.from
    ? new Date(query.from + "T00:00:00")
    : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    from: from.toISOString().slice(0, 19).replace("T", " "),
    to: to.toISOString().slice(0, 19).replace("T", " "),
  };
}

const DashboardController = {
  // GET /dashboard/sales?from=&to=
  async getSalesStats(req, res, next) {
    try {
      const { from, to } = getDateRange(req.query);
      const data = await DashboardService.getSalesStats(from, to);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /dashboard/orders?recentLimit=10
  async getOrderStats(req, res, next) {
    try {
      const recentLimit = parseInt(req.query.recentLimit) || 10;
      const data = await DashboardService.getOrderStats(recentLimit);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /dashboard/products/top?from=&to=&limit=10
  async getTopProducts(req, res, next) {
    try {
      const { from, to } = getDateRange(req.query);
      const limit = parseInt(req.query.limit) || 10;
      const data = await DashboardService.getTopProducts(from, to, limit);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /dashboard/products/low-stock?threshold=10
  async getLowStockProducts(req, res, next) {
    try {
      const threshold = parseInt(req.query.threshold) || 10;
      const data = await DashboardService.getLowStockProducts(threshold);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /dashboard/hr
  async getHrStats(req, res, next) {
    try {
      const data = await DashboardService.getHrStats();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /dashboard/payroll?periodId=
  async getPayrollStats(req, res, next) {
    try {
      const periodId = req.query.periodId
        ? parseInt(req.query.periodId)
        : null;
      const data = await DashboardService.getPayrollStats(periodId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /dashboard/overview
  async getOverview(req, res, next) {
    try {
      const data = await DashboardService.getOverview();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};

export default DashboardController;
