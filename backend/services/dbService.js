import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/store.json');

// 1. Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('your-supabase'));
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

// 2. MongoDB Atlas Configuration
const mongoUri = process.env.MONGODB_URI;
const isMongoConfigured = Boolean(mongoUri && mongoUri.trim().length > 10);

let isMongoConnected = false;

// Define Mongoose Schemas if Mongo is configured
let MongoModels = {};

if (isMongoConfigured) {
  try {
    mongoose.connect(mongoUri)
      .then(() => {
        isMongoConnected = true;
        console.log('[DB Service] Storage Engine: Connected to MongoDB Atlas Cloud Database');
      })
      .catch((err) => {
        console.error('[DB Service] MongoDB Atlas connection error:', err.message);
      });

    const userSchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      email: { type: String, required: true },
      full_name: String,
      avatar_url: String,
      google_id: String,
      currency: { type: String, default: 'INR' },
      created_at: { type: Date, default: Date.now }
    });

    const billSchema = new mongoose.Schema({
      id: { type: String, required: true },
      user_id: { type: String, required: true },
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      category: { type: String, default: 'Custom' },
      due_date: { type: String, required: true },
      is_recurring: { type: Boolean, default: false },
      recurrence_frequency: { type: String, default: 'monthly' },
      payment_method: { type: String, default: 'UPI / Card' },
      notes: String,
      reminder_date: String,
      status: { type: String, default: 'upcoming' },
      last_paid_at: String,
      created_at: { type: Date, default: Date.now }
    });

    const checklistItemSchema = new mongoose.Schema({
      id: { type: String, required: true },
      checklist_id: { type: String, required: true },
      user_id: { type: String, required: true },
      category: { type: String, default: 'General' },
      title: { type: String, required: true },
      is_completed: { type: Boolean, default: false },
      sort_order: { type: Number, default: 0 },
      created_at: { type: Date, default: Date.now }
    });

    const checklistSchema = new mongoose.Schema({
      id: { type: String, required: true },
      user_id: { type: String, required: true },
      title: { type: String, required: true },
      description: String,
      category: { type: String, default: 'General' },
      deadline: String,
      is_archived: { type: Boolean, default: false },
      is_ai_generated: { type: Boolean, default: false },
      created_at: { type: Date, default: Date.now }
    });

    const taskSchema = new mongoose.Schema({
      id: { type: String, required: true },
      user_id: { type: String, required: true },
      title: { type: String, required: true },
      description: String,
      due_date: String,
      priority: { type: String, default: 'medium' },
      category: { type: String, default: 'General' },
      is_completed: { type: Boolean, default: false },
      completed_at: String,
      created_at: { type: Date, default: Date.now }
    });

    const reminderSchema = new mongoose.Schema({
      id: { type: String, required: true },
      user_id: { type: String, required: true },
      title: { type: String, required: true },
      reminder_date: { type: String, required: true },
      reminder_time: { type: String, default: '09:00:00' },
      repeat_frequency: { type: String, default: 'none' },
      notes: String,
      is_dismissed: { type: Boolean, default: false },
      created_at: { type: Date, default: Date.now }
    });

    MongoModels = {
      User: mongoose.models.User || mongoose.model('User', userSchema),
      Bill: mongoose.models.Bill || mongoose.model('Bill', billSchema),
      Checklist: mongoose.models.Checklist || mongoose.model('Checklist', checklistSchema),
      ChecklistItem: mongoose.models.ChecklistItem || mongoose.model('ChecklistItem', checklistItemSchema),
      Task: mongoose.models.Task || mongoose.model('Task', taskSchema),
      Reminder: mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema)
    };
  } catch (err) {
    console.error('[DB Service] Error setting up Mongoose models:', err);
  }
}

if (!isSupabaseConfigured && !isMongoConfigured) {
  console.log('[DB Service] Storage Engine: Local JSON Persistent Store (Demo Mode)');
}

// Helper to seed initial demo data
const getInitialSeedData = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

  const dueDate15 = `${currentYear}-${currentMonth}-15`;
  const dueDate20 = `${currentYear}-${currentMonth}-20`;
  const dueDate01 = `${currentYear}-${currentMonth}-01`;
  const dueDate25 = `${currentYear}-${currentMonth}-25`;
  const dueDate10 = `${currentYear}-${currentMonth}-10`;
  const todayStr = now.toISOString().split('T')[0];

  return {
    users: [
      {
        id: 'demo-user-123',
        email: 'demo@planora.app',
        full_name: 'Alex Morgan',
        currency: 'INR',
        created_at: new Date().toISOString()
      }
    ],
    bills: [
      {
        id: 'b-1',
        user_id: 'demo-user-123',
        name: 'Wi-Fi',
        amount: 825,
        category: 'Wi-Fi',
        due_date: dueDate15,
        is_recurring: true,
        recurrence_frequency: 'monthly',
        payment_method: 'UPI / GPay',
        notes: 'Airtel Broadband Fiber plan 200Mbps',
        reminder_date: `${currentYear}-${currentMonth}-14`,
        status: 'upcoming',
        created_at: new Date().toISOString()
      },
      {
        id: 'b-2',
        user_id: 'demo-user-123',
        name: 'Mobile Recharge',
        amount: 399,
        category: 'Mobile recharge',
        due_date: dueDate20,
        is_recurring: true,
        recurrence_frequency: 'monthly',
        payment_method: 'Paytm',
        notes: 'Jio 84 days pack installment',
        reminder_date: `${currentYear}-${currentMonth}-19`,
        status: 'upcoming',
        created_at: new Date().toISOString()
      },
      {
        id: 'b-3',
        user_id: 'demo-user-123',
        name: 'House Rent',
        amount: 15000,
        category: 'Rent',
        due_date: dueDate01,
        is_recurring: true,
        recurrence_frequency: 'monthly',
        payment_method: 'Bank Transfer',
        notes: 'Transfer to Landlord Account',
        status: 'paid',
        last_paid_at: `${currentYear}-${currentMonth}-01T10:00:00.000Z`,
        created_at: new Date().toISOString()
      },
      {
        id: 'b-4',
        user_id: 'demo-user-123',
        name: 'Netflix Subscription',
        amount: 649,
        category: 'Subscription',
        due_date: dueDate25,
        is_recurring: true,
        recurrence_frequency: 'monthly',
        payment_method: 'Credit Card',
        notes: '4K Ultra HD Premium Plan',
        status: 'upcoming',
        created_at: new Date().toISOString()
      },
      {
        id: 'b-5',
        user_id: 'demo-user-123',
        name: 'Electricity Bill',
        amount: 1250,
        category: 'Electricity bill',
        due_date: todayStr,
        is_recurring: true,
        recurrence_frequency: 'monthly',
        payment_method: 'Auto-debit / UPI',
        notes: 'State Power Meter Account #49281',
        status: 'due_today',
        created_at: new Date().toISOString()
      },
      {
        id: 'b-6',
        user_id: 'demo-user-123',
        name: 'HDFC Credit Card',
        amount: 12450,
        category: 'Credit card',
        due_date: todayStr,
        is_recurring: false,
        payment_method: 'NetBanking',
        notes: 'Minimum due ₹1,500. Total ₹12,450',
        status: 'due_today',
        created_at: new Date().toISOString()
      }
    ],
    checklists: [
      {
        id: 'c-1',
        user_id: 'demo-user-123',
        title: 'Shimla Trip',
        description: '3-day family vacation checklist',
        category: 'Travel',
        deadline: `${currentYear}-${currentMonth}-28`,
        is_archived: false,
        is_ai_generated: true,
        created_at: new Date().toISOString()
      }
    ],
    checklist_items: [
      { id: 'ci-1', checklist_id: 'c-1', user_id: 'demo-user-123', category: '🧳 Packing', title: 'Warm Clothes & Sweaters', is_completed: true, sort_order: 1 },
      { id: 'ci-2', checklist_id: 'c-1', user_id: 'demo-user-123', category: '🧳 Packing', title: 'Heavy Jacket', is_completed: true, sort_order: 2 },
      { id: 'ci-3', checklist_id: 'c-1', user_id: 'demo-user-123', category: '🧳 Packing', title: 'Comfortable Walking Shoes', is_completed: true, sort_order: 3 },
      { id: 'ci-4', checklist_id: 'c-1', user_id: 'demo-user-123', category: '🧳 Packing', title: 'Thermal Innerwear', is_completed: true, sort_order: 4 },
      { id: 'ci-5', checklist_id: 'c-1', user_id: 'demo-user-123', category: '🧳 Packing', title: 'Woolen Gloves & Cap', is_completed: false, sort_order: 5 },
      { id: 'ci-6', checklist_id: 'c-1', user_id: 'demo-user-123', category: '📄 Documents', title: 'Aadhaar / Gov ID Cards', is_completed: true, sort_order: 6 },
      { id: 'ci-7', checklist_id: 'c-1', user_id: 'demo-user-123', category: '📄 Documents', title: 'Driving Licence', is_completed: true, sort_order: 7 },
      { id: 'ci-8', checklist_id: 'c-1', user_id: 'demo-user-123', category: '📄 Documents', title: 'Hotel Booking Vouchers', is_completed: true, sort_order: 8 },
      { id: 'ci-9', checklist_id: 'c-1', user_id: 'demo-user-123', category: '🔌 Electronics', title: 'Mobile Chargers & Cables', is_completed: true, sort_order: 9 },
      { id: 'ci-10', checklist_id: 'c-1', user_id: 'demo-user-123', category: '🔌 Electronics', title: '20,000mAh Power Bank', is_completed: true, sort_order: 10 },
      { id: 'ci-11', checklist_id: 'c-1', user_id: 'demo-user-123', category: '🔌 Electronics', title: 'DSLR Camera & Extra Memory Card', is_completed: false, sort_order: 11 },
      { id: 'ci-12', checklist_id: 'c-1', user_id: 'demo-user-123', category: '💊 Personal & Health', title: 'First Aid Kit & Motion Sickness Pills', is_completed: true, sort_order: 12 },
      { id: 'ci-13', checklist_id: 'c-1', user_id: 'demo-user-123', category: '💊 Personal & Health', title: 'Regular Prescription Medicines', is_completed: true, sort_order: 13 },
      { id: 'ci-14', checklist_id: 'c-1', user_id: 'demo-user-123', category: '💊 Personal & Health', title: 'Moisturizer & Cold Cream', is_completed: false, sort_order: 14 },
      { id: 'ci-15', checklist_id: 'c-1', user_id: 'demo-user-123', category: '🚗 Car & Vehicle', title: 'Check Vehicle Oil & Coolant', is_completed: true, sort_order: 15 },
      { id: 'ci-16', checklist_id: 'c-1', user_id: 'demo-user-123', category: '🚗 Car & Vehicle', title: 'Check Tyre Pressure & Spare Tyre', is_completed: false, sort_order: 16 },
      { id: 'ci-17', checklist_id: 'c-1', user_id: 'demo-user-123', category: '🚗 Car & Vehicle', title: 'FASTag Recharge', is_completed: false, sort_order: 17 },
      { id: 'ci-18', checklist_id: 'c-1', user_id: 'demo-user-123', category: '🚗 Car & Vehicle', title: 'Car Cleaning & Wiper Fluid', is_completed: false, sort_order: 18 }
    ],
    tasks: [
      {
        id: 't-1',
        user_id: 'demo-user-123',
        title: 'Buy medicines',
        description: 'Paracetamol, vitamins and prescribed allergy pills',
        due_date: todayStr,
        priority: 'high',
        category: 'Health',
        is_completed: false,
        created_at: new Date().toISOString()
      },
      {
        id: 't-2',
        user_id: 'demo-user-123',
        title: 'Call electrician for kitchen light',
        description: 'Fix the flickering LED panel in main kitchen',
        due_date: todayStr,
        priority: 'medium',
        category: 'Home',
        is_completed: false,
        created_at: new Date().toISOString()
      },
      {
        id: 't-3',
        user_id: 'demo-user-123',
        title: 'Book resort for Shimla trip',
        description: 'Confirm 2 rooms for 3 nights with breakfast inclusion',
        due_date: `${currentYear}-${currentMonth}-18`,
        priority: 'high',
        category: 'Travel',
        is_completed: true,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    ],
    reminders: [
      {
        id: 'r-1',
        user_id: 'demo-user-123',
        title: 'Renew car insurance',
        reminder_date: todayStr,
        reminder_time: '18:00:00',
        repeat_frequency: 'yearly',
        notes: 'Policy #83921 renewal due before expiration',
        is_dismissed: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'r-2',
        user_id: 'demo-user-123',
        title: 'Submit monthly expense report',
        reminder_date: `${currentYear}-${currentMonth}-28`,
        reminder_time: '10:00:00',
        repeat_frequency: 'monthly',
        notes: 'Compile receipts for office reimbursement',
        is_dismissed: false,
        created_at: new Date().toISOString()
      }
    ],
    settings: {
      user_id: 'demo-user-123',
      currency: 'INR',
      notifications_enabled: true,
      default_reminder_days: 1,
      appearance: 'light'
    }
  };
};

const ensureLocalDataFile = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const seed = getInitialSeedData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
  }
};

const readLocalData = () => {
  ensureLocalDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return getInitialSeedData();
  }
};

const writeLocalData = (data) => {
  ensureLocalDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Seed Mongo if empty on first connect
const seedMongoIfEmpty = async (userId = 'demo-user-123') => {
  if (!isMongoConnected) return;
  try {
    const count = await MongoModels.Bill.countDocuments({ user_id: userId });
    if (count === 0) {
      const seed = getInitialSeedData();
      await MongoModels.Bill.insertMany(seed.bills);
      await MongoModels.Checklist.insertMany(seed.checklists);
      await MongoModels.ChecklistItem.insertMany(seed.checklist_items);
      await MongoModels.Task.insertMany(seed.tasks);
      await MongoModels.Reminder.insertMany(seed.reminders);
      console.log('[DB Service] Seeded initial dataset into MongoDB Atlas');
    }
  } catch (err) {
    console.warn('[DB Service] Mongo Seed check error:', err.message);
  }
};

// Standardized DB Abstraction Layer
export const db = {
  isSupabase: isSupabaseConfigured,
  isMongo: isMongoConfigured,

  resetDemoData: async () => {
    if (isMongoConfigured && isMongoConnected) {
      const seed = getInitialSeedData();
      await MongoModels.Bill.deleteMany({});
      await MongoModels.Checklist.deleteMany({});
      await MongoModels.ChecklistItem.deleteMany({});
      await MongoModels.Task.deleteMany({});
      await MongoModels.Reminder.deleteMany({});

      await MongoModels.Bill.insertMany(seed.bills);
      await MongoModels.Checklist.insertMany(seed.checklists);
      await MongoModels.ChecklistItem.insertMany(seed.checklist_items);
      await MongoModels.Task.insertMany(seed.tasks);
      await MongoModels.Reminder.insertMany(seed.reminders);
      return { success: true, message: 'Reset MongoDB Atlas dataset' };
    }
    const seed = getInitialSeedData();
    writeLocalData(seed);
    return { success: true, data: seed };
  },

  // --- USER AUTH ---
  upsertUser: async (userData) => {
    if (isMongoConfigured && isMongoConnected) {
      const user = await MongoModels.User.findOneAndUpdate(
        { email: userData.email },
        { ...userData },
        { upsert: true, new: true }
      );
      return user ? user.toObject() : userData;
    }
    const store = readLocalData();
    store.users = store.users || [];
    const index = store.users.findIndex(u => u.email === userData.email);
    if (index >= 0) {
      store.users[index] = { ...store.users[index], ...userData };
    } else {
      store.users.push(userData);
    }
    writeLocalData(store);
    return userData;
  },

  // --- BILLS ---
  getBills: async (userId = 'demo-user-123') => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data;
    }

    if (isMongoConfigured && isMongoConnected) {
      await seedMongoIfEmpty(userId);
      const docs = await MongoModels.Bill.find({ user_id: userId }).sort({ due_date: 1 });
      return docs.map(d => d.toObject());
    }

    const store = readLocalData();
    return (store.bills || [])
      .filter((b) => b.user_id === userId)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  },

  createBill: async (billData, userId = 'demo-user-123') => {
    const newBill = {
      id: `b-${uuidv4().slice(0, 8)}`,
      user_id: userId,
      status: 'upcoming',
      created_at: new Date().toISOString(),
      ...billData
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('bills').insert([newBill]).select().single();
      if (error) throw error;
      return data;
    }

    if (isMongoConfigured && isMongoConnected) {
      const created = await MongoModels.Bill.create(newBill);
      return created.toObject();
    }

    const store = readLocalData();
    store.bills = store.bills || [];
    store.bills.push(newBill);
    writeLocalData(store);
    return newBill;
  },

  updateBill: async (id, updates, userId = 'demo-user-123') => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('bills')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    if (isMongoConfigured && isMongoConnected) {
      const updated = await MongoModels.Bill.findOneAndUpdate(
        { id, user_id: userId },
        { ...updates },
        { new: true }
      );
      return updated ? updated.toObject() : null;
    }

    const store = readLocalData();
    const index = store.bills.findIndex((b) => b.id === id && b.user_id === userId);
    if (index === -1) throw new Error('Bill not found');

    store.bills[index] = { ...store.bills[index], ...updates, updated_at: new Date().toISOString() };
    writeLocalData(store);
    return store.bills[index];
  },

  deleteBill: async (id, userId = 'demo-user-123') => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('bills').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return true;
    }

    if (isMongoConfigured && isMongoConnected) {
      await MongoModels.Bill.deleteOne({ id, user_id: userId });
      return true;
    }

    const store = readLocalData();
    store.bills = (store.bills || []).filter((b) => !(b.id === id && b.user_id === userId));
    writeLocalData(store);
    return true;
  },

  payBill: async (id, userId = 'demo-user-123') => {
    let bill;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('bills').select('*').eq('id', id).single();
      if (error) throw error;
      bill = data;
    } else if (isMongoConfigured && isMongoConnected) {
      const doc = await MongoModels.Bill.findOne({ id, user_id: userId });
      bill = doc ? doc.toObject() : null;
    } else {
      const store = readLocalData();
      bill = (store.bills || []).find((b) => b.id === id);
    }

    if (!bill) throw new Error('Bill not found');

    const paidTimestamp = new Date().toISOString();
    let updatedBill = {
      ...bill,
      status: 'paid',
      last_paid_at: paidTimestamp
    };

    let nextBill = null;

    if (bill.is_recurring && bill.recurrence_frequency) {
      const currentDueDate = new Date(bill.due_date);
      let nextDueDate = new Date(currentDueDate);

      switch (bill.recurrence_frequency.toLowerCase()) {
        case 'daily': nextDueDate.setDate(nextDueDate.getDate() + 1); break;
        case 'weekly': nextDueDate.setDate(nextDueDate.getDate() + 7); break;
        case 'monthly': nextDueDate.setMonth(nextDueDate.getMonth() + 1); break;
        case 'quarterly': nextDueDate.setMonth(nextDueDate.getMonth() + 3); break;
        case 'yearly': nextDueDate.setFullYear(nextDueDate.getFullYear() + 1); break;
        default: nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }

      const nextDueDateStr = nextDueDate.toISOString().split('T')[0];

      nextBill = {
        id: `b-${uuidv4().slice(0, 8)}`,
        user_id: userId,
        name: bill.name,
        amount: bill.amount,
        category: bill.category,
        due_date: nextDueDateStr,
        is_recurring: true,
        recurrence_frequency: bill.recurrence_frequency,
        payment_method: bill.payment_method,
        notes: bill.notes,
        status: 'upcoming',
        created_at: new Date().toISOString()
      };
    }

    if (isSupabaseConfigured) {
      await supabase.from('bills').update({ status: 'paid', last_paid_at: paidTimestamp }).eq('id', id);
      if (nextBill) await supabase.from('bills').insert([nextBill]);
      return { paidBill: updatedBill, nextBill };
    }

    if (isMongoConfigured && isMongoConnected) {
      await MongoModels.Bill.updateOne({ id, user_id: userId }, { status: 'paid', last_paid_at: paidTimestamp });
      if (nextBill) await MongoModels.Bill.create(nextBill);
      return { paidBill: updatedBill, nextBill };
    }

    const store = readLocalData();
    const billIndex = store.bills.findIndex((b) => b.id === id);
    store.bills[billIndex] = updatedBill;
    if (nextBill) store.bills.push(nextBill);
    writeLocalData(store);
    return { paidBill: updatedBill, nextBill };
  },

  // --- CHECKLISTS ---
  getChecklists: async (userId = 'demo-user-123') => {
    if (isSupabaseConfigured) {
      const { data: lists, error: err1 } = await supabase.from('checklists').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (err1) throw err1;
      const { data: items, error: err2 } = await supabase.from('checklist_items').select('*').eq('user_id', userId);
      if (err2) throw err2;
      return lists.map((list) => ({ ...list, items: items.filter((item) => item.checklist_id === list.id) }));
    }

    if (isMongoConfigured && isMongoConnected) {
      await seedMongoIfEmpty(userId);
      const lists = await MongoModels.Checklist.find({ user_id: userId }).sort({ created_at: -1 });
      const items = await MongoModels.ChecklistItem.find({ user_id: userId });
      return lists.map((l) => {
        const obj = l.toObject();
        return {
          ...obj,
          items: items.filter((i) => i.checklist_id === obj.id).map((i) => i.toObject())
        };
      });
    }

    const store = readLocalData();
    const lists = (store.checklists || []).filter((l) => l.user_id === userId);
    const items = store.checklist_items || [];
    return lists.map((list) => ({ ...list, items: items.filter((i) => i.checklist_id === list.id) }));
  },

  createChecklist: async (checklistData, itemsData = [], userId = 'demo-user-123') => {
    const listId = `c-${uuidv4().slice(0, 8)}`;
    const newList = {
      id: listId,
      user_id: userId,
      title: checklistData.title,
      description: checklistData.description || '',
      category: checklistData.category || 'General',
      deadline: checklistData.deadline || null,
      is_archived: false,
      is_ai_generated: Boolean(checklistData.is_ai_generated),
      created_at: new Date().toISOString()
    };

    const formattedItems = itemsData.map((item, idx) => ({
      id: `ci-${uuidv4().slice(0, 8)}`,
      checklist_id: listId,
      user_id: userId,
      category: item.category || 'General',
      title: typeof item === 'string' ? item : item.title,
      is_completed: item.is_completed || false,
      sort_order: idx + 1,
      created_at: new Date().toISOString()
    }));

    if (isSupabaseConfigured) {
      const { data: list, error: err1 } = await supabase.from('checklists').insert([newList]).select().single();
      if (err1) throw err1;
      if (formattedItems.length > 0) await supabase.from('checklist_items').insert(formattedItems);
      return { ...list, items: formattedItems };
    }

    if (isMongoConfigured && isMongoConnected) {
      const createdList = await MongoModels.Checklist.create(newList);
      if (formattedItems.length > 0) {
        await MongoModels.ChecklistItem.insertMany(formattedItems);
      }
      return { ...createdList.toObject(), items: formattedItems };
    }

    const store = readLocalData();
    store.checklists = store.checklists || [];
    store.checklist_items = store.checklist_items || [];
    store.checklists.unshift(newList);
    store.checklist_items.push(...formattedItems);
    writeLocalData(store);
    return { ...newList, items: formattedItems };
  },

  toggleChecklistItem: async (itemId, isCompleted, userId = 'demo-user-123') => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('checklist_items').update({ is_completed: isCompleted }).eq('id', itemId).select().single();
      if (error) throw error;
      return data;
    }

    if (isMongoConfigured && isMongoConnected) {
      const updated = await MongoModels.ChecklistItem.findOneAndUpdate(
        { id: itemId, user_id: userId },
        { is_completed: isCompleted },
        { new: true }
      );
      return updated ? updated.toObject() : null;
    }

    const store = readLocalData();
    const item = (store.checklist_items || []).find((i) => i.id === itemId);
    if (item) {
      item.is_completed = isCompleted;
      writeLocalData(store);
    }
    return item;
  },

  addChecklistItem: async (checklistId, itemTitle, category = 'General', userId = 'demo-user-123') => {
    const newItem = {
      id: `ci-${uuidv4().slice(0, 8)}`,
      checklist_id: checklistId,
      user_id: userId,
      category,
      title: itemTitle,
      is_completed: false,
      sort_order: Date.now(),
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('checklist_items').insert([newItem]).select().single();
      if (error) throw error;
      return data;
    }

    if (isMongoConfigured && isMongoConnected) {
      const created = await MongoModels.ChecklistItem.create(newItem);
      return created.toObject();
    }

    const store = readLocalData();
    store.checklist_items = store.checklist_items || [];
    store.checklist_items.push(newItem);
    writeLocalData(store);
    return newItem;
  },

  deleteChecklistItem: async (itemId, userId = 'demo-user-123') => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('checklist_items').delete().eq('id', itemId);
      if (error) throw error;
      return true;
    }

    if (isMongoConfigured && isMongoConnected) {
      await MongoModels.ChecklistItem.deleteOne({ id: itemId, user_id: userId });
      return true;
    }

    const store = readLocalData();
    store.checklist_items = (store.checklist_items || []).filter((i) => i.id !== itemId);
    writeLocalData(store);
    return true;
  },

  deleteChecklist: async (checklistId, userId = 'demo-user-123') => {
    if (isSupabaseConfigured) {
      await supabase.from('checklist_items').delete().eq('checklist_id', checklistId);
      const { error } = await supabase.from('checklists').delete().eq('id', checklistId);
      if (error) throw error;
      return true;
    }

    if (isMongoConfigured && isMongoConnected) {
      await MongoModels.ChecklistItem.deleteMany({ checklist_id: checklistId, user_id: userId });
      await MongoModels.Checklist.deleteOne({ id: checklistId, user_id: userId });
      return true;
    }

    const store = readLocalData();
    store.checklists = (store.checklists || []).filter((l) => l.id !== checklistId);
    store.checklist_items = (store.checklist_items || []).filter((i) => i.checklist_id !== checklistId);
    writeLocalData(store);
    return true;
  },

  // --- TASKS ---
  getTasks: async (userId = 'demo-user-123') => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId).order('due_date', { ascending: true });
      if (error) throw error;
      return data;
    }

    if (isMongoConfigured && isMongoConnected) {
      await seedMongoIfEmpty(userId);
      const docs = await MongoModels.Task.find({ user_id: userId }).sort({ due_date: 1 });
      return docs.map(d => d.toObject());
    }

    const store = readLocalData();
    return (store.tasks || [])
      .filter((t) => t.user_id === userId)
      .sort((a, b) => new Date(a.due_date || '9999-12-31') - new Date(b.due_date || '9999-12-31'));
  },

  createTask: async (taskData, userId = 'demo-user-123') => {
    const newTask = {
      id: `t-${uuidv4().slice(0, 8)}`,
      user_id: userId,
      title: taskData.title,
      description: taskData.description || '',
      due_date: taskData.due_date || new Date().toISOString().split('T')[0],
      priority: taskData.priority || 'medium',
      category: taskData.category || 'General',
      is_completed: false,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('tasks').insert([newTask]).select().single();
      if (error) throw error;
      return data;
    }

    if (isMongoConfigured && isMongoConnected) {
      const created = await MongoModels.Task.create(newTask);
      return created.toObject();
    }

    const store = readLocalData();
    store.tasks = store.tasks || [];
    store.tasks.unshift(newTask);
    writeLocalData(store);
    return newTask;
  },

  toggleTask: async (id, isCompleted, userId = 'demo-user-123') => {
    const completedAt = isCompleted ? new Date().toISOString() : null;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('tasks').update({ is_completed: isCompleted, completed_at: completedAt }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }

    if (isMongoConfigured && isMongoConnected) {
      const updated = await MongoModels.Task.findOneAndUpdate(
        { id, user_id: userId },
        { is_completed: isCompleted, completed_at: completedAt },
        { new: true }
      );
      return updated ? updated.toObject() : null;
    }

    const store = readLocalData();
    const task = (store.tasks || []).find((t) => t.id === id);
    if (task) {
      task.is_completed = isCompleted;
      task.completed_at = completedAt;
      writeLocalData(store);
    }
    return task;
  },

  deleteTask: async (id, userId = 'demo-user-123') => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    if (isMongoConfigured && isMongoConnected) {
      await MongoModels.Task.deleteOne({ id, user_id: userId });
      return true;
    }

    const store = readLocalData();
    store.tasks = (store.tasks || []).filter((t) => t.id !== id);
    writeLocalData(store);
    return true;
  },

  // --- REMINDERS ---
  getReminders: async (userId = 'demo-user-123') => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('reminders').select('*').eq('user_id', userId).order('reminder_date', { ascending: true });
      if (error) throw error;
      return data;
    }

    if (isMongoConfigured && isMongoConnected) {
      await seedMongoIfEmpty(userId);
      const docs = await MongoModels.Reminder.find({ user_id: userId }).sort({ reminder_date: 1 });
      return docs.map(d => d.toObject());
    }

    const store = readLocalData();
    return (store.reminders || []).filter((r) => r.user_id === userId);
  },

  createReminder: async (reminderData, userId = 'demo-user-123') => {
    const newReminder = {
      id: `r-${uuidv4().slice(0, 8)}`,
      user_id: userId,
      title: reminderData.title,
      reminder_date: reminderData.reminder_date || new Date().toISOString().split('T')[0],
      reminder_time: reminderData.reminder_time || '09:00:00',
      repeat_frequency: reminderData.repeat_frequency || 'none',
      notes: reminderData.notes || '',
      is_dismissed: false,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('reminders').insert([newReminder]).select().single();
      if (error) throw error;
      return data;
    }

    if (isMongoConfigured && isMongoConnected) {
      const created = await MongoModels.Reminder.create(newReminder);
      return created.toObject();
    }

    const store = readLocalData();
    store.reminders = store.reminders || [];
    store.reminders.unshift(newReminder);
    writeLocalData(store);
    return newReminder;
  },

  deleteReminder: async (id, userId = 'demo-user-123') => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('reminders').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    if (isMongoConfigured && isMongoConnected) {
      await MongoModels.Reminder.deleteOne({ id, user_id: userId });
      return true;
    }

    const store = readLocalData();
    store.reminders = (store.reminders || []).filter((r) => r.id !== id);
    writeLocalData(store);
    return true;
  },

  // --- SETTINGS ---
  getSettings: async (userId = 'demo-user-123') => {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) return data;
    }
    const store = readLocalData();
    return store.settings || { currency: 'INR', notifications_enabled: true };
  },

  updateSettings: async (newSettings, userId = 'demo-user-123') => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('profiles').upsert({ id: userId, ...newSettings }).select().single();
      if (error) throw error;
      return data;
    }
    const store = readLocalData();
    store.settings = { ...store.settings, ...newSettings };
    writeLocalData(store);
    return store.settings;
  }
};
