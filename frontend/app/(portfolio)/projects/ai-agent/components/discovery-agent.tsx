'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSession, getOverview, submitAnswers, type FormField, type Overview, type SessionResponse } from '../services/api';

type Values = Record<string, string | number | string[]>;

function FieldControl({ field, value, onChange }: { field: FormField; value: Values[string] | undefined; onChange: (value: Values[string]) => void }) {
  const common = { id: field.id, name: field.id, required: field.required, 'aria-describedby': field.helper_text ? `${field.id}-help` : undefined };
  if (field.type === 'textarea') return <textarea {...common} value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(event.target.value)} rows={4} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />;
  if (field.type === 'select') return <select {...common} value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"><option value="" disabled>Select an option</option>{(field.choices ?? []).map((choice) => <option key={choice} value={choice}>{choice}</option>)}</select>;
  if (field.type === 'radio' || field.type === 'checkbox') return <div className="space-y-2">{(field.choices ?? []).map((choice) => {
    const checked = field.type === 'checkbox' ? Array.isArray(value) && value.includes(choice) : value === choice;
    return <label key={choice} className="flex items-center gap-2 text-sm text-gray-700"><input type={field.type} name={field.id} value={choice} checked={checked} required={field.type === 'radio' && field.required} onChange={(event) => {
      if (field.type === 'radio') onChange(choice);
      else { const selected = Array.isArray(value) ? value : []; onChange(event.target.checked ? [...selected, choice] : selected.filter((item) => item !== choice)); }
    }} className="accent-orange-600" />{choice}</label>;
  })}</div>;
  return <Input {...common} type={field.type} value={value ?? ''} onChange={(event) => onChange(field.type === 'number' ? (event.target.value === '' ? '' : Number(event.target.value)) : event.target.value)} className="w-full" />;
}

function OverviewSections({ overview }: { overview: Overview }) {
  return <div className="space-y-6"><h2 className="text-xl font-semibold text-gray-900">{overview.title}</h2>{Object.entries(overview.sections ?? {}).map(([name, content]) => <section key={name}><h3 className="mb-2 font-medium capitalize text-gray-900">{name.replaceAll('_', ' ')}</h3>{Array.isArray(content) ? content.length ? <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">{content.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p className="text-sm text-gray-500">None identified.</p> : <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">{content}</p>}</section>)}</div>;
}

export default function DiscoveryAgent() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [projectDescription, setProjectDescription] = useState('');
  const [answers, setAnswers] = useState<Values>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError('');
    try { const created = await createSession(projectDescription.trim()); setSession(created); setAnswers({}); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to start a project.'); }
    finally { setPending(false); }
  }

  async function handleAnswers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!session) return;
    setPending(true); setError('');
    try {
      const current = session.current_step;
      if (!current) return;
      const payload: Record<string, unknown> = {};
      for (const field of current.fields) {
        const value = answers[field.id];
        if (field.required && (value === undefined || value === '' || (Array.isArray(value) && value.length === 0))) {
          setError(`“${field.label}” is required.`);
          setPending(false);
          return;
        }
        if (value !== undefined && value !== '') payload[field.id] = value;
      }
      const updated = await submitAnswers(session.id, session.step_index, payload);
      setSession(updated);
      if (updated.completed) setOverview(updated.final_overview ?? await getOverview(updated.id));
      setAnswers({});
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to submit answers.'); }
    finally { setPending(false); }
  }

  function startNew() { setSession(null); setOverview(null); setProjectDescription(''); setAnswers({}); setError(''); }
  const step = session?.current_step;
  const progress = session ? Math.min(100, Math.round((session.step_index / session.max_steps) * 100)) : 0;
  const setValue = (id: string, value: Values[string]) => setAnswers((existing) => ({ ...existing, [id]: value }));

  return <div className="mx-auto max-w-7xl p-6 lg:p-8">

    <header className="mb-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">AI Agent</h1>
      <p className="mt-2 text-gray-500">Describe your project and answer a few adaptive questions to build a project overview.</p>
    </header>
    <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
      {overview ? <><OverviewSections overview={overview} /><Button type="button" onClick={startNew} className="mt-8">Start a new project</Button></> : !session ? <form onSubmit={handleCreate} className="space-y-5">
        <div><Label htmlFor="project-description" className="mb-2 block text-sm font-medium">What project would you like to explore?</Label><textarea id="project-description" value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} required maxLength={10000} rows={6} placeholder="Describe the project, the problem it addresses, and anything you already know." className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" /><p className="mt-1 text-xs text-gray-500">Up to 10,000 characters.</p></div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}<Button type="submit" disabled={pending || !projectDescription.trim()}>{pending ? 'Starting project…' : 'Start discovery'}</Button>
      </form> : <>
        <div className="mb-6"><div className="mb-2 flex justify-between text-sm"><span className="font-medium text-gray-900">Discovery progress</span><span className="text-gray-500">Step {Math.min(session.step_index + 1, session.max_steps)} of {session.max_steps}</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-orange-600 transition-all" style={{ width: `${progress}%` }} /></div></div>
        {step ? <><h2 className="text-xl font-semibold text-gray-900">{step.title}</h2><p className="mt-2 mb-6 text-sm leading-6 text-gray-600">{step.description}</p><form onSubmit={handleAnswers} className="space-y-5">{step.fields.map((field) => <div key={field.id} className="space-y-2"><Label htmlFor={field.id} className="block text-sm font-medium text-gray-800">{field.label}{field.required && <span className="text-red-600"> *</span>}</Label><FieldControl field={field} value={answers[field.id]} onChange={(value) => setValue(field.id, value)} />{field.helper_text && <p id={`${field.id}-help`} className="text-xs text-gray-500">{field.helper_text}</p>}</div>)}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}<div className="flex flex-wrap gap-3 pt-2"><Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Continue'}</Button><Button type="button" variant="outline" onClick={startNew} disabled={pending}>Start a new project</Button></div>
        </form></> : <p role="status" className="text-sm text-gray-600">Preparing your next question…</p>}
      </>}
    </section>
  </div>;
}
