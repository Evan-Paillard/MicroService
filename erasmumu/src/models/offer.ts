import { Schema, model } from 'mongoose'

const offerSchema = new Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
  city: { type: String, required: true },
  domain: { type: String, required: true },
  salary: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  available: { type: Boolean, required: true, default: true },
})

export const Offer = model('Offer', offerSchema)
