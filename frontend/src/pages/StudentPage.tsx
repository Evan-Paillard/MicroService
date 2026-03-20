import { useState } from 'react'
import { getStudent, getRecommendedOffers, type Student, type Offer } from '@/api'
import { OfferCard } from '@/components/OfferCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const SORT_OPTIONS = [
  { value: 'safety', label: 'Safety' },
  { value: 'economy', label: 'Economy' },
  { value: 'quality_of_life', label: 'Quality of life' },
  { value: 'culture', label: 'Culture' },
]

interface Props {
  onStudentLogin: (id: string) => void
}

export function StudentPage({ onStudentLogin }: Props) {
  const [idInput, setIdInput] = useState('')
  const [student, setStudent] = useState<Student | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [sortBy, setSortBy] = useState('safety')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    if (!idInput.trim()) return
    setLoading(true)
    setError(null)
    try {
      const s = await getStudent(idInput.trim())
      setStudent(s)
      onStudentLogin(s.id)
      const o = await getRecommendedOffers(idInput.trim(), sortBy)
      setOffers(o)
    } catch {
      setError('Student not found or failed to load offers')
      setStudent(null)
      setOffers([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSortChange(value: string) {
    setSortBy(value)
    if (!student) return
    setLoading(true)
    try {
      const o = await getRecommendedOffers(student.id, value)
      setOffers(o)
    } catch {
      setError('Failed to load offers')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Student ID"
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          className="sm:max-w-[300px]"
        />
        <Button onClick={handleLogin} disabled={loading}>
          {loading ? 'Loading…' : 'Load'}
        </Button>
      </div>

      {error && <p className="text-destructive">{error}</p>}

      {student && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="font-semibold">{student.firstname} {student.name}</p>
              <p className="text-sm text-muted-foreground">{student.email}</p>
            </div>
            <Badge>{student.domain}</Badge>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <OfferCard key={offer._id} offer={offer} studentId={student.id} />
            ))}
          </div>

          {offers.length === 0 && !loading && (
            <p className="text-muted-foreground">No recommended offers found.</p>
          )}
        </div>
      )}
    </div>
  )
}
