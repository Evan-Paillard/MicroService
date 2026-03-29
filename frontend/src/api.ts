const BASE = 'http://localhost:3001'
const LAPOSTE_BASE = 'http://localhost:3003'

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

export interface Notification {
  id: string
  student_id: string
  type: string
  offer_id: string
  message: string
  read: boolean
  created_at: string
}

export interface Subscriber {
  studentId: string
  domain: string
  channel: 'discord' | 'email'
  contact: string
  enabled: boolean
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

export async function applyToInternship(studentId: string, offerId: string): Promise<{status: string, message: string}> {
  const res = await fetch(`${BASE}/internship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, offerId }),
  })
  if (!res.ok) throw new Error('Failed to apply')
  return res.json()
}

// Notifications (Polytech)
export async function getNotifications(studentId: string): Promise<Notification[]> {
  const res = await fetch(`${BASE}/students/${studentId}/notifications`)
  if (!res.ok) throw new Error('Failed to fetch notifications')
  return res.json()
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const res = await fetch(`${BASE}/notifications/${id}/read`, { method: 'PUT' })
  if (!res.ok) throw new Error('Failed to mark notification as read')
  return res.json()
}

// La Poste Preferences
export async function getSubscriber(studentId: string): Promise<Subscriber> {
  const res = await fetch(`${LAPOSTE_BASE}/subscribers/${studentId}`)
  if (!res.ok) throw new Error('Failed to fetch subscriber preferences')
  return res.json()
}

export async function updateSubscriber(studentId: string, prefs: Partial<Subscriber>): Promise<Subscriber> {
  const res = await fetch(`${LAPOSTE_BASE}/subscribers/${studentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  })
  if (!res.ok) throw new Error('Failed to update preferences')
  return res.json()
}

export async function unsubscribe(studentId: string): Promise<void> {
  const res = await fetch(`${LAPOSTE_BASE}/subscribers/${studentId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to unsubscribe')
}
