#!/usr/bin/env node

/**
 * Quick script to create an admin user
 * Usage: node scripts/create-user.js
 */

const readline = require('readline');
const http = require('http');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function createUser() {
  console.log('\n🔐 Guru Legal - Create User\n');

  const name = await question('Enter name: ');
  const email = await question('Enter email: ');
  const password = await question('Enter password: ');

  if (!name || !email || !password) {
    console.error('\n❌ All fields are required!');
    rl.close();
    process.exit(1);
  }

  const postData = JSON.stringify({
    name,
    email,
    password
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);

        if (res.statusCode === 201) {
          console.log('\n✅ User created successfully!');
          console.log(`📧 Email: ${response.user.email}`);
          console.log(`👤 Name: ${response.user.name}`);
          console.log(`🔑 Token: ${response.token.substring(0, 20)}...`);
          console.log('\n🎉 You can now login at http://localhost:5174/\n');
        } else {
          console.error(`\n❌ Error: ${response.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('\n❌ Failed to parse response:', data);
      }

      rl.close();
    });
  });

  req.on('error', (err) => {
    console.error('\n❌ Request failed:', err.message);
    console.log('💡 Make sure the backend server is running on port 3000');
    rl.close();
  });

  req.write(postData);
  req.end();
}

createUser();
