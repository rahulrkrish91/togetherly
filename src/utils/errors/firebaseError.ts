interface FirebaseErrorShape {
  code?: string;
  message?: string;
}

export interface ParsedFirebaseError {
  code: string;
  message: string;
  retryable: boolean;
}

export function parseFirebaseError(error: unknown): ParsedFirebaseError {
  const maybeError = error as FirebaseErrorShape;
  const code = maybeError.code ?? 'unknown/error';
  const message = maybeError.message ?? 'Something went wrong.';
  const retryable = code.includes('network') || code.includes('unavailable');

  return { code, message, retryable };
}
