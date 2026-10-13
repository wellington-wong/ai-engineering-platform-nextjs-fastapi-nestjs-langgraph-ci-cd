import axios from 'axios'
import { Note } from '@/app/types/note'



const API = process.env.NEXT_PUBLIC_API

export const getNotes = async (): Promise<Note[]> => {
    const res = await axios.get(`${API}/notes`)
    return res.data
}

export const createNote = async (

    user_id: number,
    content: string
): Promise<Note> => {
    const res = await axios.post(`${API}/notes`, {
        user_id,
        content,
    })
    return res.data
}

export const summarizeNote = async (
    id: number
): Promise<Note> => {
    const res = await axios.post(
        `${API}/notes/${id}/summarize`
    )

    return res.data
}


