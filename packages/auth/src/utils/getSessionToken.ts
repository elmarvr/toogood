export const getSessionToken = async (headers: Record<string, string>): Promise<string | null> => {
  const sessionToken = headers["authorization"]?.replace("Bearer ", "") || null;

  return sessionToken;
};
