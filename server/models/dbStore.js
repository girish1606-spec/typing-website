import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { hashPassword } from '../utils/passwords.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongoConnected = false;

// -------------------------------------------------------------
// Persistent Local JSON Collection Engine (Fallback / Standalone)
// -------------------------------------------------------------
class JsonCollection {
  constructor(filename) {
    this.filePath = path.join(DATA_DIR, `${filename}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]), 'utf-8');
    }
  }

  _read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data || '[]');
    } catch {
      return [];
    }
  }

  _write(records) {
    fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2), 'utf-8');
  }

  async find(query = {}) {
    const records = this._read();
    return records.filter(item => {
      for (const [k, v] of Object.entries(query)) {
        if (v && typeof v === 'object' && v.$regex) {
          const regex = new RegExp(v.$regex, v.$options || '');
          if (!regex.test(item[k])) return false;
        } else if (item[k] !== v) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const results = await this.find(query);
    return results[0] || null;
  }

  async findById(id) {
    const records = this._read();
    return records.find(r => r._id === id || r.id === id) || null;
  }

  async create(data) {
    const records = this._read();
    const doc = {
      _id: data._id || crypto.randomUUID(),
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(doc);
    this._write(records);
    return doc;
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    const records = this._read();
    const index = records.findIndex(r => r._id === id || r.id === id);
    if (index === -1) return null;

    let updatedDoc = { ...records[index] };
    if (update.$set) {
      updatedDoc = { ...updatedDoc, ...update.$set };
    } else {
      updatedDoc = { ...updatedDoc, ...update };
    }
    updatedDoc.updatedAt = new Date().toISOString();
    records[index] = updatedDoc;
    this._write(records);
    return updatedDoc;
  }

  async countDocuments(query = {}) {
    const results = await this.find(query);
    return results.length;
  }

  async deleteOne(query = {}) {
    const records = this._read();
    const index = records.findIndex(item => {
      for (const [k, v] of Object.entries(query)) {
        if (item[k] !== v) return false;
      }
      return true;
    });
    if (index !== -1) {
      records.splice(index, 1);
      this._write(records);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }
}

const localUsers = new JsonCollection('users');
const localPayments = new JsonCollection('payments');
const localTypingResults = new JsonCollection('typing_results');

// -------------------------------------------------------------
// Mongoose Schemas (Used when MongoDB is connected)
// -------------------------------------------------------------
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'developer'], default: 'user' },
  subscriptionStatus: { type: String, enum: ['free', 'pending', 'active', 'expired'], default: 'free' },
  subscriptionExpiresAt: { type: Date, default: null },
  preferences: {
    theme: { type: String, default: 'midnight' },
    mode: { type: String, default: 'dark' },
    soundEnabled: { type: Boolean, default: true },
    soundType: { type: String, default: 'mechanical' },
    soundVolume: { type: Number, default: 70 },
    accentColor: { type: String, default: '#38bdf8' },
    keyShape: { type: String, default: 'rounded' },
    keySize: { type: String, default: 'standard' },
    keySpacing: { type: String, default: 'normal' },
    keyAnimation: { type: String, default: 'press' },
    keyColor: { type: String, default: 'default' },
    borderRadius: { type: String, default: 'rounded-xl' },
    uiDensity: { type: String, default: 'normal' },
    animationIntensity: { type: String, default: 'normal' },
  },
  typingStatistics: {
    testsCompleted: { type: Number, default: 0 },
    totalPracticeTime: { type: Number, default: 0 }, // in seconds
    bestWpm: { type: Number, default: 0 },
    averageWpm: { type: Number, default: 0 },
    bestAccuracy: { type: Number, default: 0 },
    averageAccuracy: { type: Number, default: 0 },
    lastWpm: { type: Number, default: 0 },
  },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
}, { timestamps: true });

const PaymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  amount: { type: Number, default: 1 },
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String, enum: ['upi', 'qr_code'], default: 'upi' },
  userUpiId: { type: String, default: '' },
  transactionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Refunded'], default: 'Pending' },
  refundStatus: { type: String, enum: ['None', 'Requested', 'Initiated', 'Completed', 'Failed'], default: 'None' },
  refundAmount: { type: Number, default: 0 },
  refundReason: { type: String, default: '' },
  refundTransactionId: { type: String, default: '' },
  refundNotes: { type: String, default: '' },
  approvedAt: { type: Date, default: null },
  rejectedAt: { type: Date, default: null },
  refundedAt: { type: Date, default: null },
  reviewerNotes: { type: String, default: '' },
}, { timestamps: true });

const TypingResultSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  wpm: { type: Number, required: true },
  rawWpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  errors: { type: Number, default: 0 },
  correctChars: { type: Number, default: 0 },
  incorrectChars: { type: Number, default: 0 },
  totalChars: { type: Number, default: 0 },
  duration: { type: Number, required: true }, // in seconds
  mode: { type: String, default: '1min' },
  textSnippet: { type: String, default: '' },
}, { timestamps: true, suppressReservedKeysWarning: true });

let MongoUser;
let MongoPayment;
let MongoTypingResult;

try {
  MongoUser = mongoose.model('User', UserSchema);
  MongoPayment = mongoose.model('Payment', PaymentSchema);
  MongoTypingResult = mongoose.model('TypingResult', TypingResultSchema);
} catch {
  // Model already compiled or skipped
}

// -------------------------------------------------------------
// Unified Database Interface (Seamlessly delegates to Mongo or Local)
// -------------------------------------------------------------
export const User = {
  findOne: async (q) => (isMongoConnected ? MongoUser.findOne(q) : localUsers.findOne(q)),
  find: async (q) => (isMongoConnected ? MongoUser.find(q).sort({ createdAt: -1 }) : (await localUsers.find(q)).reverse()),
  findById: async (id) => (isMongoConnected ? MongoUser.findById(id) : localUsers.findById(id)),
  create: async (data) => (isMongoConnected ? MongoUser.create(data) : localUsers.create(data)),
  findByIdAndUpdate: async (id, update, opt) => (isMongoConnected ? MongoUser.findByIdAndUpdate(id, update, { ...opt, new: true }) : localUsers.findByIdAndUpdate(id, update, opt)),
  countDocuments: async (q) => (isMongoConnected ? MongoUser.countDocuments(q) : localUsers.countDocuments(q)),
};

export const Payment = {
  findOne: async (q) => (isMongoConnected ? MongoPayment.findOne(q) : localPayments.findOne(q)),
  find: async (q) => (isMongoConnected ? MongoPayment.find(q).sort({ createdAt: -1 }) : (await localPayments.find(q)).reverse()),
  findById: async (id) => (isMongoConnected ? MongoPayment.findById(id) : localPayments.findById(id)),
  create: async (data) => (isMongoConnected ? MongoPayment.create(data) : localPayments.create(data)),
  findByIdAndUpdate: async (id, update, opt) => (isMongoConnected ? MongoPayment.findByIdAndUpdate(id, update, { ...opt, new: true }) : localPayments.findByIdAndUpdate(id, update, opt)),
  countDocuments: async (q) => (isMongoConnected ? MongoPayment.countDocuments(q) : localPayments.countDocuments(q)),
};

export const TypingResult = {
  find: async (q) => (isMongoConnected ? MongoTypingResult.find(q).sort({ createdAt: -1 }) : (await localTypingResults.find(q)).reverse()),
  create: async (data) => (isMongoConnected ? MongoTypingResult.create(data) : localTypingResults.create(data)),
  countDocuments: async (q) => (isMongoConnected ? MongoTypingResult.countDocuments(q) : localTypingResults.countDocuments(q)),
};

/**
 * Initializes Database Connection & Seeds Developer Admin Account
 */
export async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2000,
      });
      isMongoConnected = true;
      console.log('✅ Connected to MongoDB successfully at:', mongoUri);
    } catch {
      console.log('ℹ️  MongoDB connection unavailable or skipped. Using persistent JSON local storage engine.');
      isMongoConnected = false;
    }
  } else {
    console.log('ℹ️  No MONGODB_URI specified. Using persistent JSON local storage engine.');
    isMongoConnected = false;
  }

  // Seed developer account from environment variables if not present
  await seedDeveloperAccount();
}

/**
 * Ensures the developer/admin account configured in .env exists in the database
 */
async function seedDeveloperAccount() {
  const devEmail = (process.env.DEVELOPER_EMAIL || 'girish@gmail.com').toLowerCase().trim();
  const devPassword = process.env.DEVELOPER_PASSWORD || '1234567890';
  const devName = process.env.DEVELOPER_NAME || 'Girish';

  try {
    const existingDev = await User.findOne({ email: devEmail });
    if (!existingDev) {
      const passwordHash = await hashPassword(devPassword);
      await User.create({
        name: devName,
        email: devEmail,
        passwordHash,
        role: 'developer',
        subscriptionStatus: 'active',
        preferences: {
          theme: 'cyber',
          mode: 'dark',
          soundEnabled: true,
          soundType: 'mechanical',
          soundVolume: 80,
          accentColor: '#eab308',
          keyShape: 'rounded',
          keySize: 'standard',
          keySpacing: 'normal',
          keyAnimation: 'glow',
          keyColor: 'default',
          borderRadius: 'rounded-xl',
          uiDensity: 'normal',
          animationIntensity: 'normal',
        },
        typingStatistics: {
          testsCompleted: 15,
          totalPracticeTime: 900,
          bestWpm: 108,
          averageWpm: 92,
          bestAccuracy: 99.2,
          averageAccuracy: 97.8,
          lastWpm: 95,
        }
      });
      console.log(`🔐 Seeded Developer Admin account: ${devEmail}`);
    }
  } catch (err) {
    console.error('Error seeding developer account:', err);
  }
}
