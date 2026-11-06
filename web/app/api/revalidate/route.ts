import {revalidatePath} from 'next/cache'
import {NextRequest, NextResponse} from 'next/server'

/** Webhook Sanity: aggiorna il sito subito dopo la pubblicazione di un contenuto.
 *  Sanity → Manage → API → Webhooks → URL https://<dominio>/api/revalidate?secret=<REVALIDATE_SECRET> */
export async function POST(req: NextRequest) {
  if (!process.env.REVALIDATE_SECRET || req.nextUrl.searchParams.get('secret') !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ok: false}, {status: 401})
  }
  revalidatePath('/', 'layout')
  return NextResponse.json({ok: true, at: new Date().toISOString()})
}
