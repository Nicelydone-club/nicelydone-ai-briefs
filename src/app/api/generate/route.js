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

  // Routes through the Vercel AI Gateway using AI_GATEWAY_API_KEY.
  const result = streamText({
    model: 'openai/gpt-5.4',
    prompt: parsed.data.prompt,
  })

  return result.toTextStreamResponse()
}
