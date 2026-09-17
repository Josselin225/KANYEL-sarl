const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const TOKEN_KEY = "kanyel_admin_token";
const USERNAME_KEY = "kanyel_admin_username";

export class ApiError extends Error {}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getUsername(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USERNAME_KEY);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USERNAME_KEY);
}

export async function login(
  username: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_URL}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      return { ok: false, error: "Identifiant ou mot de passe incorrect." };
    }
    const data = await res.json();
    window.localStorage.setItem(TOKEN_KEY, data.token);
    window.localStorage.setItem(USERNAME_KEY, data.username);
    return { ok: true };
  } catch {
    return { ok: false, error: "Impossible de contacter le serveur." };
  }
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Token ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Erreur ${res.status}.`;
    try {
      const data = await res.json();
      message = Object.values(data).flat().join(" ") || message;
    } catch {}
    throw new ApiError(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const adminApi = {
  async list<T>(resource: string): Promise<T[]> {
    const res = await fetch(`${API_URL}/api/${resource}/`, { headers: authHeaders(), cache: "no-store" });
    return handleResponse<T[]>(res);
  },

  async create<T>(resource: string, payload: Record<string, unknown> | FormData): Promise<T> {
    const isFormData = payload instanceof FormData;
    const res = await fetch(`${API_URL}/api/${resource}/`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
      body: isFormData ? payload : JSON.stringify(payload),
    });
    return handleResponse<T>(res);
  },

  async update<T>(
    resource: string,
    id: string | number,
    payload: Record<string, unknown> | FormData
  ): Promise<T> {
    const isFormData = payload instanceof FormData;
    const res = await fetch(`${API_URL}/api/${resource}/${id}/`, {
      method: "PATCH",
      headers: {
        ...authHeaders(),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
      body: isFormData ? payload : JSON.stringify(payload),
    });
    return handleResponse<T>(res);
  },

  async remove(resource: string, id: string | number): Promise<void> {
    const res = await fetch(`${API_URL}/api/${resource}/${id}/`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },

  async getSingleton<T>(resource: string): Promise<T> {
    const res = await fetch(`${API_URL}/api/${resource}/`, { headers: authHeaders(), cache: "no-store" });
    return handleResponse<T>(res);
  },

  async updateSingleton<T>(resource: string, payload: Record<string, unknown> | FormData): Promise<T> {
    const isFormData = payload instanceof FormData;
    const res = await fetch(`${API_URL}/api/${resource}/`, {
      method: "PATCH",
      headers: {
        ...authHeaders(),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
      body: isFormData ? payload : JSON.stringify(payload),
    });
    return handleResponse<T>(res);
  },
};
