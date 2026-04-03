import { useEffect, useState } from 'react'
import { getNotifications, markNotificationRead, type Notification } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, CheckCheck, Briefcase } from 'lucide-react'

interface Props {
  studentId: string
}

export function NotificationsPage({ studentId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const data = await getNotifications(studentId)
      setNotifications(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [studentId])

  async function handleRead(id: string) {
    try {
      await markNotificationRead(id)
      setNotifications(notifications.map((n: Notification) => n.id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  const unreadCount = notifications.filter((n: Notification) => !n.read).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge>{unreadCount} new</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => notifications.filter((n: Notification) => !n.read).forEach((n: Notification) => handleRead(n.id))}
          >
            <CheckCheck className="h-4 w-4 mr-1.5" />
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4 flex flex-col gap-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Bell className="h-10 w-10 opacity-30" />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n: Notification) => (
            <Card
              key={n.id}
              className={`transition-opacity ${n.read ? 'opacity-50' : 'border-primary/50 shadow-sm'}`}
            >
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${n.read ? 'bg-muted' : 'bg-primary/10'}`}>
                      <Briefcase className={`h-3.5 w-3.5 ${n.read ? 'text-muted-foreground' : 'text-primary'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-snug">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(n.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!n.read && <Badge variant="secondary" className="text-xs">New</Badge>}
                  </div>
                </div>
              </CardHeader>
              {!n.read && (
                <CardContent className="pb-3 px-4 pt-0 pl-[52px]">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleRead(n.id)}>
                    <CheckCheck className="h-3.5 w-3.5 mr-1" />
                    Mark as read
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
