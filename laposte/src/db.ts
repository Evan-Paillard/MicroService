import mongoose from 'mongoose'

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/laposte'

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL)
    console.log('La Poste connected to MongoDB')
  } catch (err) {
    console.error('La Poste MongoDB connection error:', err)
    process.exit(1)
  }
}
