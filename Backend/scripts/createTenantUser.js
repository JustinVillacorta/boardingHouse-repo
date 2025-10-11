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

const createTenantUser = async () => {
  try {
    const email = 'jipiv56231@arqsis.com';
    const username = 'tenant1';
    const password = 'Tenant123';
    const role = 'tenant';

    const existingTenant = await User.findOne({ $or: [ { email }, { username } ] });
    if (existingTenant) {
      console.log('Tenant user already exists!');
      return;
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const tenantUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await tenantUser.save();
    console.log('Tenant user created successfully!');
  } catch (error) {
    console.error('Error creating tenant user:', error);
  }
};

const main = async () => {
  await connectDB();
  await createTenantUser();
  await mongoose.connection.close();
  process.exit(0);
};

main();
