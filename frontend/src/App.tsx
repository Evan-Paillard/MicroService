import { useState } from 'react'
import { OffersPage } from '@/pages/OffersPage'
import { StudentPage } from '@/pages/StudentPage'
import { Button } from '@/components/ui/button'

type Tab = 'offers' | 'student'

export function App() {
  const [tab, setTab] = useState<Tab>('offers')
  const [studentId, setStudentId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <h1 className="text-lg font-bold">Polymove</h1>
          <nav className="flex gap-2">
            <Button
              variant={tab === 'offers' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTab('offers')}
            >
              Offers Explorer
            </Button>
            <Button
              variant={tab === 'student' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTab('student')}
            >
              My Dashboard
            </Button>
          </nav>
          {studentId && (
            <span className="ml-auto text-xs text-muted-foreground">
              Logged in as <span className="font-mono">{studentId.slice(0, 8)}…</span>
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === 'offers' ? (
          <OffersPage studentId={studentId} />
        ) : (
          <StudentPage onStudentLogin={setStudentId} />
        )}
      </main>
    </div>
  )
}
