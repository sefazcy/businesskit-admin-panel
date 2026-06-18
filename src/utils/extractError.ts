export function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (typeof data === 'string' && data.length > 0) {
      return data;
    }
    if (data && typeof data === 'object') {
      if ('message' in data && typeof (data as { message: unknown }).message === 'string') {
        return (data as { message: string }).message;
      }
      if ('errors' in data) {
        const msgs = Object.values(
          (data as { errors: Record<string, string[]> }).errors
        ).flat();
        if (msgs.length > 0) return msgs.join(' ');
      }
    }
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}
