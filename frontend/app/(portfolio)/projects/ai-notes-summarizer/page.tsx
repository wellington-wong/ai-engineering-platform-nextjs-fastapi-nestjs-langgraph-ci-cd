import type { Metadata } from 'next';
import NotesClient from './notes-client';

export const metadata: Metadata = {
  title: 'AI Notes Summarizer',
};

export default function AiNotesSummarizerPage() {
  return <NotesClient />;
}
