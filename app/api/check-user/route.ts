import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/firebase/config'
import { doc, getDoc, collection, query, limit, getDocs } from 'firebase/firestore'

export async function GET(req: NextRequest) {
  try {
    const regNum = req.nextUrl.searchParams.get('reg') || 'TVE25CS004'

    const regSnap = await getDoc(doc(db, 'student_registry', regNum))
    const regData = regSnap.exists() ? {
      ...regSnap.data(),
      activated: regSnap.data().activated || false,
      userId: regSnap.data().userId || null,
    } : null

    const usersSnap = await getDocs(query(collection(db, 'users'), limit(20)))
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
      users: users.slice(0, 5),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: 500 })
  }
}