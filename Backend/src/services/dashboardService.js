const tenantRepository = require('../repositories/tenantRepository');
const roomRepository = require('../repositories/roomRepository');
const paymentRepository = require('../repositories/paymentRepository');
const reportRepository = require('../repositories/reportRepository');
const notificationRepository = require('../repositories/notificationRepository');

// Import models directly for simpler queries
const Room = require('../models/Room');
const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');
const Report = require('../models/Report');

class DashboardService {
  // Get general dashboard statistics
  async getDashboardStats() {
    try {
      console.log('Starting dashboard stats...');
      
      const [
        tenantStats,
        roomStats,
        paymentStats,
        reportStats,
        notificationStats
      ] = await Promise.all([
        this.getTenantStats(),
        this.getRoomStats(),
        this.getPaymentStats(),
        this.getReportStats(),
        notificationRepository.getNotificationStats()
      ]);

      console.log('Dashboard stats completed');

      return {
        tenants: tenantStats,
        rooms: roomStats,
        payments: paymentStats,
        reports: reportStats,
        notifications: notificationStats,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  }

  // Get room occupancy data (frontend-compatible format)
  async getRoomOccupancyData() {
    try {
      const rooms = await Room.find({ isActive: true }).lean();
      const tenants = await Tenant.find({}).lean();

      const occupancyData = {
        totalRooms: rooms.length,
        occupiedRooms: 0,
        availableRooms: 0,
        maintenanceRooms: 0,
        occupancyRate: 0,
        // Frontend expects pie chart data format
        chartData: [],
        roomTypes: {},
        roomDetails: [],
      };

      // Count rooms by status
      rooms.forEach(room => {
        switch (room.status) {
          case 'occupied':
            occupancyData.occupiedRooms++;
            break;
          case 'available':
            occupancyData.availableRooms++;
            break;
          case 'maintenance':
            occupancyData.maintenanceRooms++;
            break;
        }

        // Count by room type
        if (!occupancyData.roomTypes[room.roomType]) {
          occupancyData.roomTypes[room.roomType] = {
            total: 0,
            occupied: 0,
            available: 0,
            maintenance: 0,
          };
        }
        occupancyData.roomTypes[room.roomType].total++;
        occupancyData.roomTypes[room.roomType][room.status]++;

        // Find tenant for this room
        const roomTenant = tenants.find(tenant => tenant.roomNumber?.toString() === room.roomNumber?.toString());

        occupancyData.roomDetails.push({
          roomId: room._id,
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          capacity: room.capacity,
          status: room.status,
          monthlyRent: room.monthlyRent,
          tenant: roomTenant ? {
            id: roomTenant._id,
            name: `${roomTenant.firstName} ${roomTenant.lastName}`,
            phoneNumber: roomTenant.phoneNumber,
            leaseStartDate: roomTenant.leaseStartDate,
            leaseEndDate: roomTenant.leaseEndDate,
          } : null,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        });
      });

      // Calculate occupancy rate
      if (occupancyData.totalRooms > 0) {
        occupancyData.occupancyRate = Math.round(
          (occupancyData.occupiedRooms / occupancyData.totalRooms) * 100
        );
      }

      // Format data for frontend pie chart (matches mainFrame.tsx expected format)
      occupancyData.chartData = [
        { 
          name: "Occupied", 
          value: occupancyData.occupiedRooms, 
          color: "#899effff" 
        },
        { 
          name: "Vacant", 
          value: occupancyData.availableRooms, 
          color: "#ff7575ff" 
        }
      ];

      return occupancyData;
    } catch (error) {
      throw error;
    }
  }

  // Get payment statistics
  async getPaymentStatistics() {
    try {
      console.log('Starting payment statistics...');
      const currentDate = new Date();
      const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const currentYear = new Date(currentDate.getFullYear(), 0, 1);

      const paymentsResult = await Payment.find({}).lean();
      console.log('Payments result:', paymentsResult);
      
      const payments = paymentsResult || [];
      console.log('Found payments:', payments.length);

      const stats = {
        total: {
          count: payments.length,
          amount: Array.isArray(payments) ? payments.reduce((sum, payment) => sum + (payment.amount || 0), 0) : 0,
        },
        thisMonth: {
          count: 0,
          amount: 0,
        },
        lastMonth: {
          count: 0,
          amount: 0,
        },
        thisYear: {
          count: 0,
          amount: 0,
        },
        byStatus: {
          paid: { count: 0, amount: 0 },
          pending: { count: 0, amount: 0 },
          overdue: { count: 0, amount: 0 },
        },
        byMethod: {},
        monthlyTrends: [],
        overduePayments: [],
      };

      if (Array.isArray(payments)) {
        payments.forEach(payment => {
        const paymentDate = new Date(payment.paymentDate || payment.createdAt);
        
        // Monthly stats
        if (paymentDate >= currentMonth) {
          stats.thisMonth.count++;
          stats.thisMonth.amount += payment.amount;
        }
        
        if (paymentDate >= lastMonth && paymentDate < currentMonth) {
          stats.lastMonth.count++;
          stats.lastMonth.amount += payment.amount;
        }
        
        // Yearly stats
        if (paymentDate >= currentYear) {
          stats.thisYear.count++;
          stats.thisYear.amount += payment.amount;
        }

        // By status
        stats.byStatus[payment.status].count++;
        stats.byStatus[payment.status].amount += payment.amount;

        // By payment method
        if (!stats.byMethod[payment.paymentMethod]) {
          stats.byMethod[payment.paymentMethod] = { count: 0, amount: 0 };
        }
        stats.byMethod[payment.paymentMethod].count++;
        stats.byMethod[payment.paymentMethod].amount += payment.amount;

        // Overdue payments
        if (payment.status === 'overdue') {
          stats.overduePayments.push({
            id: payment._id,
            tenantId: payment.tenant,
            amount: payment.amount,
            dueDate: payment.dueDate,
            daysPastDue: Math.floor((currentDate - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24)),
          });
        }
        });
      }

      // Generate monthly trends for the last 4 months (matches frontend chart)
      for (let i = 3; i >= 0; i--) {
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
        
        const monthPayments = payments.filter(payment => {
          const paymentDate = new Date(payment.paymentDate || payment.createdAt);
          return paymentDate >= monthDate && paymentDate < nextMonthDate;
        });

        const paidPayments = monthPayments.filter(p => p.status === 'paid');
        const overduePayments = monthPayments.filter(p => p.status === 'overdue');

        stats.monthlyTrends.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          collected: paidPayments.reduce((sum, payment) => sum + payment.amount, 0),
          overdue: overduePayments.reduce((sum, payment) => sum + payment.amount, 0),
          count: monthPayments.length,
          paid: paidPayments.length,
          pending: monthPayments.filter(p => p.status === 'pending').length,
          overdueCount: overduePayments.length,
        });
      }

      console.log('Payment stats completed');
      return stats;
    } catch (error) {
      console.error('Payment statistics error:', error);
      throw error;
    }
  }

  // Get report statistics
  async getReportStatistics() {
    try {
      const reports = await Report.find({}).lean();
      const currentDate = new Date();
      const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      const stats = {
        total: reports.length,
        thisMonth: reports.filter(report => new Date(report.submittedAt) >= currentMonth).length,
        byStatus: {
          pending: 0,
          'in-progress': 0,
          resolved: 0,
          rejected: 0,
        },
        byType: {
          maintenance: 0,
          complaint: 0,
          other: 0,
        },
        averageResolutionTime: 0,
        priorityBreakdown: [],
        recentReports: [],
        monthlyTrends: [],
      };

      let totalResolutionTime = 0;
      let resolvedCount = 0;

      reports.forEach(report => {
        // By status
        stats.byStatus[report.status]++;

        // By type
        stats.byType[report.type]++;

        // Calculate resolution time for resolved reports
        if (report.status === 'resolved' && report.resolvedAt) {
          const resolutionTime = new Date(report.resolvedAt) - new Date(report.submittedAt);
          totalResolutionTime += resolutionTime;
          resolvedCount++;
        }

        // Recent reports (last 10)
        if (stats.recentReports.length < 10) {
          stats.recentReports.push({
            id: report._id,
            title: report.title,
            type: report.type,
            status: report.status,
            submittedAt: report.submittedAt,
            tenantId: report.tenant,
          });
        }
      });

      // Calculate average resolution time in days
      if (resolvedCount > 0) {
        stats.averageResolutionTime = Math.round(
          totalResolutionTime / resolvedCount / (1000 * 60 * 60 * 24)
        );
      }

      // Sort recent reports by submission date
      stats.recentReports.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      // Generate monthly trends for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
        
        const monthReports = reports.filter(report => {
          const reportDate = new Date(report.submittedAt);
          return reportDate >= monthDate && reportDate < nextMonthDate;
        });

        stats.monthlyTrends.push({
          month: monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          total: monthReports.length,
          pending: monthReports.filter(r => r.status === 'pending').length,
          inProgress: monthReports.filter(r => r.status === 'in-progress').length,
          resolved: monthReports.filter(r => r.status === 'resolved').length,
          rejected: monthReports.filter(r => r.status === 'rejected').length,
        });
      }

      return stats;
    } catch (error) {
      throw error;
    }
  }

  // Private helper methods
  async getTenantStats() {
    try {
      const tenants = await Tenant.find({}).lean();
      
      const stats = {
        total: tenants.length,
        active: tenants.filter(t => t.tenantStatus === 'active').length,
        inactive: tenants.filter(t => t.tenantStatus === 'inactive').length,
        expiringLeases: 0,
      };

      // Count expiring leases (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      stats.expiringLeases = tenants.filter(tenant => 
        tenant.leaseEndDate && 
        new Date(tenant.leaseEndDate) <= thirtyDaysFromNow &&
        new Date(tenant.leaseEndDate) >= new Date()
      ).length;

      return stats;
    } catch (error) {
      throw error;
    }
  }

  async getRoomStats() {
    try {
      const rooms = await Room.find({ isActive: true }).lean();
      
      const stats = {
        total: rooms.length,
        occupied: rooms.filter(r => r.status === 'occupied').length,
        available: rooms.filter(r => r.status === 'available').length,
        maintenance: rooms.filter(r => r.status === 'maintenance').length,
      };

      stats.occupancyRate = stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0;

      return stats;
    } catch (error) {
      throw error;
    }
  }

  async getPaymentStats() {
    try {
      const payments = await Payment.find({}).lean();
      const currentDate = new Date();
      
      const stats = {
        total: payments.length,
        paid: payments.filter(p => p.status === 'paid').length,
        pending: payments.filter(p => p.status === 'pending').length,
        overdue: payments.filter(p => p.status === 'overdue').length,
        totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
        thisMonthAmount: 0,
      };

      // Calculate this month's payments
      const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      stats.thisMonthAmount = payments
        .filter(payment => new Date(payment.paymentDate || payment.createdAt) >= thisMonth)
        .reduce((sum, payment) => sum + payment.amount, 0);

      return stats;
    } catch (error) {
      throw error;
    }
  }

  async getReportStats() {
    try {
      const reports = await Report.find({}).lean();
      
      const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        inProgress: reports.filter(r => r.status === 'in-progress').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        rejected: reports.filter(r => r.status === 'rejected').length,
      };

      return stats;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new DashboardService();