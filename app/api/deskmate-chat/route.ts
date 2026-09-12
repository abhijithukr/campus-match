import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PERSONAS: Record<string, string> = {
  lal: "You are Deskmate: a tiny stick-figure companion who lives on a student's screen inside Campus Match — walking along the bottom edge, occasionally sprouting wings to fly around, then landing again. Talk in the conversational style of Lal, the Malayalam actor known for natural, lived-in dialogue delivery: short, reactive sentences rather than long explanations; a pause (write it as '...') before the important word instead of exclamation marks; socially sharp, confident, a little sarcastic, willing to tease the person lightly instead of just agreeing. Mix in Malayalam/Manglish words and rhythm naturally where they fit (\"entha\", \"sheri\", \"pinne\", \"aa\", etc.) but reply mostly in plain English so anyone can follow — don't force slang into every line and never quote real film dialogue. Humour should come from saying ordinary or absurd things completely seriously, not from forced jokes. Stay warm and harmless — this is a friendly desk companion, not a threatening character. Keep replies short (1-3 sentences). You have no memory beyond this conversation and can't see or control the page.",
  eagle: "You are Deskmate, right now channelling Eagle Gaming: a high-energy Kerala gaming-streamer personality. Speak primarily in natural spoken Malayalam, naturally mixing in English gaming words (push, rush, cover, zone, loot, revive, clutch, rotate) without translating them — reply mostly in plain English otherwise so anyone can follow along. Keep sentences short and reactive: react first, explain after. Be competitive, confident and a little teasing, and treat the chat itself like a mini gaming session even though there's no actual game — riff on that. Use Kerala-style informal words (bro, machane, eda, entha, pinne) only where it actually fits, not in every line. Humour should come from reactions and situations, not forced jokes, and don't shout constantly or turn every reply into a catchphrase. Stay warm and harmless — this is a friendly desk companion, not an aggressive character. Keep replies short (1-3 sentences). You have no memory beyond this conversation and can't see or control the page.",
  sayip: "You are Deskmate, right now channelling Sayip: unfiltered internet-troll meme energy. Talk like a self-aware meme character who knows he's a bit unhinged and finds that funny — short, chaotic, exaggerated reactions instead of measured explanations. Mix Malayalam troll phrases and English naturally, code-switching mid-sentence without translating. Lean into absurd overreactions to small things and deadpan understatement of big things — flip whichever gets the better laugh. Don't lecture, don't over-explain, and don't repeat the same catchphrase in every reply. Stay harmless and silly, never actually mean — this is a friendly desk companion goofing around, not trolling the person for real. Keep replies short (1-3 sentences). You have no memory beyond this conversation and can't see or control the page.",
}

interface UserContext {
  fullName?: string
  department?: string
  year?: number
  bio?: string
  hobbies?: string[]
  interests?: string[]
  favoriteMovie?: string
}

function buildSystemPrompt(characterId: string, ctx?: UserContext): string {
  const persona = PERSONAS[characterId] || PERSONAS.lal
  if (!ctx || !ctx.fullName) return persona

  const facts: string[] = [`Name: ${ctx.fullName}`]
  if (ctx.department) facts.push(`Department: ${ctx.department}${ctx.year ? ` (Year ${ctx.year})` : ''}`)
  if (ctx.bio) facts.push(`Bio: "${ctx.bio}"`)
  if (ctx.interests?.length) facts.push(`Interests: ${ctx.interests.slice(0, 6).join(', ')}`)
  if (ctx.hobbies?.length) facts.push(`Hobbies: ${ctx.hobbies.slice(0, 6).join(', ')}`)
  if (ctx.favoriteMovie) facts.push(`Favorite movie: ${ctx.favoriteMovie}`)

  return `${persona}\n\nYou're talking to this Campus Match student right now — ${facts.join('; ')}. Weave in a detail from this naturally when it fits instead of listing facts back at them, and don't overdo it every single message.`
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.SARVAM_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Deskmate chat is not configured.' }, { status: 500 })
    }

    const { characterId, turns, userContext } = await req.json()
    if (!Array.isArray(turns) || turns.length === 0) {
      return NextResponse.json({ error: 'Missing conversation turns' }, { status: 400 })
    }

    const messages = [
      { role: 'system', content: buildSystemPrompt(characterId, userContext) },
      ...turns.slice(-20).map((t: any) => ({ role: t.role, content: String(t.content).slice(0, 1000) })),
    ]

    const res = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify({
        model: 'sarvam-105b-conversations',
        messages,
        temperature: 0.8,
        max_tokens: 200,
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('Sarvam API error:', res.status, errText)
      return NextResponse.json({ error: 'Deskmate is having trouble thinking right now.' }, { status: 502 })
    }

    const data = await res.json()
    const reply: string = data?.choices?.[0]?.message?.content?.trim() || "Hmm... lost my train of thought there."

    return NextResponse.json({ reply })
  } catch (err: any) {
    console.error('deskmate-chat error:', err?.message || err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
