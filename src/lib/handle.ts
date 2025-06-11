export async function catchError<T, E extends Error>(
  promise: Promise<T>,
  errorsToCatch?: Array<new (...args: any[]) => E>
): Promise<[null, T] | [E]> {
  try {
    const result = await promise;
    return [null, result];
  } catch (error) {
    if (
      !errorsToCatch ||
      errorsToCatch.some((ErrorType) => error instanceof ErrorType)
    ) {
      return [error as E];
    }

    throw error;
  }
}