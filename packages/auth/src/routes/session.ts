import { InternalOptions, RouteReturnType } from "./types";
import { getSessionAndUser, deleteSession, updateSession } from "../service";
import { fromDate } from "../utils/fromDate";
import { getSessionToken } from "../utils/getSessionToken";

interface SessionOptions {
  options: InternalOptions;
  body: Record<string, unknown>;
}

const session = async ({ options, body }: SessionOptions): Promise<RouteReturnType> => {
  const sessionToken = typeof body.token === "string" ? body.token : null;

  const emptySession = {
    session: null,
    user: null,
  };

  if (!sessionToken) {
    return {
      json: emptySession,
    };
  }

  const userAndSession = await getSessionAndUser(sessionToken);

  if (!userAndSession) {
    return {
      json: emptySession,
    };
  }

  const isExpired = userAndSession.session.expires.valueOf() < Date.now();

  if (isExpired) {
    await deleteSession(sessionToken);

    return {
      json: emptySession,
    };
  }

  const sessionUpdateAge = options.session.updateAge;
  const sessionMaxAge = options.session.maxAge;

  const sessionDueDate = userAndSession.session.expires.valueOf() - sessionMaxAge * 1000 + sessionUpdateAge * 1000;
  const newExpires = fromDate(sessionMaxAge);

  if (sessionDueDate <= Date.now()) {
    await updateSession({ sessionToken, expires: newExpires });
  }

  return {
    json: userAndSession,
  };
};

export default session;
