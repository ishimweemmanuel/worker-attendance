import mongoose, { ConnectOptions, Connection } from 'mongoose';

// Define the type for our cached mongoose instance
declare global {
    var mongoose: {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
    };
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (!cached) {
        throw new Error('MongoDB connection not initialized properly');
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts: ConnectOptions = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => mongoose.connection);
    }
    
    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        throw error;
    }
}

export default connectDB;
