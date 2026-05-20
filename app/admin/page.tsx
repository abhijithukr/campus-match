'use client'
import { useState, useEffect, useRef } from 'react'
import { getAnalytics, getAllUsers, banUser, uploadStudentRegistry, setFeaturedProfile } from '@/firebase/admin'
import { getPendingConfessions, approveConfession, rejectConfession } from '@/firebase/confessions'
import { UploadCloud, Users, Heart, MessageSquare, Shield, CheckCircle, XCircle, BarChart2, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

type Tab = 'analytics' | 'users' | 'confessions' | 'registry'

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('analytics')
  const [stats, setStats] = useState({ totalUsers: 0, activeMatches: 0, totalSwipes: 0, totalConfessions: 0 })
  const [users, setUsers] = useState<any[]>([])
  const [confessions, setConfessions] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getAnalytics().then(setStats).catch(() => {})
    if (tab === 'users') getAllUsers().then(setUsers).catch(() => {})
    if (tab === 'confessions') getPendingConfessions().then(setConfessions).catch(() => {})
  }, [tab])

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadStudentRegistry(file)
      toast.success(`Uploaded ${result.success} students successfully!`)
      if (result.errors.length) toast.error(`${result.errors.length} rows had errors.`)
    } catch { toast.error('Upload failed.') }
    finally { setUploading(false) }
  }

  const handleBan = async (uid: string, name: string) => {
    if (!confirm(`Ban ${name}?`)) return
    await banUser(uid, 'Admin action')
    toast.success(`${name} has been banned.`)
    setUsers(u => u.filter((x: any) => x.uid !== uid))
  }

  const handleApprove = async (id: string) => {
    await approveConfession(id)
    setConfessions(c => c.filter((x: any) => x.id !== id))
    toast.success('Confession approved!')
  }

  const handleReject = async (id: string) => {
    await rejectConfession(id)
    setConfessions(c => c.filter((x: any) => x.id !== id))
    toast.success('Confession rejected.')
  }

  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'confessions', icon: FileText, label: 'Confessions' },
    { id: 'registry', icon: UploadCloud, label: 'Registry' },
  ]

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800 }}>{value.toLocaleString()}</div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={16} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700 }}>Admin Dashboard</h1>
          <p style={{ fontSize: 11, color: 'var(--muted)' }}>Campus Match · Internal Tools</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '12px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10,
            border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            background: tab === id ? 'rgba(138,43,226,0.15)' : 'transparent',
            color: tab === id ? 'var(--purple-light)' : 'var(--muted)',
            transition: 'all 0.2s'
          }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

        {/* ANALYTICS */}
        {tab === 'analytics' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
              <StatCard icon={Users} label="Total Students" value={stats.totalUsers} color="var(--purple)" />
              <StatCard icon={Heart} label="Active Matches" value={stats.activeMatches} color="var(--pink)" />
              <StatCard icon={MessageSquare} label="Total Swipes" value={stats.totalSwipes} color="#22c55e" />
              <StatCard icon={FileText} label="Confessions Live" value={stats.totalConfessions} color="#f97316" />
            </div>

            {/* Simple bar chart visual */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Weekly Activity (Demo)</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
                {[40, 65, 50, 80, 95, 70, 85].map((h, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: '100%', height: `${h}%`, background: 'var(--grad)', borderRadius: '6px 6px 0 0', opacity: 0.7 + i * 0.04, transition: 'height 0.6s' }} />
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 20 }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Gender Distribution</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[{ label: 'Female', pct: 52, color: 'var(--pink)' }, { label: 'Male', pct: 44, color: 'var(--purple)' }, { label: 'Other', pct: 4, color: '#22c55e' }].map(g => (
                    <div key={g.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'var(--muted)' }}>{g.label}</span>
                        <span style={{ fontWeight: 600 }}>{g.pct}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${g.pct}%`, background: g.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 20 }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Top Departments</h3>
                {[{ dept: 'Computer Science', count: 34 }, { dept: 'Electronics', count: 22 }, { dept: 'Commerce', count: 18 }, { dept: 'MBA', count: 14 }].map(d => (
                  <div key={d.dept} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span>{d.dept}</span>
                    <span style={{ color: 'var(--purple-light)', fontWeight: 600 }}>{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700 }}>All Students ({users.length})</h3>
              </div>
              {users.slice(0, 20).map((u: any) => (
                <div key={u.uid} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                    {u.fullName?.[0] || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{u.fullName}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.department} · {u.registerNumber}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setFeaturedProfile(u.uid).then(() => toast.success('Featured profile set!'))} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,210,0,0.3)', background: 'rgba(255,210,0,0.08)', color: '#ffd200', fontSize: 11, cursor: 'pointer' }}>⭐ Feature</button>
                    <button onClick={() => handleBan(u.uid, u.fullName)} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.08)', color: '#ff6b6b', fontSize: 11, cursor: 'pointer' }}>Ban</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONFESSIONS */}
        {tab === 'confessions' && (
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Pending Approval ({confessions.length})</h2>
            {confessions.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', paddingTop: 60 }}>
                <CheckCircle size={40} color="var(--muted)" style={{ margin: '0 auto 12px' }} />
                <p>All caught up! No pending confessions.</p>
              </div>
            ) : confessions.map((c: any) => (
              <div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>{c.department} · {c.year}th Year</div>
                <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 14 }}>{c.text}</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => handleApprove(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)', color: '#22c55e', cursor: 'pointer', fontSize: 13 }}>
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button onClick={() => handleReject(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.08)', color: '#ff6b6b', cursor: 'pointer', fontSize: 13 }}>
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REGISTRY UPLOAD */}
        {tab === 'registry' && (
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Upload Student Registry</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.7 }}>
              Upload a CSV file with the official student list. Students can only register after their register number is in this database.
            </p>

            <div style={{ background: 'var(--surface)', border: '2px dashed var(--border)', borderRadius: 20, padding: '48px 32px', textAlign: 'center', marginBottom: 20, cursor: 'pointer', transition: 'border-color 0.2s' }}
              onClick={() => fileRef.current?.click()}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--purple)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <UploadCloud size={40} color="var(--purple)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 8 }}>{uploading ? 'Uploading...' : 'Drop CSV here or click to upload'}</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>Supports .csv files up to 10MB</p>
              <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCSVUpload} />
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Required CSV Columns</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['register_number', 'name', 'department', 'gender', 'year'].map(col => (
                  <div key={col} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple)', flexShrink: 0 }} />
                    <code style={{ background: 'var(--surface2)', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{col}</code>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 10, fontSize: 12, color: 'var(--muted)', fontFamily: 'monospace' }}>
                register_number,name,department,gender,year<br />
                CS21B001,Aisha Kumar,Computer Science,female,3<br />
                EC21B002,Rohan Verma,Electronics,male,2
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
