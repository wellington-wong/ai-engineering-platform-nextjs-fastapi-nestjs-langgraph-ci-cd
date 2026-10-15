export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'date';

export type FormField = {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  choices?: string[] | null;
  helper_text?: string | null;
};

export type FormStep = { title: string; description: string; fields: FormField[] };
export type Overview = { title: string; sections: Record<string, string | string[]> };
export type SessionResponse = {
  id: string;
  project_description: string;
  step_index: number;
  max_steps: number;
  user_facts: Record<string, unknown>;
  ai_inferences: string[];
  unanswered_questions: string[];
  interview_history: unknown[];
  current_step: FormStep | null;
  completed: boolean;
  final_overview: Overview | null;
};

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_AGENT ?? '').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) throw new Error('Set NEXT_PUBLIC_API_AGENT to the FastAPI server URL.');
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new Error('Could not reach the discovery API. Check its URL and that the server is running.');
  }
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body = await response.json();
      if (typeof body.detail === 'string') message = body.detail;
      else if (Array.isArray(body.detail)) message = body.detail.map((item: { msg?: string }) => item.msg).join(' ');
    } catch { /* Keep the status message when the response is not JSON. */ }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export function createSession(project_description: string) {
  return request<SessionResponse>('/sessions', { method: 'POST', body: JSON.stringify({ project_description }) });
}

export function submitAnswers(sessionId: string, step_index: number, answers: Record<string, unknown>) {
  return request<SessionResponse>(`/sessions/${encodeURIComponent(sessionId)}/answers`, {
    method: 'POST', body: JSON.stringify({ step_index, answers }),
  });
}

export function getOverview(sessionId: string) {
  return request<Overview>(`/sessions/${encodeURIComponent(sessionId)}/overview`);
}
