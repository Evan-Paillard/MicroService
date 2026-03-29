import { Schema, model } from 'mongoose'

const subscriberSchema = new Schema({
  studentId: { type: String, required: true, unique: true },
  domain: { type: String, required: true },
  channel: { type: String, enum: ['discord', 'email'], default: 'email' },
  contact: { type: String, required: false },
  enabled: { type: Boolean, default: true },
})

export const Subscriber = model('Subscriber', subscriberSchema)
