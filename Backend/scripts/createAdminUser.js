const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boardinghouse', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createAdminUser = async () => {
  try {
    const email = 'jipiv56231@arqsis.com';
    const username = 'admin';
    const password = 'Admin123';
    const role = 'admin';

    const existingAdmin = await User.findOne({ $or: [ { email }, { username } ] });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      return;
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const adminUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

const main = async () => {
  await connectDB();
  await createAdminUser();
  await mongoose.connection.close();
  process.exit(0);
};

main();
