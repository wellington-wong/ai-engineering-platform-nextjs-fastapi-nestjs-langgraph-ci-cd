'use client'

import { useEffect, useState } from 'react'

import {
    createNote,
    getNotes,
    summarizeNote,
} from '@/app/(portfolio)/projects/ai-notes-summarizer/services/api'

import { Note } from '@/app/types/note'
import './notes.css';
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
    const techStack = [ "Next.js", "FastAPI", "OpenAI", "PostgreSQL", "Docker", "CI/CD" ];
    return (
        <div className="mx-auto max-w-7xl p-6 lg:p-8 container notes">

            <header className="mb-5">
                <h1 className="text-lg lg:text-2xl font-medium">AI Notes Summarizer</h1>


                <p className="mt-2 text-gray-500">An AI-powered agent built with FastAPI and OpenAI to understand user requests,
                    reason through tasks, and generate intelligent responses. Designed with a scalable backend architecture to
                    support extensible AI workflows and integrations.</p>
            </header>
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

            <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                    {techStack.map((tech) => (
                        <span
                            key={tech}
                            className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700"
                        >
                          {tech}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )

}

