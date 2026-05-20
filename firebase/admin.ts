import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc,
  query, where, orderBy, serverTimestamp, writeBatch,
  getCountFromServer
} from 'firebase/firestore'
import { db } from './config'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

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

// Upload XLSX student registry
export async function uploadStudentRegistryXlsx(xlsxFile: File): Promise<{ success: number; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' })

        const batch = writeBatch(db)
        const errors: string[] = []
        let success = 0

        for (const row of jsonData) {
          const regNum = row['register_number'] || row['registerNumber'] || row['reg_no'] || row['KTU ID'] || row['KTU_ID'] || row['Reg No'] || row['Reg No.'] || ''
          if (!regNum) { errors.push(`Missing register number: ${JSON.stringify(row).slice(0, 100)}`); continue }

          const name = row['name'] || row['Name'] || row['NAME'] || row['Full Name'] || row['full_name'] || ''
          const department = row['department'] || row['Department'] || row['DEPARTMENT'] || row['dept'] || row['Branch'] || row['course'] || ''
          const gender = row['gender'] || row['Gender'] || row['GENDER'] || ''
          const year = parseInt(String(row['year'] || row['Year'] || row['YEAR'] || row['Semester'] || '1').replace(/[^0-9]/g, '')) || 1

          const ref = doc(db, 'student_registry', String(regNum).trim().toUpperCase())
          batch.set(ref, {
            name: String(name).trim(),
            department: String(department).trim(),
            gender: String(gender).trim().toLowerCase(),
            year,
            activated: false,
            uploadedAt: serverTimestamp(),
          }, { merge: true })
          success++
        }

        await batch.commit()
        resolve({ success, errors })
      } catch (err) {
        resolve({ success: 0, errors: [String(err)] })
      }
    }
    reader.onerror = () => resolve({ success: 0, errors: ['Failed to read file'] })
    reader.readAsArrayBuffer(xlsxFile)
  })
}

// Get platform analytics
export async function getAnalytics() {
  try {
    const [usersSnap, matchesSnap, swipesSnap, confSnap] = await Promise.all([
      getDocs(query(collection(db, 'users'))),
      getDocs(query(collection(db, 'matches'), where('active', '==', true))),
      getDocs(collection(db, 'swipes')),
      getDocs(query(collection(db, 'confessions'), where('approved', '==', true))),
    ])
    return {
      totalUsers: usersSnap.size,
      activeMatches: matchesSnap.size,
      totalSwipes: swipesSnap.size,
      totalConfessions: confSnap.size,
    }
  } catch {
    return { totalUsers: 0, activeMatches: 0, totalSwipes: 0, totalConfessions: 0 }
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
