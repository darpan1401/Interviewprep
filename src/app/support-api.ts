import { SUPPORT_API_URL } from './support.config';

export type QueryType = 'Help' | 'Bug report';

export interface PublicQuery {
  id: string;
  createdAt: string;
  type: QueryType;
  name: string;
  message: string;
  reply: string;
  repliedAt: string;
}

export interface AdminQuery extends PublicQuery {
  email: string;
}

interface ApiResult {
  ok: boolean;
  error?: string;
}

export const isSupportConfigured = (): boolean => SUPPORT_API_URL.trim().length > 0;

// Apps Script web apps do not answer CORS preflight requests, so POST bodies are sent as text/plain.
async function post<T extends ApiResult>(payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(SUPPORT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Server error. Please try again.');
  return (await response.json()) as T;
}

export async function fetchPublicQueries(): Promise<PublicQuery[]> {
  const response = await fetch(`${SUPPORT_API_URL}?action=list`);
  if (!response.ok) throw new Error('Could not load questions.');
  const data = (await response.json()) as ApiResult & { items?: PublicQuery[] };
  if (!data.ok) throw new Error(data.error || 'Could not load questions.');
  return data.items ?? [];
}

export async function submitQuery(input: {
  type: QueryType;
  name: string;
  email: string;
  message: string;
  website: string; // honeypot - real users leave it empty
}): Promise<void> {
  const data = await post<ApiResult>({ action: 'submit', ...input });
  if (!data.ok) throw new Error(data.error || 'Could not send your message.');
}

export async function adminList(id: string, password: string): Promise<AdminQuery[]> {
  const data = await post<ApiResult & { items?: AdminQuery[] }>({ action: 'adminList', id, password });
  if (!data.ok) throw new Error(data.error || 'Login failed.');
  return data.items ?? [];
}

export async function adminReply(id: string, password: string, queryId: string, reply: string): Promise<AdminQuery[]> {
  const data = await post<ApiResult & { items?: AdminQuery[] }>({ action: 'adminReply', id, password, queryId, reply });
  if (!data.ok) throw new Error(data.error || 'Could not save reply.');
  return data.items ?? [];
}

export async function adminDelete(id: string, password: string, queryId: string): Promise<AdminQuery[]> {
  const data = await post<ApiResult & { items?: AdminQuery[] }>({ action: 'adminDelete', id, password, queryId });
  if (!data.ok) throw new Error(data.error || 'Could not delete.');
  return data.items ?? [];
}
