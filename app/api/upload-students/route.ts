import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { db } from '@/firebase/config'
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const data = new Uint8Array(buffer)

    let jsonData: any[] = []

    if (file.name.endsWith('.csv')) {
      const text = new TextDecoder().decode(buffer)
      const lines = text.split('\n').filter(l => l.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const row: any = {}
        headers.forEach((h, idx) => { row[h] = values[idx] || '' })
        jsonData.push(row)
      }
    } else {
      const workbook = XLSX.read(data, { type: 'array', cellDates: true })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      jsonData = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' })
    }

    console.log(`Processing ${jsonData.length} rows...`)

    let dbInstance = db
    const batchSize = 500
    let success = 0
    let errors: string[] = []

    for (let i = 0; i < jsonData.length; i += batchSize) {
      const batch = writeBatch(dbInstance)
      const slice = jsonData.slice(i, i + batchSize)

      for (const row of slice) {
        const get = (key: string) => {
          const k = Object.keys(row).find(x => x.toLowerCase() === key.toLowerCase())
          return k ? String(row[k]) : ''
        }
        const regNumRaw = get('KTU ID') || get('register_number') || get('Register Number')
        const regNum = String(regNumRaw).trim().toUpperCase()
        if (!regNum) { errors.push(`Row ${i + 1}: Missing KTU ID`); continue }

        const name = get('Student Name') || get('name') || get('Name')
        const departmentRaw = get('Department') || get('dept')
        const deptMap: Record<string, string> = { CS: 'Computer Science', EL: 'Electronics', EE: 'Electrical', EC: 'Electronics & Communication', ME: 'Mechanical', IE: 'Industrial Engineering', CE: 'Civil', MBA: 'MBA', BBA: 'BBA', BT: 'Biotechnology' }
        const department = deptMap[departmentRaw] || departmentRaw

        const yearMap: Record<string, number> = { TVE22: 4, TVE23: 3, TVE24: 2, TVE25: 1 }
        let year = 1
        for (const [prefix, y] of Object.entries(yearMap)) {
          if (regNum.includes(prefix)) { year = y; break }
        }

        const genderRaw = (get('Gender') || get('gender')).trim().toLowerCase()
        let gender = 'other'
        if (genderRaw.startsWith('m')) gender = 'male'
        else if (genderRaw.startsWith('f')) gender = 'female'

        const ref = doc(dbInstance, 'student_registry', regNum)
        batch.set(ref, {
          name,
          department,
          gender,
          year,
          activated: false,
          uploadedAt: serverTimestamp(),
        }, { merge: true })
        success++
      }

      await batch.commit()
    }

    console.log(`Upload complete: ${success} success, ${errors.length} errors`)
    return NextResponse.json({ success, errors: errors.slice(0, 20) })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}