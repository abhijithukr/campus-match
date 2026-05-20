'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { updateUserProfile } from '@/firebase/auth'
import { logoutUser } from '@/firebase/auth'
import { useRouter } from 'next/navigation'
import { Camera, Edit2, LogOut, Shield, Bell, Instagram, Phone, X, Eye, EyeOff, Lock, BellOff } from 'lucide-react'
import toast from 'react-hot-toast'

const INTERESTS_OPTIONS = ['Music', 'Movies', 'Anime', 'Gaming', 'Coding', 'Reading', 'Travel', 'Coffee', 'Art', 'Sports', 'Cooking', 'Photography', 'Dance', 'Fitness', 'Nature']
const TAGS = ['Night Owl', 'Early Bird', 'Introvert', 'Extrovert', 'Creative', 'Analytical', 'Adventurous', 'Homebody', 'Deep Thinker', 'Spontaneous']

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24,
        padding: 28, width: '90%', maxWidth: 440, maxHeight: '80vh', overflowY: 'auto',
        animation: 'popIn 0.3s'
      }}>
        <style>{`@keyframes popIn { from { transform: scale(0.9); opacity: 0 } to { transform: scale(1); opacity: 1 } }`}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)' }}>
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: checked ? 'var(--grad)' : 'var(--surface3)',
          display: 'flex', alignItems: 'center', justifyContent: checked ? 'flex-end' : 'flex-start',
          padding: 2, transition: 'all 0.2s'
        }}
      >
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'all 0.2s' }} />
      </button>
    </div>
  )
}

export default function ProfilePage() {
  const { profile, setProfile } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [modal, setModal] = useState<'privacy' | 'notifications' | null>(null)
  const [form, setForm] = useState({
    bio: '', instagram: '', whatsappNumber: '', favoriteMovie: '',
    interests: [] as string[], personalityTags: [] as string[], musicTaste: [] as string[],
  })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    anonymousLikes: true,
    onlineStatus: true,
    departmentVisible: true,
  })

  const [notifSettings, setNotifSettings] = useState({
    matches: true,
    anonymousLikes: true,
    messages: true,
    confessions: true,
    cycleReset: false,
  })

  const completion = profile?.profileCompletion || 0

  const save = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const filled = [profile.bio, profile.profilePhoto, profile.instagram, profile.favoriteMovie, profile.whatsappNumber, (profile.interests?.length > 0), (profile.musicTaste?.length > 0), profile.personalityTags?.length > 0].filter(Boolean).length
      const pct = Math.round((filled / 8) * 100)
      await updateUserProfile(profile.uid, { ...form, profileCompletion: pct })
      setProfile({ ...profile, ...form, profileCompletion: pct })
      setEditing(false)
      toast.success('Profile updated! ✨')
    } catch { toast.error('Save failed.') }
    finally { setSaving(false) }
  }

  const saveSettings = async () => {
    if (!profile) return
    await updateUserProfile(profile.uid, { privacySettings, notifSettings })
    toast.success('Settings saved!')
    setModal(null)
  }

  const openAvatarUpload = () => document.getElementById('avatar-upload')?.click()
  const openCoverUpload = () => document.getElementById('cover-upload')?.click()

  useEffect(() => {
    if (profile) {
      setForm({
        bio: profile.bio || '',
        instagram: profile.instagram || '',
        whatsappNumber: profile.whatsappNumber || '',
        favoriteMovie: profile.favoriteMovie || '',
        interests: profile.interests || [],
        personalityTags: profile.personalityTags || [],
        musicTaste: profile.musicTaste || [],
      })
      if (profile.privacySettings) setPrivacySettings(profile.privacySettings as any)
      if (profile.notifSettings) setNotifSettings(profile.notifSettings as any)
    }
  }, [profile])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    try {
      const { uploadImage } = await import('@/firebase/storage')
      const url = await uploadImage(file, 'campus-match/profiles')
      await updateUserProfile(profile.uid, type === 'avatar' ? { profilePhoto: url } : { coverPhoto: url })
      setProfile({ ...profile, ...(type === 'avatar' ? { profilePhoto: url } : { coverPhoto: url }) })
      toast.success('Photo updated! ✨')
    } catch { toast.error('Upload failed.') }
  }

  const toggleInterest = (i: string) => {
    setForm(f => ({ ...f, interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i] }))
  }

  const toggleTag = (t: string) => {
    setForm(f => ({ ...f, personalityTags: f.personalityTags.includes(t) ? f.personalityTags.filter(x => x !== t) : [...f.personalityTags, t] }))
  }

  const handleLogout = async () => {
    await logoutUser()
    router.push('/')
  }

  if (!profile) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>My Profile</h1>
        <button onClick={editing ? save : () => setEditing(true)} disabled={saving} style={{
          padding: '8px 20px', borderRadius: 10,
          background: editing ? 'var(--grad)' : 'var(--surface2)',
          border: editing ? 'none' : '1px solid var(--border)',
          color: editing ? '#fff' : 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <Edit2 size={13} /> {saving ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Cover */}
        <div style={{ height: 160, background: profile.coverPhoto ? `url(${profile.coverPhoto}) center/cover no-repeat` : 'var(--grad)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))' }} />
          {editing && (
            <button onClick={openCoverUpload} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '6px 12px', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Camera size={12} /> Change Cover
            </button>
          )}
          <input id="cover-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePhotoUpload(e, 'cover')} />
          <div style={{
            position: 'absolute', bottom: -36, left: 28,
            width: 76, height: 76, borderRadius: '50%',
            background: 'var(--surface2)', border: '3px solid var(--bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, overflow: 'hidden',
            cursor: editing ? 'pointer' : 'default'
          }} onClick={editing ? openAvatarUpload : undefined}>
            {profile.profilePhoto ? <img src={profile.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : profile.fullName[0]}
            {editing && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={16} color="#fff" />
              </div>
            )}
          </div>
          <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePhotoUpload(e, 'avatar')} />
        </div>

        <div style={{ padding: '48px 28px 20px' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>{profile.fullName}</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{profile.department} · {profile.year}{profile.year===1?'st':profile.year===2?'nd':profile.year===3?'rd':'th'} Year · {profile.registerNumber}</p>
          <div style={{ marginTop: 16, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: 'var(--muted)' }}>Profile completion</span>
              <span style={{ color: 'var(--purple-light)', fontWeight: 600 }}>{completion}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--grad)', width: `${completion}%`, borderRadius: 3, transition: 'width 0.6s' }} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 28px 20px' }}>
          {[
            { label: 'Likes Sent Today', val: `${10 - (profile.likesRemaining || 0)} / 10`, color: 'var(--pink)' },
            { label: 'Total Matches', val: '—', color: 'var(--purple-light)' },
            { label: 'Anonymous Likes', val: '👀', color: 'var(--text)' },
            { label: 'Cycle Resets', val: '—', color: 'var(--text)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div style={{ padding: '0 28px 20px' }}>
          <h3 style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>Bio</h3>
          {editing ? (
            <textarea className="input-base" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Write something about yourself..." style={{ resize: 'none' }} maxLength={160} />
          ) : (
            <p style={{ fontSize: 14, color: '#bbb', lineHeight: 1.7 }}>{profile.bio || <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No bio yet. Add one!</span>}</p>
          )}
        </div>

        {/* Social */}
        {editing && (
          <div style={{ padding: '0 28px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Social Links</h3>
            <div style={{ position: 'relative' }}>
              <Instagram size={14} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input className="input-base" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} placeholder="Instagram username" style={{ paddingLeft: 40 }} />
            </div>
            <div style={{ position: 'relative' }}>
              <Phone size={14} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input className="input-base" value={form.whatsappNumber} onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))} placeholder="WhatsApp number" style={{ paddingLeft: 40 }} />
            </div>
          </div>
        )}

        {/* Interests */}
        <div style={{ padding: '0 28px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Interests</h3>
            {!editing && !profile.interests?.length && (
              <button onClick={() => setEditing(true)} style={{ fontSize: 11, color: 'var(--purple-light)', background: 'none', border: 'none', cursor: 'pointer' }}>Add →</button>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(editing ? INTERESTS_OPTIONS : (profile.interests?.length ? profile.interests : [])).map(i => {
              const selected = form.interests.includes(i)
              return (
                <button key={i} onClick={editing ? () => toggleInterest(i) : undefined} style={{
                  padding: '5px 14px', borderRadius: 100,
                  background: selected ? 'rgba(138,43,226,0.2)' : 'rgba(138,43,226,0.08)',
                  border: `1px solid ${selected ? 'var(--purple)' : 'rgba(138,43,226,0.2)'}`,
                  color: selected ? 'var(--purple-light)' : 'var(--muted)',
                  fontSize: 12, cursor: editing ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}>{i}</button>
              )
            })}
            {!editing && !profile.interests?.length && (
              <button onClick={() => setEditing(true)} style={{ padding: '5px 14px', borderRadius: 100, background: 'rgba(138,43,226,0.08)', border: '1px solid rgba(138,43,226,0.2)', color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>Add interests →</button>
            )}
          </div>
        </div>

        {/* Personality */}
        <div style={{ padding: '0 28px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Personality</h3>
            {!editing && !profile.personalityTags?.length && (
              <button onClick={() => setEditing(true)} style={{ fontSize: 11, color: 'var(--pink-light)', background: 'none', border: 'none', cursor: 'pointer' }}>Add →</button>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(editing ? TAGS : (profile.personalityTags?.length ? profile.personalityTags : [])).map(t => {
              const selected = form.personalityTags.includes(t)
              return (
                <button key={t} onClick={editing ? () => toggleTag(t) : undefined} style={{
                  padding: '5px 14px', borderRadius: 100,
                  background: selected ? 'rgba(255,79,216,0.15)' : 'rgba(255,79,216,0.06)',
                  border: `1px solid ${selected ? 'var(--pink)' : 'rgba(255,79,216,0.2)'}`,
                  color: selected ? 'var(--pink-light)' : 'var(--muted)',
                  fontSize: 12, cursor: editing ? 'pointer' : 'default', transition: 'all 0.2s'
                }}>{t}</button>
              )
            })}
            {!editing && !profile.personalityTags?.length && (
              <button onClick={() => setEditing(true)} style={{ padding: '5px 14px', borderRadius: 100, background: 'rgba(255,79,216,0.06)', border: '1px solid rgba(255,79,216,0.2)', color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>Add tags →</button>
            )}
          </div>
        </div>

        {/* Favorite Movie */}
        <div style={{ padding: '0 28px 20px' }}>
          <h3 style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>Favorite Movie</h3>
          {editing ? (
            <input className="input-base" value={form.favoriteMovie} onChange={e => setForm(f => ({ ...f, favoriteMovie: e.target.value }))} placeholder="Your favorite movie..." />
          ) : (
            <p style={{ fontSize: 13, color: profile.favoriteMovie ? 'var(--text)' : 'var(--muted)' }}>{profile.favoriteMovie || 'Not set'}</p>
          )}
        </div>

        {/* Account */}
        <div style={{ padding: '0 28px 40px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>Account</h3>
          <button onClick={() => setModal('privacy')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', fontSize: 14, transition: 'background 0.15s', textAlign: 'left' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}>
            <Shield size={15} color="var(--purple-light)" /> Privacy Settings
          </button>
          <button onClick={() => setModal('notifications')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', fontSize: 14, transition: 'background 0.15s', textAlign: 'left' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}>
            <Bell size={15} color="var(--purple-light)" /> Notification Preferences
          </button>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.2)', cursor: 'pointer', color: '#ff6b6b', fontSize: 14, transition: 'all 0.15s', textAlign: 'left' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,107,107,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,107,107,0.06)')}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* Privacy Modal */}
      {modal === 'privacy' && (
        <Modal title="Privacy Settings" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Toggle label="Show Profile to Others" description="Allow others to see your profile in the discover feed" checked={privacySettings.showProfile} onChange={v => setPrivacySettings(p => ({ ...p, showProfile: v }))} />
            <Toggle label="Anonymous Likes" description="Hide your identity when you like someone" checked={privacySettings.anonymousLikes} onChange={v => setPrivacySettings(p => ({ ...p, anonymousLikes: v }))} />
            <Toggle label="Online Status" description="Show when you're online to matches" checked={privacySettings.onlineStatus} onChange={v => setPrivacySettings(p => ({ ...p, onlineStatus: v }))} />
            <Toggle label="Show Department" description="Display your department on your profile" checked={privacySettings.departmentVisible} onChange={v => setPrivacySettings(p => ({ ...p, departmentVisible: v }))} />
            <div style={{ marginTop: 16 }}>
              <button onClick={saveSettings} className="btn-primary">Save Privacy Settings</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Notifications Modal */}
      {modal === 'notifications' && (
        <Modal title="Notification Preferences" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Toggle label="Match Notifications" description="Get notified when you have a new match" checked={notifSettings.matches} onChange={v => setNotifSettings(p => ({ ...p, matches: v }))} />
            <Toggle label="Anonymous Like Hints" description="Know when someone (you don't know who) liked you" checked={notifSettings.anonymousLikes} onChange={v => setNotifSettings(p => ({ ...p, anonymousLikes: v }))} />
            <Toggle label="New Messages" description="Get notified for new chat messages" checked={notifSettings.messages} onChange={v => setNotifSettings(p => ({ ...p, messages: v }))} />
            <Toggle label="Confession Activity" description="Notifications on your confession likes/comments" checked={notifSettings.confessions} onChange={v => setNotifSettings(p => ({ ...p, confessions: v }))} />
            <Toggle label="Cycle Reset Reminder" description="Get reminded when your 14-day cycle resets" checked={notifSettings.cycleReset} onChange={v => setNotifSettings(p => ({ ...p, cycleReset: v }))} />
            <div style={{ marginTop: 16 }}>
              <button onClick={saveSettings} className="btn-primary">Save Notification Settings</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}