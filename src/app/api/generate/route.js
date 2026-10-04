import {streamText} from 'ai'
import {z} from 'zod'

const schema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
})

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({error: 'Invalid JSON body'}, {status: 400})
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || 'Invalid request'
    return Response.json({error: message}, {status: 400})
  }

  // Routes through the Vercel AI Gateway (AI_GATEWAY_API_KEY on the server, or
  // the project's OIDC token on Vercel).
  const result = streamText({
    model: 'openai/gpt-5.4',
    prompt: parsed.data.prompt,
    onError({error}) {
      console.error('[generate] stream error:', error)
    },
  })

  // Consume the full stream so model/gateway errors are surfaced into the
  // response (and the logs) instead of the stream ending silently with no
  // output — e.g. a missing AI_GATEWAY_API_KEY or exhausted gateway credits.
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let emitted = false
      try {
        for await (const part of result.fullStream) {
          if (part.type === 'text-delta' || part.type === 'text') {
            const text = part.text ?? part.textDelta ?? ''
            if (text) {
              controller.enqueue(encoder.encode(text))
              emitted = true
            }
          } else if (part.type === 'error') {
            const message = part.error?.message || String(part.error)
            controller.enqueue(encoder.encode(`[error] ${message}`))
            emitted = true
          }
        }
      } catch (error) {
        console.error('[generate] stream error:', error)
        controller.enqueue(
          encoder.encode(`[error] ${error?.message || String(error)}`),
        )
        emitted = true
      }
      if (!emitted) {
        controller.enqueue(
          encoder.encode(
            '[error] The model returned no output. Check that AI_GATEWAY_API_KEY is set and the AI Gateway has available credits.',
          ),
        )
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {'Content-Type': 'text/plain; charset=utf-8'},
  })
}
