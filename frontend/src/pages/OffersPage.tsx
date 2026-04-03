import React, { useEffect, useState } from 'react'
import { getOffers, type Offer } from '@/api'
import { OfferCard } from '@/components/OfferCard'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Search } from 'lucide-react'

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

  const domains = Array.from(new Set(offers.map((o: Offer) => o.domain))).sort()

  const filtered = offers.filter((o: Offer) => {
    const matchCity = cityFilter === '' || o.city.toLowerCase().includes(cityFilter.toLowerCase())
    const matchDomain = domainFilter === 'all' || o.domain === domainFilter
    return matchCity && matchDomain
  })

  return (
    <div className="flex flex-col gap-6">
      {!studentId && (
        <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Log in via <span className="font-semibold text-foreground">Dashboard</span> to apply for offers.
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-[200px] w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by city…"
            value={cityFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCityFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="sm:max-w-[200px]">
            <SelectValue placeholder="All domains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All domains</SelectItem>
            {domains.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!loading && (
          <span className="text-sm text-muted-foreground">{filtered.length} offer(s)</span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4 flex flex-col gap-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-20 w-full mt-2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((offer) => (
            <OfferCard key={offer._id} offer={offer} studentId={studentId ?? undefined} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-10">No offers match your filters.</p>
          )}
        </div>
      )}
    </div>
  )
}
