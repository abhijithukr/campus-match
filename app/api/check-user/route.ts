import { NextRequest, NextResponse } from 'next/server'
import * as admin from 'firebase-admin'

let adminDb: admin.firestore.Firestore | null = null

function initAdminDb(): admin.firestore.Firestore {
  if (adminDb) return adminDb
  if (admin.apps.length > 0) {
    adminDb = admin.firestore(admin.apps[0]!)
    return adminDb
  }
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'campus-match-cet'
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      const cred = admin.credential.cert(sa)
      admin.initializeApp({ credential: cred, projectId })
    } else {
      admin.initializeApp({ projectId })
    }
  } catch {
    admin.initializeApp({ projectId })
  }
  adminDb = admin.firestore()
  return adminDb
}

export async function GET(req: NextRequest) {
  try {
    const db = initAdminDb()
    const regNum = req.nextUrl.searchParams.get('reg') || 'TVE25CS004'

    const regSnap = await db.doc('student_registry/' + regNum).get()
    const regData = regSnap.exists ? {
      ...regSnap.data(),
      activated: regSnap.data()?.activated || false,
      userId: regSnap.data()?.userId || null,
    } : null

    const usersSnap = await db.collection('users').limit(20).get()
    const users = usersSnap.docs.map(d => ({
      uid: d.id,
      fullName: d.data().fullName || '',
      registerNumber: d.data().registerNumber || '',
      email: d.data().email || '',
    }))

    return NextResponse.json({
      regNum,
      registry: regData,
      totalUsers: usersSnap.size,
      users,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = initAdminDb()
    const { registerNumber, userIdToReset } = await req.json()
    const regNum = (registerNumber || 'TVE25CS004').toUpperCase().trim()

    await db.doc('student_registry/' + regNum).set({
      activated: false,
      userId: null,
      resetAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })

    if (userIdToReset) {
      await db.doc('users/' + userIdToReset).delete().catch(() => {})
    }

    return NextResponse.json({ success: true, registerNumber: regNum })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}