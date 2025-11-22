const moment = require('moment');
const userCLTN = require('../../models/users/userDetails');
const productCLTN = require('../../models/admin/productDetails');
const orderCLTN = require('../../models/users/order');

// =======================
// View Admin Dashboard
// =======================
exports.view = async (req, res) => {
  try {
    const recentOrders = await orderCLTN
      .find()
      .sort({ _id: -1 })
      .populate('customer', 'name email');

    const orderCount = recentOrders.length;
    const productCount = await productCLTN.countDocuments();
    const customerCount = await userCLTN.countDocuments();

    // ✅ Calculate total revenue safely
    const totalRevenueAgg = await orderCLTN.aggregate([
      { $match: { delivered: true } }, // using boolean flag
      { $group: { _id: 0, totalRevenue: { $sum: "$finalPrice" } } }
    ]);

    const totalRevenue = (totalRevenueAgg.length > 0)
      ? totalRevenueAgg[0].totalRevenue
      : 0;

    res.render('admin/partials/dashboard', {
      session: req.session.admin || req.session.manager,
      recentOrders,
      moment,
      orderCount,
      customerCount,
      productCount,
      totalRevenue,
      documentTitle: 'Admin Dashboard | LAP4YOU',
      admin: req.admin,
      flash: req.flash(),
    });
  } catch (error) {
    console.log("Error in DashBoard Page : " + error);
  }
};

// =======================
// Chart Data
// =======================
exports.chartData = async (req, res) => {
  try {
    let currentYear = new Date().getFullYear();

    // Monthly order/revenue stats
    const orderData = await orderCLTN.aggregate([
      { $match: { status: "Delivered" } },
      {
        $project: {
          _id: 0,
          totalProducts: "$totalQuantity",
          billAmount: "$finalPrice",
          month: { $month: "$orderedOn" },
          year: { $year: "$orderedOn" }
        }
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalProducts: { $sum: "$totalProducts" },
          totalOrders: { $sum: 1 },
          revenue: { $sum: "$billAmount" },
          avgBillPerOrder: { $avg: "$billAmount" },
        }
      },
      { $match: { "_id.year": currentYear } },
      { $sort: { "_id.month": 1 } },
    ]);

    // Orders grouped by status (last 24 hrs)
    let orders = await orderCLTN.aggregate([
      {
        $match: {
          orderedOn: {
            $gte: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000))
          }
        }
      },
      {
        $group: {
          _id: "$status",
          status: { $sum: 1 },
        }
      },
    ]);

    let inTransit = 0, cancelled = 0, delivered = 0, returnedOrders = 0, refunded = 0;
    orders.forEach(order => {
      if (order._id === "In-transit") inTransit = order.status;
      else if (order._id === "Cancelled") cancelled = order.status;
      else if (order._id === "Delivered") delivered = order.status;
      else if (order._id === "Refunded") refunded = order.status;
      else returnedOrders = order.status;
    });

    res.json({
      data: { orderData, inTransit, delivered, cancelled, returnedOrders, refunded }
    });

  } catch (error) {
    console.log("Error in Chart Data : " + error);
  }
};

// =======================
// Doughnut Chart (period filter)
// =======================
exports.doughNutData = async (req, res) => {
  try {
    const period = parseInt(req.params.id); // e.g., 7 days, 30 days

    let orders = await orderCLTN.aggregate([
      {
        $match: {
          orderedOn: {
            $gte: new Date(Date.now() - (period * 24 * 60 * 60 * 1000))
          }
        }
      },
      {
        $group: {
          _id: "$status",
          status: { $sum: 1 },
        }
      },
    ]);

    let inTransit = 0, cancelled = 0, delivered = 0, returnedOrders = 0, refunded = 0;
    orders.forEach(order => {
      if (order._id === "In-transit") inTransit = order.status;
      else if (order._id === "Cancelled") cancelled = order.status;
      else if (order._id === "Delivered") delivered = order.status;
      else if (order._id === "Refunded") refunded = order.status;
      else returnedOrders = order.status;
    });

    res.json({
      data: { inTransit, cancelled, delivered, returnedOrders, refunded }
    });

  } catch (error) {
    console.log("Error in doughNut Chart : " + error);
  }
};
