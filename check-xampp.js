const mysql = require('mysql2/promise');

async function checkXAMPP() {
  console.log('🔍 Checking XAMPP MySQL connection...\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      connectTimeout: 5000
    });

    console.log('✅ SUCCESS! XAMPP MySQL is running and accessible!');
    console.log('✅ Connection successful on localhost:3306');
    console.log('✅ User: root (no password)\n');
    
    await connection.end();

    console.log('👍 You\'re ready to run: node setup-database.js');
    process.exit(0);

  } catch (error) {
    console.error('❌ CANNOT CONNECT TO XAMPP MySQL!\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('📋 Problem: MySQL server is not running\n');
      console.log('🔧 Solution:');
      console.log('   1. Open XAMPP Control Panel');
      console.log('   2. Click START next to MySQL');
      console.log('   3. Wait for green "Running" status');
      console.log('   4. Run this check again: node check-xampp.js\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('📋 Problem: Access denied (wrong password)\n');
      console.log('🔧 Solution:');
      console.log('   1. Open backend/.env file');
      console.log('   2. Check DB_PASSWORD setting');
      console.log('   3. XAMPP default is empty password\n');
    } else {
      console.log('📋 Error:', error.message);
    }
    
    process.exit(1);
  }
}

checkXAMPP();
