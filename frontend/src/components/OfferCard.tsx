import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { applyToInternship, type Offer } from '@/api'

interface Props {
  offer: Offer
  studentId?: string
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
    d ? new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : null

  return (
    <Card className="flex flex-col gap-2">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{offer.title}</CardTitle>
          <Badge variant="outline">{offer.domain}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {[offer.company, offer.city].filter(Boolean).join(' — ')}
        </p>
        {(offer.salary || offer.startDate) && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {offer.salary && <span>{offer.salary} €/mois</span>}
            {offer.startDate && offer.endDate && (
              <span>{formatDate(offer.startDate)} → {formatDate(offer.endDate)}</span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {score && (
          <div className="flex flex-col gap-1.5">
            {(['safety', 'economy', 'quality_of_life', 'culture'] as const).map((key) => (
              <div key={key}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                  <span>{score[key]}</span>
                </div>
                <Progress value={Math.min(score[key] / 15, 100)} />
              </div>
            ))}
          </div>
        )}

        {news && (
          <div className="rounded-md bg-muted px-3 py-2">
            <p className="text-xs font-medium">{news.name}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {news.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {studentId && (
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              disabled={status !== 'idle'}
              variant={status === 'rejected' ? 'destructive' : 'default'}
              onClick={handleApply}
            >
              {status === 'idle' && 'Apply'}
              {status === 'loading' && 'Applying…'}
              {status === 'approved' && 'Approved'}
              {status === 'rejected' && 'Rejected'}
            </Button>
            {message && (
              <p className={`text-xs ${status === 'approved' ? 'text-green-600' : 'text-destructive'}`}>
                {message}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
