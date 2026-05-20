import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/firebase/config'
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

export async function POST(req: NextRequest) {
  try {
    const { registerNumber, name } = await req.json()

    if (!registerNumber) {
      return NextResponse.json({ error: 'Register number required' }, { status: 400 })
    }

    const regNum = registerNumber.toString().toUpperCase().trim()
    const ref = doc(db, 'student_registry', regNum)

    await setDoc(ref, {
      name: name || 'Admin User',
      department: 'Computer Science',
      gender: 'other',
      year: 1,
      activated: false,
      userId: null,
      uploadedAt: serverTimestamp(),
    }, { merge: true })

    return NextResponse.json({ success: true, registerNumber: regNum, reset: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}