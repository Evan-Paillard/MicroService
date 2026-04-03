import React, { useEffect, useState } from 'react'
import { getSubscriber, updateSubscriber, unsubscribe, type Subscriber } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Settings, Mail, MessageSquare, Save, BellOff } from 'lucide-react'

interface Props {
  studentId: string
}

export function PreferencesPage({ studentId }: Props) {
  const [prefs, setPrefs] = useState<Subscriber | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const data = await getSubscriber(studentId)
      setPrefs(data)
    } catch {
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
    setError(null)
    try {
      await updateSubscriber(studentId, prefs)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
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
    } catch {
      setError('Failed to unsubscribe')
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto flex flex-col gap-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-40 bg-muted rounded-xl" />
      </div>
    )
  }

  if (!prefs) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <BellOff className="h-10 w-10 opacity-30" />
        <p>You are not subscribed to notifications.</p>
        <Button variant="outline" onClick={load}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Notification Settings</h2>
        <Badge variant="outline" className="ml-auto">{prefs.domain}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">La Poste Preferences</CardTitle>
          <CardDescription>Configure how you receive alerts about new internship offers.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Enable notifications</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Receive alerts for domain <span className="font-medium">{prefs.domain}</span></p>
            </div>
            <Switch
              checked={prefs.enabled}
              onCheckedChange={(checked: boolean) => setPrefs({ ...prefs, enabled: checked })}
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Channel</Label>
            <Select
              value={prefs.channel}
              onValueChange={(val: 'email' | 'discord') => setPrefs({ ...prefs, channel: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <span className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </span>
                </SelectItem>
                <SelectItem value="discord">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5" /> Discord
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Contact</Label>
            <Input
              value={prefs.contact || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrefs({ ...prefs, contact: e.target.value })}
              placeholder={prefs.channel === 'email' ? 'email@example.com' : 'User#1234'}
            />
            <p className="text-xs text-muted-foreground">
              {prefs.channel === 'email' ? 'Your email address for notifications' : 'Your Discord username'}
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Button onClick={handleSave} disabled={saving || saved}>
              <Save className="h-4 w-4 mr-2" />
              {saved ? 'Saved!' : saving ? 'Saving…' : 'Save preferences'}
            </Button>
            <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleUnsubscribe}>
              <BellOff className="h-4 w-4 mr-2" />
              Unsubscribe completely
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
