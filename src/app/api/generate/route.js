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
  })

  // Stream the text, surfacing any model/gateway error into the response and
  // the logs instead of ending silently.
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.textStream) {
          controller.enqueue(encoder.encode(chunk))
        }
      } catch (error) {
        console.error('[generate] stream error:', error)
        controller.enqueue(
          encoder.encode(`[error] ${error?.message || String(error)}`),
        )
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {'Content-Type': 'text/plain; charset=utf-8'},
  })
}
