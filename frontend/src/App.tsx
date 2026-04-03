import { useState, useEffect, useRef } from 'react'
import { OffersPage } from '@/pages/OffersPage'
import { StudentPage } from '@/pages/StudentPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { PreferencesPage } from '@/pages/PreferencesPage'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Briefcase, Bell, Settings, User, Newspaper, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getRecommendedOffers, type Student, type Offer } from '@/api'

const WS_URL = 'ws://localhost:3001'

interface Toast { id: number; headline: string }

function loadStudentFromStorage(): Student | null {
  try {
    const raw = localStorage.getItem('polymove_student')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function App() {
  const [tab, setTab] = useState('offers')
  const [student, setStudent] = useState<Student | null>(loadStudentFromStorage)
  const [offers, setOffers] = useState<Offer[]>([])
  const [sortBy, setSortBy] = useState('safety')
  const [loadingOffers, setLoadingOffers] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)
  const studentRef = useRef(student)
  const sortByRef = useRef(sortBy)
  useEffect(() => { studentRef.current = student }, [student])
  useEffect(() => { sortByRef.current = sortBy }, [sortBy])

  useEffect(() => {
    let ws: WebSocket
    let reconnectTimeout: ReturnType<typeof setTimeout>

    function connect() {
      ws = new WebSocket(WS_URL)
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'offer.created' && studentRef.current) {
            getRecommendedOffers(studentRef.current.id, sortByRef.current)
              .then(setOffers)
              .catch(() => {})
          }
          if (msg.type === 'news.created') {
            const id: number = ++toastId.current
            setToasts((t: Toast[]) => [...t, { id, headline: msg.news.name as string }])
            setTimeout(() => setToasts((t: Toast[]) => t.filter((x: Toast) => x.id !== id)), 5000)
          }
        } catch {}
      }
      ws.onclose = () => {
        reconnectTimeout = setTimeout(connect, 3000)
      }
    }

    connect()
    return () => {
      clearTimeout(reconnectTimeout)
      ws.close()
    }
  }, [])

  useEffect(() => {
    if (!student) return
    setLoadingOffers(true)
    getRecommendedOffers(student.id, sortBy)
      .then(setOffers)
      .catch(() => setOffers([]))
      .finally(() => setLoadingOffers(false))
  }, [student?.id, sortBy])

  async function handleLogin(s: Student) {
    setStudent(s)
    localStorage.setItem('polymove_student', JSON.stringify(s))
    setTab('dashboard')
    setLoadingOffers(true)
    try {
      const fetched = await getRecommendedOffers(s.id, sortBy)
      setOffers(fetched)
    } catch {
      setOffers([])
    } finally {
      setLoadingOffers(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('polymove_student')
    setStudent(null)
    setOffers([])
    setTab('offers')
  }

  function handleSortChange(value: string) {
    setSortBy(value)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">Polymove</span>
          </div>

          {student && (
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{student.firstname} {student.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="h-7 px-2 text-xs">
                <LogOut className="h-3.5 w-3.5 mr-1" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-2">
            <TabsTrigger value="offers" className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              Offers
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {student ? 'Dashboard' : 'Login'}
            </TabsTrigger>
            {student && (
              <>
                <TabsTrigger value="notifications" className="flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1.5">
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <Separator className="mb-6" />

          <TabsContent value="offers">
            <OffersPage studentId={student?.id ?? null} />
          </TabsContent>
          <TabsContent value="dashboard">
            <StudentPage
              onStudentLogin={handleLogin}
              student={student}
              offers={offers}
              sortBy={sortBy}
              loadingOffers={loadingOffers}
              onSortChange={handleSortChange}
            />
          </TabsContent>
          {student && (
            <>
              <TabsContent value="notifications">
                <NotificationsPage studentId={student.id} />
              </TabsContent>
              <TabsContent value="settings">
                <PreferencesPage studentId={student.id} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map(t => (
          <div
            key={t.id}
            className="flex items-start gap-3 bg-foreground text-background rounded-lg px-4 py-3 shadow-lg max-w-xs animate-in slide-in-from-right"
          >
            <Newspaper className="h-4 w-4 mt-0.5 shrink-0 opacity-70" />
            <div>
              <p className="text-xs font-semibold opacity-70 uppercase tracking-wide">Breaking news</p>
              <p className="text-sm mt-0.5">{t.headline}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
