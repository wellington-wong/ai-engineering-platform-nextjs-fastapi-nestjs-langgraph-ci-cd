'use client'

import { useEffect, useState } from 'react'

import {
    createNote,
    getNotes,
    summarizeNote,
} from '@/app/(projects)/apps/ai-notes-summarizer/services/api'

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

    return (
        <div className="mx-auto max-w-7xl p-6 lg:p-8 container notes">

            <header className="mb-8">
                <h1 className="text-lg lg:text-2xl font-medium mb-6">AI Notes Summarizer</h1>
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
        </div>
    )

}

