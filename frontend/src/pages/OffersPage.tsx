import { useEffect, useState } from 'react'
import { getOffers, type Offer } from '@/api'
import { OfferCard } from '@/components/OfferCard'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
  studentId: string | null
}

export function OffersPage({ studentId }: Props) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cityFilter, setCityFilter] = useState('')
  const [domainFilter, setDomainFilter] = useState('all')

  useEffect(() => {
    getOffers()
      .then(setOffers)
      .catch(() => setError('Failed to load offers'))
      .finally(() => setLoading(false))
  }, [])

  const domains = Array.from(new Set(offers.map((o) => o.domain))).sort()

  const filtered = offers.filter((o) => {
    const matchCity = cityFilter === '' || o.city.toLowerCase().includes(cityFilter.toLowerCase())
    const matchDomain = domainFilter === 'all' || o.domain === domainFilter
    return matchCity && matchDomain
  })

  return (
    <div className="flex flex-col gap-6">
      {!studentId && (
        <p className="text-sm text-muted-foreground">
          Log in via <span className="font-semibold">My Dashboard</span> to apply for offers.
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Filter by city…"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="sm:max-w-[200px]"
        />
        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="sm:max-w-[200px]">
            <SelectValue placeholder="All domains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All domains</SelectItem>
            {domains.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} offer(s)</span>
      </div>

      {loading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-destructive">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((offer) => (
          <OfferCard key={offer._id} offer={offer} studentId={studentId ?? undefined} />
        ))}
      </div>
    </div>
  )
}
