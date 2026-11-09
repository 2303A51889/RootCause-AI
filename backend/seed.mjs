/**
 * Seed script — creates sample user in MongoDB
 * Run: node backend/seed.mjs
 */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load backend .env
const envPath = path.resolve(__dirname, '.env');
const envFile = readFileSync(envPath, 'utf8');
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  const val = trimmed.slice(idx + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set');
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'User' },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✔️  Connected to MongoDB');

  const sampleEmail = 'email123@gmail.com';
  const samplePassword = 'password123';

  const existing = await User.findOne({ email: sampleEmail });
  if (existing) {
    console.log('ℹ️  Sample user already exists:', sampleEmail);
  } else {
    const passwordHash = await bcrypt.hash(samplePassword, 12);
    await User.create({ name: 'Demo User', email: sampleEmail, password: passwordHash, role: 'Admin' });
    console.log('✅ Sample user created:');
    console.log('   Email:   ', sampleEmail);
    console.log('   Password:', samplePassword);
  }

  await mongoose.disconnect();
  console.log('✔️  Done.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
