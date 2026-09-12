/**
 * Google Calendar Client Integration
 * Handles OAuth token caching, calendar fetching, and event creation/reminders
 */
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

// In-memory access token cache
let cachedAccessToken: string | null = null;

export const setCachedGoogleToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const getCachedGoogleToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Ensures Google provider has the calendar.events scope
 */
export const requestCalendarAuth = async (): Promise<string> => {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  // Ensure calendar scope is included
  const provider = new GoogleAuthProvider();
  provider.addScope(CALENDAR_SCOPE);
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Could not retrieve Google Calendar access token from authentication.');
    }

    cachedAccessToken = credential.accessToken;
    return cachedAccessToken;
  } catch (err: any) {
    if (
      err?.code === 'auth/popup-closed-by-user' ||
      err?.code === 'auth/cancelled-popup-request' ||
      err?.message?.includes('popup-closed-by-user')
    ) {
      const cancellationError = new Error('Google authorization popup was closed.');
      (cancellationError as any).code = 'auth/popup-closed-by-user';
      (cancellationError as any).isCancelled = true;
      throw cancellationError;
    }
    throw err;
  }
};

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
}

/**
 * Fetch calendar events for a specific date range from primary Google Calendar
 */
export const fetchGoogleCalendarEvents = async (
  timeMin: string,
  timeMax: string
): Promise<GoogleCalendarEvent[]> => {
  const token = cachedAccessToken;
  if (!token) {
    return [];
  }

  try {
    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    url.searchParams.set('timeMin', timeMin);
    url.searchParams.set('timeMax', timeMax);
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        cachedAccessToken = null; // Stale or unauthorized token - reset cache
      }
      let errDetail = '';
      try {
        const errJson = await res.json();
        errDetail = errJson?.error?.message || '';
      } catch {
        errDetail = await res.text().catch(() => '');
      }
      throw new Error(
        `Google Calendar API responded with status ${res.status}${errDetail ? `: ${errDetail}` : ''}`
      );
    }

    const data = await res.json();
    return (data.items || []) as GoogleCalendarEvent[];
  } catch (err) {
    console.warn('Google Calendar events fetch issue:', err);
    throw err;
  }
};

/**
 * Create a task deadline reminder event on Google Calendar
 */
export const createGoogleCalendarEvent = async (params: {
  title: string;
  description: string;
  dueDate: string;
  priority?: string;
  projectName?: string;
}): Promise<GoogleCalendarEvent> => {
  const token = cachedAccessToken;
  if (!token) {
    throw new Error('Google Calendar is not connected. Please connect your Google account first.');
  }

  // Format start and end times for the due date
  const startDateTime = `${params.dueDate}T09:00:00`;
  const endDateTime = `${params.dueDate}T10:00:00`;

  const eventPayload = {
    summary: `[Task Deadline] ${params.title}`,
    description: `${params.description || 'Task due date reminder'}\n\nProject: ${params.projectName || 'Active Project'}\nPriority: ${params.priority || 'Medium'}`,
    start: {
      dateTime: new Date(startDateTime).toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: new Date(endDateTime).toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 60 }, // 1 hour before
      ],
    },
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to create Google Calendar event: ${errorBody}`);
  }

  return (await res.json()) as GoogleCalendarEvent;
};
