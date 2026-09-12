'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, User, Mail, Lock, Phone, Heart, Camera, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { registerStudent } from '@/firebase/auth'
import { uploadImage } from '@/firebase/storage'
import toast from 'react-hot-toast'

const DEPARTMENTS = ['Computer Science', 'Electrical', 'Computer', 'Mechanical', 'Civil', 'MBA', 'Commerce', 'Arts', 'Science', 'Law', 'Medicine', 'Industrial']
const RELATIONSHIP_GOALS = [
  { value: 'friendship', label: 'Friendship' },
  { value: 'relationship', label: 'Relationship' },
  { value: 'casual', label: 'Casual Hangouts' },
  { value: 'not_sure', label: 'Not Sure Yet' },
]

function Field({ label, icon: Icon, children }: any) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', marginBottom: 8 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={16} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />}
        {children}
      </div>
    </div>
  )
}

function Choice({ active, children, ...props }: any) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      {...props}
      style={{
        borderRadius: 10, border: '1px solid',
        borderColor: active ? 'var(--purple)' : 'var(--border)',
        background: active ? 'color-mix(in srgb, var(--purple) 14%, var(--surface2))' : 'var(--surface2)',
        color: active ? 'var(--purple-light)' : 'var(--muted)',
        cursor: 'pointer', fontWeight: 600, transition: 'border-color .2s, background .2s, color .2s',
        ...props.style,
      }}
    >
      {children}
    </motion.button>
  )
}

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

  const photoPreview = useMemo(() => profilePhoto ? URL.createObjectURL(profilePhoto) : null, [profilePhoto])
  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview) }, [photoPreview])

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let photoUrl = ''
      if (profilePhoto) {
        try {
          photoUrl = await uploadImage(profilePhoto, 'campus-match/profiles')
        } catch {}
      }
      try {
        const user = await registerStudent(regNum, form.email, form.password, form.fullName, photoUrl, form.gender)
        await fetch('/api/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.uid, email: form.email }),
        })
        router.push('/auth/verify-email')
      } catch (err: any) {
        toast.error(err.message || 'Registration failed.')
      }
    } catch { }
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'inline-flex', width: 60, height: 60, borderRadius: 18,
            background: 'var(--grad)', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
            boxShadow: '0 14px 28px -10px color-mix(in srgb, var(--purple) 60%, transparent)',
          }}
        >
          <Heart size={26} color="var(--on-bright)" fill="var(--on-bright)" />
        </motion.div>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700 }}>Create your profile</h1>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'var(--green)', color: 'var(--green-strong)',
            border: '1px solid color-mix(in srgb, var(--green-strong) 35%, transparent)',
            borderRadius: 100, padding: '4px 12px', fontSize: 12, fontWeight: 700,
          }}>
            <Check size={12} /> {regNum} Verified
          </span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[1, 2].map(s => (
          <div key={s} style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--surface2)', overflow: 'hidden' }}>
            <motion.div
              initial={false}
              animate={{ width: s <= step ? '100%' : '0%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%', background: 'var(--grad)' }}
            />
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 26, padding: 30,
        boxShadow: '0 24px 48px -16px rgba(38,65,67,0.14)', overflow: 'hidden',
      }}>
        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <Field label="Full Name" icon={User}>
                  <input id="signup-name" className="input-base" required value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Your full name" style={{ paddingLeft: 40 }} />
                </Field>
                <Field label="Email Address" icon={Mail}>
                  <input id="signup-email" className="input-base" type="email" required value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@college.edu" style={{ paddingLeft: 40 }} />
                </Field>
                <Field label="Password" icon={Lock}>
                  <input id="signup-password" className="input-base" type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min 8 characters" style={{ paddingLeft: 40, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </Field>
                <Field label="WhatsApp Number" icon={Phone}>
                  <input id="signup-whatsapp" className="input-base" value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} placeholder="+91 98765 43210" style={{ paddingLeft: 40 }} />
                </Field>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', marginBottom: 8 }}>Profile Photo</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 14, border: '1px dashed var(--border2)', cursor: 'pointer', background: 'var(--surface2)', transition: 'border-color 0.2s' }}>
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoPreview} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Camera size={16} color="var(--muted)" />
                      </span>
                    )}
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {profilePhoto ? profilePhoto.name : 'Add a photo (optional)'}
                    </span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setProfilePhoto(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }} className="btn-primary" type="submit">
                  <span>Continue</span><ArrowRight size={16} />
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <div>
                  <label htmlFor="signup-department" style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', marginBottom: 8 }}>Department</label>
                  <select id="signup-department" className="input-base" value={form.department} onChange={e => update('department', e.target.value)} required style={{ cursor: 'pointer' }}>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', marginBottom: 8 }}>Year</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {['1', '2', '3', '4'].map(y => (
                      <Choice key={y} active={form.year === y} onClick={() => update('year', y)} style={{ padding: 10, fontSize: 14 }}>{y}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', marginBottom: 8 }}>Gender</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {['Male', 'Female', 'Other'].map(g => (
                      <Choice key={g} active={form.gender === g.toLowerCase()} onClick={() => update('gender', g.toLowerCase())} style={{ padding: 10, fontSize: 13 }}>{g}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', marginBottom: 8 }}>Looking for</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {RELATIONSHIP_GOALS.map(g => (
                      <Choice key={g.value} active={form.relationshipGoal === g.value} onClick={() => update('relationshipGoal', g.value)} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14 }}>{g.label}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="signup-bio" style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', marginBottom: 8 }}>Short Bio</label>
                  <textarea
                    id="signup-bio"
                    className="input-base" rows={3} maxLength={160}
                    value={form.bio} onChange={e => update('bio', e.target.value)}
                    placeholder="Tell people a bit about yourself…"
                    style={{ resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <motion.button whileTap={{ scale: 0.97 }} type="button" className="btn-ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>
                    <ArrowLeft size={15} /> Back
                  </motion.button>
                  <motion.button whileHover={{ scale: loading ? 1 : 1.015 }} whileTap={{ scale: loading ? 1 : 0.985 }} className="btn-primary" type="submit" disabled={loading} style={{ flex: 2 }}>
                    {loading ? 'Creating account…' : 'Join Love Pic'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </motion.div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>}>
      <SignupForm />
    </Suspense>
  )
}
