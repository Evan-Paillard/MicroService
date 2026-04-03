import React, { useState } from 'react'
import { getStudent, type Student, type Offer } from '@/api'
import { OfferCard } from '@/components/OfferCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { User, LogIn } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'safety', label: 'Safety' },
  { value: 'economy', label: 'Economy' },
  { value: 'quality_of_life', label: 'Quality of life' },
  { value: 'culture', label: 'Culture' },
]

interface Props {
  onStudentLogin: (student: Student) => void
  student: Student | null
  offers: Offer[]
  sortBy: string
  loadingOffers: boolean
  onSortChange: (value: string) => void
}

export function StudentPage({ onStudentLogin, student, offers, sortBy, loadingOffers, onSortChange }: Props) {
  const [idInput, setIdInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    if (!idInput.trim()) return
    setLoading(true)
    setError(null)
    try {
      const s = await getStudent(idInput.trim())
      onStudentLogin(s)
    } catch {
      setError('Student not found')
    } finally {
      setLoading(false)
    }
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold">Student Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter your student ID to see personalized offers</p>
        </div>
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6 flex flex-col gap-3">
            <Input
              placeholder="Student ID"
              value={idInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} disabled={loading} className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              {loading ? 'Loading…' : 'Sign in'}
            </Button>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
            {student.firstname[0]}{student.name[0]}
          </div>
          <div>
            <p className="font-semibold">{student.firstname} {student.name}</p>
            <p className="text-sm text-muted-foreground">Student ID: {student.id.slice(0, 8)}…</p>
          </div>
          <Badge>{student.domain}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {loadingOffers ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4 flex flex-col gap-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full mt-2" />
            </div>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">No recommended offers found for your domain.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard key={offer._id} offer={offer} studentId={student.id} />
          ))}
        </div>
      )}
    </div>
  )
}
