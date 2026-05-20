import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'campus-match-cet'
    const apiKey = process.env.FIREBASE_API_KEY || process.env.FIREBASE_ADMIN_KEY

    const tokenRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/Jwks?key=${apiKey}`,
      { next: { revalidate: 0 } }
    )
    const tokenData = await tokenRes.json()

    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`

    const registryRes = await fetch(`${baseUrl}/student_registry/TVE25CS004?key=${apiKey}`, {
      next: { revalidate: 0 },
      headers: { 'Authorization': `Bearer test` },
    })

    return NextResponse.json({
      projectId,
      apiKeyExists: !!apiKey,
      envVars: Object.keys(process.env).filter(k => k.includes('FIREBASE') || k.includes('GCLOUD') || k.includes('GOOGLE')),
      identitytoolkitStatus: tokenRes.status,
      firestoreStatus: registryRes.status,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message })
  }
}