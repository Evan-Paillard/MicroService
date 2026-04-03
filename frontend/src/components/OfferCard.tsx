import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MapPin, Building2, Banknote, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import { applyToInternship, type Offer } from '@/api'

interface Props {
  offer: Offer
  studentId?: string
}

const SCORE_COLORS: Record<string, string> = {
  safety: 'bg-blue-500',
  economy: 'bg-green-500',
  quality_of_life: 'bg-purple-500',
  culture: 'bg-orange-500',
}

const SCORE_LABELS: Record<string, string> = {
  safety: 'Safety',
  economy: 'Economy',
  quality_of_life: 'Quality of life',
  culture: 'Culture',
}

export function OfferCard({ offer, studentId }: Props) {
  const storageKey = studentId ? `apply:${studentId}:${offer._id}` : null
  const saved = storageKey ? sessionStorage.getItem(storageKey) : null
  const savedParsed = saved ? JSON.parse(saved) : null

  const [status, setStatus] = useState<'idle' | 'loading' | 'approved' | 'rejected'>(
    savedParsed?.status ?? 'idle'
  )
  const [message, setMessage] = useState<string | null>(savedParsed?.message ?? null)

  async function handleApply() {
    if (!studentId) return
    setStatus('loading')
    try {
      const result = await applyToInternship(studentId, offer._id)
      setStatus(result.status as 'approved' | 'rejected')
      setMessage(result.message)
      if (storageKey) sessionStorage.setItem(storageKey, JSON.stringify({ status: result.status, message: result.message }))
    } catch {
      setStatus('rejected')
      setMessage('An error occurred')
    }
  }

  const score = offer.scores
  const news = offer.latest_news?.[0]

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{offer.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0">{offer.domain}</Badge>
        </div>

        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          {offer.company && (
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {offer.company}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {offer.city}
          </span>
          {offer.salary && (
            <span className="flex items-center gap-1.5">
              <Banknote className="h-3.5 w-3.5" />
              {offer.salary.toLocaleString()} €/month
            </span>
          )}
          {offer.startDate && offer.endDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(offer.startDate)} → {formatDate(offer.endDate)}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-0">
        {score && (
          <>
            <Separator />
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">City scores</p>
              {(['safety', 'economy', 'quality_of_life', 'culture'] as const).map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-24 text-xs text-muted-foreground">{SCORE_LABELS[key]}</span>
                  <div className="flex-1">
                    <Progress
                      value={Math.min(score[key] / 15, 100)}
                      className={`h-1.5 [&>div]:${SCORE_COLORS[key]}`}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-mono tabular-nums">{score[key]}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {news && (
          <>
            <Separator />
            <div className="rounded-md bg-muted/60 px-3 py-2.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Latest news</p>
              <p className="text-xs">{news.name}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {news.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] py-0 h-4">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {studentId && (
          <>
            <Separator />
            <div className="flex flex-col gap-1.5">
              <Button
                size="sm"
                disabled={status !== 'idle'}
                variant={status === 'rejected' ? 'destructive' : status === 'approved' ? 'outline' : 'default'}
                onClick={handleApply}
                className="w-full"
              >
                {status === 'idle' && 'Apply'}
                {status === 'loading' && 'Applying…'}
                {status === 'approved' && (
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Approved</span>
                )}
                {status === 'rejected' && (
                  <span className="flex items-center gap-1.5"><XCircle className="h-4 w-4" /> Rejected</span>
                )}
              </Button>
              {message && (
                <p className={`text-xs text-center ${status === 'approved' ? 'text-green-600' : 'text-destructive'}`}>
                  {message}
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
