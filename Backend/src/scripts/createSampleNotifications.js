const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boardinghouse', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import models
const User = require('../models/User');
const Notification = require('../models/Notification');

// Sample notification data
const notificationTypes = ['payment_due', 'report_update', 'system_alert', 'maintenance', 'announcement', 'lease_reminder', 'other'];

const sampleNotifications = [
  {
    title: 'Monthly Rent Due',
    message: 'Your monthly rent of ₱15,000 is due on December 1st, 2024. Please ensure payment is made on time to avoid late fees.',
    type: 'payment_due',
    metadata: {
      amount: 15000,
      dueDate: '2024-12-01',
      roomNumber: '101'
    }
  },
  {
    title: 'Maintenance Request Update',
    message: 'Your maintenance request for "Leaky Faucet" has been updated to "In Progress". Our maintenance team will fix it tomorrow.',
    type: 'report_update',
    metadata: {
      reportId: 'REP001',
      status: 'in-progress',
      reportTitle: 'Leaky Faucet'
    }
  },
  {
    title: 'System Maintenance Notice',
    message: 'The building management system will undergo maintenance on December 5th from 2:00 AM to 6:00 AM. Some services may be temporarily unavailable.',
    type: 'system_alert',
    metadata: {
      maintenanceDate: '2024-12-05',
      startTime: '02:00',
      endTime: '06:00'
    }
  },
  {
    title: 'Air Conditioning Maintenance',
    message: 'Scheduled air conditioning maintenance for your floor will take place tomorrow. Please ensure your room is accessible.',
    type: 'maintenance',
    metadata: {
      floor: 3,
      scheduledDate: '2024-11-25'
    }
  },
  {
    title: 'Holiday Schedule Announcement',
    message: 'The building office will be closed on December 25th and January 1st. Emergency contacts remain available 24/7.',
    type: 'announcement',
    metadata: {
      holidays: ['2024-12-25', '2025-01-01']
    }
  },
  {
    title: 'Lease Renewal Reminder',
    message: 'Your lease agreement expires in 30 days. Please contact the office to discuss renewal options.',
    type: 'lease_reminder',
    metadata: {
      leaseEndDate: '2025-01-15',
      daysRemaining: 30
    }
  },
  {
    title: 'Internet Upgrade Available',
    message: 'High-speed internet upgrade is now available for your unit. Contact management for more details and pricing.',
    type: 'other',
    metadata: {
      service: 'internet',
      upgrade: 'high-speed'
    }
  },
  {
    title: 'Utility Bill Due',
    message: 'Your utility bill of ₱3,500 for electricity and water is due on November 30th.',
    type: 'payment_due',
    metadata: {
      amount: 3500,
      dueDate: '2024-11-30',
      utilities: ['electricity', 'water']
    }
  },
  {
    title: 'Noise Complaint Resolution',
    message: 'Your noise complaint has been resolved. We spoke with the neighboring tenant and the issue should not recur.',
    type: 'report_update',
    metadata: {
      reportId: 'REP002',
      status: 'resolved',
      reportTitle: 'Noise Complaint'
    }
  },
  {
    title: 'Fire Drill Announcement',
    message: 'A fire drill will be conducted on December 3rd at 10:00 AM. Please participate and follow evacuation procedures.',
    type: 'announcement',
    metadata: {
      drillDate: '2024-12-03',
      drillTime: '10:00'
    }
  },
  {
    title: 'Elevator Maintenance',
    message: 'Elevator maintenance will be performed on November 28th from 9:00 AM to 3:00 PM. Please use the stairs.',
    type: 'maintenance',
    metadata: {
      maintenanceDate: '2024-11-28',
      startTime: '09:00',
      endTime: '15:00',
      equipment: 'elevator'
    }
  },
  {
    title: 'Security Deposit Refund',
    message: 'Your security deposit refund of ₱25,000 has been processed and will be transferred to your account within 3-5 business days.',
    type: 'other',
    metadata: {
      amount: 25000,
      refundType: 'security_deposit',
      processingDays: '3-5'
    }
  }
];

async function createSampleNotifications() {
  try {
    console.log('Creating sample notifications...');

    // Get all users to assign notifications to
    const users = await User.find();
    
    if (users.length === 0) {
      console.log('No users found. Please create some users first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} users`);

    // Clear existing notifications
    await Notification.deleteMany({});
    console.log('Cleared existing notifications');

    const notifications = [];

    // Create notifications for each user
    for (const user of users) {
      // Each user gets 3-5 notifications
      const notificationCount = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < notificationCount; i++) {
        const sampleNotification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
        
        const notification = {
          user_id: user._id,
          title: sampleNotification.title,
          message: sampleNotification.message,
          type: sampleNotification.type,
          status: Math.random() > 0.3 ? 'unread' : 'read', // 70% unread, 30% read
          metadata: sampleNotification.metadata,
          expiresAt: Math.random() > 0.7 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null, // 30% have expiry
          createdBy: null,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random date within last 7 days
        };

        notifications.push(notification);
      }
    }

    // Add some system-wide notifications (created by admin)
    const adminUser = users.find(u => u.role === 'admin');
    if (adminUser) {
      for (const user of users) {
        if (user.role === 'tenant') {
          // System announcements for all tenants
          notifications.push({
            user_id: user._id,
            title: 'Building Wi-Fi Password Update',
            message: 'The building Wi-Fi password has been updated for security. New password: BoardingHouse2024! Please update your devices.',
            type: 'announcement',
            status: 'unread',
            metadata: {
              newPassword: 'BoardingHouse2024!',
              updateDate: new Date().toISOString().split('T')[0]
            },
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Expires in 14 days
            createdBy: adminUser._id,
          });

          // Payment reminders
          if (Math.random() > 0.5) {
            notifications.push({
              user_id: user._id,
              title: 'Payment Reminder',
              message: 'This is a friendly reminder that your rent payment is due in 3 days. Please pay on time to avoid late fees.',
              type: 'payment_due',
              status: 'unread',
              metadata: {
                amount: Math.floor(Math.random() * 10000) + 10000, // Random amount between 10k-20k
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                daysRemaining: 3
              },
              createdBy: adminUser._id,
            });
          }
        }
      }
    }

    // Insert all notifications
    const result = await Notification.insertMany(notifications);
    console.log(`Successfully created ${result.length} sample notifications`);

    // Print statistics
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
          byType: {
            $push: '$type'
          }
        }
      }
    ]);

    if (stats.length > 0) {
      const stat = stats[0];
      const typeCount = {};

      stat.byType.forEach(type => {
        typeCount[type] = (typeCount[type] || 0) + 1;
      });

      console.log('\nNotification Statistics:');
      console.log('Total:', stat.total);
      console.log('Unread:', stat.unread);
      console.log('Read:', stat.read);
      console.log('By Type:', typeCount);
    }

    console.log('\nSample notifications created successfully!');
    
  } catch (error) {
    console.error('Error creating sample notifications:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
createSampleNotifications();