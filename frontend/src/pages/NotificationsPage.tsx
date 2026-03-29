import { useEffect, useState } from 'react'
import { getNotifications, markNotificationRead, type Notification } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <p>Loading notifications...</p>

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-muted-foreground">No notifications yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map(n => (
            <Card key={n.id} className={n.read ? 'opacity-60' : 'border-primary'}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant={n.type === 'new_offer' ? 'default' : 'secondary'}>
                    {n.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                <CardTitle className="text-base mt-1">{n.message}</CardTitle>
              </CardHeader>
              {!n.read && (
                <CardContent>
                  <Button size="sm" onClick={() => handleRead(n.id)}>
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
