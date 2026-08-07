const isSerializationConflict = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === "P2034";

export async function retrySerializationConflict<T>(run: () => Promise<T>) {
  try {
    return await run();
  } catch (error) {
    if (!isSerializationConflict(error)) throw error;
    return run();
  }
}
