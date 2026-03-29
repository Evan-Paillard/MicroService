import { useEffect, useState } from 'react'
import { getSubscriber, updateSubscriber, unsubscribe, type Subscriber } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Props {
  studentId: string
}

export function PreferencesPage({ studentId }: Props) {
  const [prefs, setPrefs] = useState<Subscriber | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      const data = await getSubscriber(studentId)
      setPrefs(data)
    } catch (err) {
      setError('Failed to load preferences')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [studentId])

  async function handleSave() {
    if (!prefs) return
    setSaving(true)
    try {
      await updateSubscriber(studentId, prefs)
    } catch (err) {
      setError('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  async function handleUnsubscribe() {
    if (!confirm('Are you sure you want to unsubscribe from all notifications?')) return
    try {
      await unsubscribe(studentId)
      setPrefs(null)
    } catch (err) {
      setError('Failed to unsubscribe')
    }
  }

  if (loading) return <p>Loading preferences...</p>
  if (!prefs) return <div className="text-center py-10">
    <p className="text-muted-foreground mb-4">You are not registered for notifications.</p>
    <Button onClick={load}>Retry</Button>
  </div>

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Configure how La Poste sends you alerts about new internship offers.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center justify-between border p-4 rounded-lg">
            <div className="space-y-0.5">
              <Label>Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive alerts for domain {prefs.domain}</p>
            </div>
            <input 
              type="checkbox"
              className="w-5 h-5 accent-primary cursor-pointer"
              checked={prefs.enabled} 
              onChange={(e) => setPrefs({ ...prefs, enabled: e.target.checked })} 
            />
          </div>

          <div className="space-y-2">
            <Label>Notification Channel</Label>
            <Select 
              value={prefs.channel} 
              onValueChange={(val: any) => setPrefs({ ...prefs, channel: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="discord">Discord</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Contact Information</Label>
            <Input 
              value={prefs.contact || ''} 
              onChange={(e) => setPrefs({ ...prefs, contact: e.target.value })}
              placeholder={prefs.channel === 'email' ? 'email@example.com' : 'User#1234'}
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
            <Button variant="outline" className="text-destructive" onClick={handleUnsubscribe}>
              Unsubscribe completely
            </Button>
          </div>
          
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
