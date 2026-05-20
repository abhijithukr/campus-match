import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth'
import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, where, getDocs, serverTimestamp, Timestamp
} from 'firebase/firestore'
import { auth, db } from './config'
import { UserProfile } from '@/types'

// Verify student register number in admin-uploaded registry
export async function verifyRegisterNumber(regNum: string) {
  try {
    const ref = doc(db, 'student_registry', regNum)
    const snap = await getDoc(ref)
    if (!snap.exists()) return { valid: false, data: null, reason: 'not_found' }
    const data = snap.data()
    if (data.activated) return { valid: false, data: null, reason: 'already_activated' }
    return { valid: true, data }
  } catch (err: any) {
    console.error('Firestore error:', err.code, err.message)
    throw err
  }
}

// Register new student
export async function registerStudent(
  regNum: string, email: string, password: string, displayName: string, photoUrl: string = ''
) {
  const { valid, data, reason } = await verifyRegisterNumber(regNum)
  if (!valid) throw new Error(reason === 'already_activated' ? 'This register number is already in use.' : 'Invalid register number.')
  const d = data!

  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })

  // Create user profile
  await setDoc(doc(db, 'users', credential.user.uid), {
    uid: credential.user.uid,
    fullName: displayName,
    registerNumber: regNum,
    email,
    gender: (d.gender as 'male' | 'female' | 'other') || 'other',
    department: d.department || '',
    year: parseInt(d.year || '1'),
    bio: '',
    profilePhoto: photoUrl,
    coverPhoto: '',
    hobbies: [],
    interests: [],
    musicTaste: [],
    favoriteMovie: '',
    instagram: '',
    relationshipGoal: 'not_sure' as const,
    personalityTags: [],
    whatsappNumber: '',
    online: true,
    lastSeen: serverTimestamp(),
    featuredToday: false,
    profileCompletion: 20,
    likesRemaining: 10,
    lastLikeReset: serverTimestamp(),
    createdAt: serverTimestamp(),
  })

  // Mark registry as activated
  await updateDoc(doc(db, 'student_registry', regNum), { activated: true, userId: credential.user.uid })

  return credential.user
}

export async function loginUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function logoutUser() {
  return signOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, 'users', uid), { ...data })
}
