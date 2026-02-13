/**
 * Direct test: Does Baileys generate a QR code?
 * Run: node scripts/test-wa.js
 */
const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, '..', 'wa_sessions', 'test_session');

// Clean start
if (fs.existsSync(testDir)) {
  fs.rmSync(testDir, { recursive: true, force: true });
}
fs.mkdirSync(testDir, { recursive: true });

async function test() {
  console.log('=== Baileys QR Test ===\n');
  console.log('1. Loading auth state...');

  const { state, saveCreds } = await useMultiFileAuthState(testDir);
  console.log('   ✅ Auth state loaded');
  console.log(`   Registered: ${state.creds?.registered || false}\n`);

  console.log('2. Creating socket...');
  const logger = pino({ level: 'warn' });

  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    logger,
    browser: ['Guru Legal Bot', 'Chrome', '4.0.0'],
  });

  console.log('   ✅ Socket created\n');
  console.log('3. Waiting for QR code (up to 30 seconds)...\n');

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    console.log('   📡 Connection update:', JSON.stringify(update, null, 2));

    if (update.qr) {
      console.log('\n   ✅✅✅ QR CODE GENERATED! ✅✅✅');
      console.log(`   QR Length: ${update.qr.length}`);
      console.log(`   QR Preview: ${update.qr.substring(0, 50)}...`);
      console.log('\n   Baileys is working! The issue is in the web integration.');
      console.log('   Press Ctrl+C to exit.\n');
    }

    if (update.connection === 'close') {
      const code = update.lastDisconnect?.error?.output?.statusCode;
      console.log(`\n   ❌ Connection closed. Code: ${code}`);

      // Clean up test session
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
      process.exit(1);
    }
  });

  // Timeout after 30 seconds
  setTimeout(() => {
    console.log('\n   ❌ TIMEOUT: No QR code after 30 seconds.');
    console.log('   This means Baileys cannot connect to WhatsApp servers.');
    console.log('   Check your internet connection.\n');

    // Clean up
    sock.end();
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    process.exit(1);
  }, 30000);
}

test().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
