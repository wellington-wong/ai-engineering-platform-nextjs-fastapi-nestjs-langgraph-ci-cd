'use client'

import { useEffect, useState } from 'react'

import {
  createNote,
  getNotes,
  summarizeNote,
} from '@/app/(projects)/apps/ai-notes-summarizer/services/api'

import { Note } from '@/app/types/note'
import '@/app/(projects)/apps/ai-notes-summarizer/notes.css';
export default function Home() {
  const [content, setContent] = useState<string>('')
  const [notes, setNotes] = useState<Note[]>([])
  const [summarizingNoteId, setSummarizingNoteId] = useState<number | null>(null)

  const loadNotes = async () => {
    const data = await getNotes();
    setNotes(data.reverse())
  }

  useEffect(() => {
    loadNotes()
  }, [])

  const handleCreate = async () => {
    if (!content.trim()) return
    await createNote(1, content)

    setContent('')
    loadNotes()
  }

  const handleSummarize = async (
      id: number
  ) => {
    setSummarizingNoteId(id)
    try {
      await summarizeNote(id)
      await loadNotes()
    } finally {
      setSummarizingNoteId(null)
    }
  }

  return (
      <div className="container notes">

        <h1>AI Notes Summarizer</h1>

        <form
          className="note-form"
          onSubmit={(e) => {
            e.preventDefault()
            handleCreate()
          }}
        >
          <label htmlFor="note-content">Your note</label>
          <textarea
            id="note-content"
            placeholder="Write your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button type="submit" disabled={!content.trim()}>
            Save Note
          </button>
        </form>

        {notes.map((note) => (
            <div className="note" key={note.id}>
              <h3>Note</h3>

              <p>{note.content}</p>

              {note.summary && (
                  <>
                    <h5>Summary</h5>
                    <p>{note.summary}</p>
                  </>
              )}

              {!note.summary&&<button onClick={() =>
                  handleSummarize(note.id)
              }
              >
                {summarizingNoteId === note.id ? 'Thinking...' : 'Summarize with AI'}
              </button>}
            </div>
        ))}
      </div>
  )

}














































/*import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
*/
