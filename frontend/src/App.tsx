import { useState, useEffect, useRef } from 'react'
import { OffersPage } from '@/pages/OffersPage'
import { StudentPage } from '@/pages/StudentPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { PreferencesPage } from '@/pages/PreferencesPage'
import { Button } from '@/components/ui/button'

const WS_URL = 'ws://localhost:3001'

interface Toast { id: number; headline: string }

type Tab = 'offers' | 'student' | 'notifications' | 'preferences'

export function App() {
  const [tab, setTab] = useState<Tab>('offers')
  const [studentId, setStudentId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)

  useEffect(() => {
    const ws = new WebSocket(WS_URL)
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'news.created') {
          const id = ++toastId.current
          setToasts(t => [...t, { id, headline: msg.news.name }])
          setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000)
        }
      } catch {}
    }
    return () => ws.close()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <h1 className="text-lg font-bold">Polymove</h1>
          <nav className="flex gap-1 sm:gap-2">
            <Button
              variant={tab === 'offers' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTab('offers')}
            >
              Offers
            </Button>
            <Button
              variant={tab === 'student' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTab('student')}
            >
              {studentId ? 'Dashboard' : 'Login'}
            </Button>
            {studentId && (
              <>
                <Button
                  variant={tab === 'notifications' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTab('notifications')}
                >
                  Notifications
                </Button>
                <Button
                  variant={tab === 'preferences' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTab('preferences')}
                >
                  Settings
                </Button>
              </>
            )}
          </nav>
          {studentId && (
            <span className="ml-auto text-xs text-muted-foreground hidden sm:inline">
              ID: <span className="font-mono">{studentId.slice(0, 8)}…</span>
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === 'offers' && <OffersPage studentId={studentId} />}
        {tab === 'student' && <StudentPage onStudentLogin={setStudentId} />}
        {tab === 'notifications' && studentId && <NotificationsPage studentId={studentId} />}
        {tab === 'preferences' && studentId && <PreferencesPage studentId={studentId} />}
      </main>

      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className="bg-foreground text-background rounded-lg px-4 py-3 shadow-lg text-sm max-w-xs animate-in slide-in-from-right">
            <span className="font-semibold">Breaking news</span>
            <p className="mt-1 opacity-90">{t.headline}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
