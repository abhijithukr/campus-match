import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'campus-match-cet'
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAUrOgX0FTIpkgQ_4iCWONDdX6ExeRHQzw'

    const headers: Record<string, string> = {}
    req.headers.forEach((v, k) => { headers[k] = v })

    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`

    const regRes = await fetch(`${baseUrl}/student_registry/TVE25CS004?key=${apiKey}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
    })

    const regData = await regRes.text()

    return NextResponse.json({
      serverUrl: req.headers.get('host') || 'unknown',
      projectId,
      apiKeyPrefix: apiKey.substring(0, 15) + '...',
      firestoreStatus: regRes.status,
      firestoreData: regData.substring(0, 500),
      envKeys: Object.keys(process.env).filter(k =>
        k.includes('FIREBASE') || k.includes('GOOGLE') || k.includes('GCLOUD')
      ),
    })
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      code: err.code,
      name: err.name,
    })
  }
}