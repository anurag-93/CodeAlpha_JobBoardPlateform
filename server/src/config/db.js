import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Keep the memory server reference so closeDB can release it during shutdown.
let mongoMemoryServerInstance = null;

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobboard';
  const mode = process.env.USE_IN_MEMORY_DB || 'auto';

  // 'auto' is convenient for development, but memory-backed records are process-local.
  if (mode === 'true') {
    return await startInMemoryMongo();
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(` MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (err) {
    if (mode === 'false') {
      console.error(` MongoDB Connection Error: ${err.message}`);
      process.exit(1);
    }

    console.warn(` Local MongoDB not reachable (${err.message}). Starting in-memory MongoDB server for development...`);
    return await startInMemoryMongo();
  }
};

const startInMemoryMongo = async () => {
  try {
    mongoMemoryServerInstance = await MongoMemoryServer.create();
    const uri = mongoMemoryServerInstance.getUri();
    const conn = await mongoose.connect(uri);
    console.log(` In-Memory MongoDB Connected at: ${uri}`);
    return conn;
  } catch (error) {
    console.error(' Failed to start in-memory MongoDB:', error);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};
