const BASE = 'http://localhost:3001'

export interface CityScore {
  safety: number
  economy: number
  quality_of_life: number
  culture: number
}

export interface LatestNews {
  id: string
  name: string
  city: string
  tags: string[]
  source: string
  date: string
}

export interface Offer {
  _id: string
  title: string
  company?: string
  domain: string
  city: string
  salary?: number
  startDate?: string
  endDate?: string
  scores?: CityScore
  latest_news?: LatestNews[]
}

export interface Student {
  id: string
  firstname: string
  name: string
  email?: string
  domain: string
}

export interface InternshipResult {
  status: 'approved' | 'rejected'
  message: string
}

export async function getOffers(): Promise<Offer[]> {
  const res = await fetch(`${BASE}/offers`)
  if (!res.ok) throw new Error('Failed to fetch offers')
  const data = await res.json()
  return data.offers ?? data
}

export async function getStudent(id: string): Promise<Student> {
  const res = await fetch(`${BASE}/student/${id}`)
  if (!res.ok) throw new Error('Student not found')
  return res.json()
}

export async function getRecommendedOffers(studentId: string, sortBy?: string): Promise<Offer[]> {
  const url = new URL(`${BASE}/student/${studentId}/recommended-offers`)
  if (sortBy) url.searchParams.set('sort_by', sortBy)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch recommended offers')
  const data = await res.json()
  return data.offers ?? data
}

export async function applyToInternship(studentId: string, offerId: string): Promise<InternshipResult> {
  const res = await fetch(`${BASE}/internship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, offerId }),
  })
  if (!res.ok) throw new Error('Failed to apply')
  return res.json()
}
