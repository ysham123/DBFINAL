const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
  console.log('🔧 Setting up database for XAMPP...\n');

  try {
    // Connect to MySQL (without database)
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL');

    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS cleaning_services_db');
    console.log('✅ Database "cleaning_services_db" created');

    // Use the database
    await connection.query('USE cleaning_services_db');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await connection.query(schema);
    console.log('✅ Database schema created');

    // Create Anna's account with hashed password
    const password = 'anna123'; // Default password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await connection.query(
      `UPDATE Clients SET password_hash = ? WHERE email = 'anna@cleaningservices.com'`,
      [passwordHash]
    );

    console.log('✅ Anna\'s account configured');
    console.log('\n📧 Anna\'s Login Credentials:');
    console.log('   Email: anna@cleaningservices.com');
    console.log('   Password: anna123');

    // Create a test client
    const testPassword = 'test123';
    const testHash = await bcrypt.hash(testPassword, salt);
    
    await connection.query(
      `INSERT INTO Clients (first_name, last_name, address, phone_number, email, password_hash, credit_card_last4, credit_card_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE email = email`,
      ['John', 'Doe', '456 Main St, City, State', '555-1234', 'john@example.com', testHash, '1234', 'Visa']
    );

    console.log('\n✅ Test client account created');
    console.log('📧 Test Client Login:');
    console.log('   Email: john@example.com');
    console.log('   Password: test123');

    await connection.end();

    console.log('\n🎉 Database setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Start XAMPP MySQL server');
    console.log('2. Run: cd backend && npm start');
    console.log('3. Run: cd frontend && npm start');
    console.log('4. Open: http://localhost:3000');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
