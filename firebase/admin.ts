import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc,
  query, where, orderBy, serverTimestamp, writeBatch,
  getCountFromServer
} from 'firebase/firestore'
import { db } from './config'
import Papa from 'papaparse'

// Upload CSV student registry
export async function uploadStudentRegistry(csvFile: File): Promise<{ success: number; errors: string[] }> {
  return new Promise((resolve) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const batch = writeBatch(db)
        const errors: string[] = []
        let success = 0

        for (const row of results.data as Record<string, string>[]) {
          const regNum = row['register_number'] || row['registerNumber'] || row['reg_no']
          if (!regNum) { errors.push(`Missing register number in row`); continue }

          const ref = doc(db, 'student_registry', regNum.trim().toUpperCase())
          batch.set(ref, {
            name: row['name'] || '',
            department: row['department'] || row['dept'] || '',
            gender: row['gender'] || '',
            year: parseInt(row['year'] || '1'),
            activated: false,
            uploadedAt: serverTimestamp(),
          }, { merge: true })
          success++
        }

        await batch.commit()
        resolve({ success, errors })
      }
    })
  })
}

// Get platform analytics
export async function getAnalytics() {
  const [usersSnap, matchesSnap, swipesSnap, confSnap] = await Promise.all([
    getCountFromServer(collection(db, 'users')),
    getCountFromServer(query(collection(db, 'matches'), where('active', '==', true))),
    getCountFromServer(collection(db, 'swipes')),
    getCountFromServer(query(collection(db, 'confessions'), where('approved', '==', true))),
  ])
  return {
    totalUsers: usersSnap.data().count,
    activeMatches: matchesSnap.data().count,
    totalSwipes: swipesSnap.data().count,
    totalConfessions: confSnap.data().count,
  }
}

// Get all users for admin management
export async function getAllUsers() {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Ban a user
export async function banUser(userId: string, reason: string) {
  await updateDoc(doc(db, 'users', userId), { banned: true, banReason: reason })
  await addDoc(collection(db, 'admin_logs'), {
    action: 'ban_user',
    targetUserId: userId,
    reason,
    createdAt: serverTimestamp(),
  })
}

// Set featured profile
export async function setFeaturedProfile(userId: string) {
  // Clear previous featured
  const prev = await getDocs(query(collection(db, 'users'), where('featuredToday', '==', true)))
  const batch = writeBatch(db)
  prev.docs.forEach(d => batch.update(d.ref, { featuredToday: false }))
  batch.update(doc(db, 'users', userId), { featuredToday: true })
  await batch.commit()
}
