'use client'

import {useState} from 'react'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Nicelydone'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(event) {
    event.preventDefault()
    setError(null)
    setResponse('')
    setLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({prompt}),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || `Request failed (${res.status})`)
        setLoading(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      for (;;) {
        const {done, value} = await reader.read()
        if (done) break
        setResponse((prev) => prev + decoder.decode(value, {stream: true}))
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          {APP_NAME}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">AI Briefs</h1>
        <p className="mt-2 text-slate-600">
          Generate a brief from any prompt. Streamed via the Vercel AI Gateway.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <label htmlFor="prompt" className="block text-sm font-medium text-slate-700">
          Prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          placeholder="e.g. Summarize the Next.js README for a product manager in five bullets"
          className="w-full rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || prompt.trim() === ''}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Generating…' : 'Generate brief'}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {(loading || response) && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Response
          </h2>
          <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-800 shadow-sm">
            {response || (loading ? 'Thinking…' : '')}
          </div>
        </section>
      )}
    </main>
  )
}
