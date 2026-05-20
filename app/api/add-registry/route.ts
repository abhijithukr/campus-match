import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/firebase/config'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export async function POST(req: NextRequest) {
  try {
    const { registerNumber, name } = await req.json()

    if (!registerNumber) {
      return NextResponse.json({ error: 'Register number required' }, { status: 400 })
    }

    await setDoc(doc(db, 'student_registry', registerNumber.toString().toUpperCase().trim()), {
      name: name || 'Admin User',
      department: 'Computer Science',
      gender: 'other',
      year: 1,
      activated: false,
      uploadedAt: serverTimestamp(),
    }, { merge: true })

    return NextResponse.json({ success: true, registerNumber: registerNumber.toString().toUpperCase().trim() })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}