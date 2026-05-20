'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Eye, EyeOff, User, Mail, Lock, Phone, Heart, Camera } from 'lucide-react'
import { registerStudent } from '@/firebase/auth'
import { uploadImage } from '@/firebase/storage'
import toast from 'react-hot-toast'

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'MBA', 'Commerce', 'Arts', 'Science', 'Law', 'Medicine']
const RELATIONSHIP_GOALS = [
  { value: 'friendship', label: '🤝 Friendship' },
  { value: 'relationship', label: '💕 Relationship' },
  { value: 'casual', label: '☕ Casual Hangouts' },
  { value: 'not_sure', label: '🤷 Not Sure Yet' },
]

function SignupForm() {
  const params = useSearchParams()
  const router = useRouter()
  const regNum = params.get('reg') || ''

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', whatsapp: '',
    department: '', year: '1', gender: '', relationshipGoal: '', bio: ''
  })
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    const name = params.get('name') || ''
    setForm(f => ({ ...f, fullName: name }))
  }, [params])

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let photoUrl = ''
      if (profilePhoto) {
        photoUrl = await uploadImage(profilePhoto, 'campus-match/profiles')
      }
      await registerStudent(regNum, form.email, form.password, form.fullName, photoUrl)
      toast.success('Account created! Welcome to Campus Match 🎉')
      router.push('/discover')
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  const Field = ({ label, icon: Icon, children }: any) => (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={15} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />}
        {children}
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', width: 56, height: 56, borderRadius: 16,
          background: 'var(--grad)', alignItems: 'center', justifyContent: 'center', marginBottom: 16
        }}>
          <Heart size={24} color="white" fill="white" />
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800 }}>Create your profile</h1>
        <div style={{ color: 'var(--muted)', marginTop: 6, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 100, padding: '2px 10px', fontSize: 11 }}>
            ✓ {regNum} Verified
          </span>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[1, 2].map(s => (
          <div key={s} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: s <= step ? 'var(--grad)' : 'var(--surface2)',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 32 }}>
        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {step === 1 && (<>
            <Field label="Full Name" icon={User}>
              <input className="input-base" required value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Your full name" style={{ paddingLeft: 40 }} />
            </Field>
            <Field label="Email Address" icon={Mail}>
              <input className="input-base" type="email" required value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@college.edu" style={{ paddingLeft: 40 }} />
            </Field>
            <Field label="Password" icon={Lock}>
              <input className="input-base" type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min 8 characters" style={{ paddingLeft: 40, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </Field>
            <Field label="WhatsApp Number" icon={Phone}>
              <input className="input-base" value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} placeholder="+91 98765 43210" style={{ paddingLeft: 40 }} />
            </Field>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Profile Photo</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, border: '1px dashed var(--border)', cursor: 'pointer', background: 'var(--surface2)', transition: 'border-color 0.2s' }}>
                <Camera size={16} color="var(--muted)" />
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {profilePhoto ? profilePhoto.name : 'Add a photo (optional)'}
                </span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setProfilePhoto(e.target.files?.[0] || null)} />
              </label>
            </div>
            <button className="btn-primary" type="submit">Continue →</button>
          </>)}
          {step === 2 && (<>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Department</label>
              <select className="input-base" value={form.department} onChange={e => update('department', e.target.value)} required style={{ cursor: 'pointer' }}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Year</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {['1', '2', '3', '4'].map(y => (
                  <button key={y} type="button" onClick={() => update('year', y)} style={{
                    padding: '10px', borderRadius: 10, border: '1px solid',
                    borderColor: form.year === y ? 'var(--purple)' : 'var(--border)',
                    background: form.year === y ? 'rgba(138,43,226,0.15)' : 'var(--surface2)',
                    color: form.year === y ? 'var(--purple-light)' : 'var(--muted)',
                    cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s'
                  }}>{y}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Gender</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {['Male', 'Female', 'Other'].map(g => (
                  <button key={g} type="button" onClick={() => update('gender', g.toLowerCase())} style={{
                    padding: '10px', borderRadius: 10, border: '1px solid',
                    borderColor: form.gender === g.toLowerCase() ? 'var(--purple)' : 'var(--border)',
                    background: form.gender === g.toLowerCase() ? 'rgba(138,43,226,0.15)' : 'var(--surface2)',
                    color: form.gender === g.toLowerCase() ? 'var(--purple-light)' : 'var(--muted)',
                    cursor: 'pointer', fontSize: 13, transition: 'all 0.2s'
                  }}>{g}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Looking for</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {RELATIONSHIP_GOALS.map(g => (
                  <button key={g.value} type="button" onClick={() => update('relationshipGoal', g.value)} style={{
                    padding: '12px 16px', borderRadius: 12, border: '1px solid', textAlign: 'left',
                    borderColor: form.relationshipGoal === g.value ? 'var(--purple)' : 'var(--border)',
                    background: form.relationshipGoal === g.value ? 'rgba(138,43,226,0.1)' : 'var(--surface2)',
                    color: form.relationshipGoal === g.value ? 'var(--text)' : 'var(--muted)',
                    cursor: 'pointer', fontSize: 14, transition: 'all 0.2s'
                  }}>{g.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Short Bio</label>
              <textarea
                className="input-base" rows={3} maxLength={160}
                value={form.bio} onChange={e => update('bio', e.target.value)}
                placeholder="Tell people a bit about yourself... ✨"
                style={{ resize: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn-ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
              <button className="btn-primary" type="submit" disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Creating account...' : '🎉 Join Campus Match'}
              </button>
            </div>
          </>)}
        </form>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}
