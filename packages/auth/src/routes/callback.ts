import { TokenSet } from "openid-client";
import { getProvider, Provider } from "../providers";
import { createOpenIdClient } from "../client";
import type { InternalOptions, RouteReturnType } from "./types";
import {
  createSession,
  createUser,
  getSessionAndUser,
  getUserByAccount,
  getUserByEmail,
  linkAccount,
} from "../service";
import { Account, Session, User } from "@toogood/db";
import { randomUUID } from "crypto";
import type { IncomingMessage } from "http";
import { getSessionToken } from "../utils/getSessionToken";
import { fromDate } from "../utils/fromDate";

interface CallbackOptions {
  options: InternalOptions;
  query: Record<string, string>;
  body: Record<string, unknown>;
}

const callback = async ({ options, query, body }: CallbackOptions): Promise<RouteReturnType> => {
  const { providerId } = options;

  const provider = getProvider(providerId);
  const client = await createOpenIdClient(provider);

  const params = client.callbackParams({
    url: `http://n?${new URLSearchParams(query)}`,
    method: "GET",
  } as IncomingMessage);

  const tokens = await client.callback(provider.callbackUrl, params);

  const { account, profile } = getProfile({ tokens, provider });

  const sessionToken = typeof body.sessionToken === "string" ? body.sessionToken : null;

  const { session } = await resolveSession({ sessionToken, profile, account, maxAge: options.session.maxAge });

  return {
    redirect: `https://auth.expo.io/@elmarvr/_expo?session_token=${session.sessionToken}`,
  };
};

type GetProfileOptions = {
  tokens: TokenSet;
  provider: Provider;
};

const getProfile = ({ tokens, provider }: GetProfileOptions) => {
  const profile = provider.profile(tokens.claims());

  return {
    profile,
    account: {
      provider: provider.id,
      providerAccountId: profile.id.toString(),
      ...tokens,
    },
  };
};

type ResolveSessionOptions = {
  sessionToken: string | null;
  profile: User;
  account: Pick<Account, "provider" | "providerAccountId">;
  maxAge: number;
};

const resolveSession = async ({
  sessionToken,
  profile,
  account,
  maxAge,
}: ResolveSessionOptions): Promise<{
  user: User;
  session: Session;
}> => {
  if (sessionToken) {
    const userAndSession = await getSessionAndUser(sessionToken);

    if (userAndSession) {
      return userAndSession;
    }
  }

  const generateSession = async (userId: string) => {
    return createSession({
      sessionToken: randomUUID(),
      userId,
      expires: fromDate(maxAge),
    });
  };

  const userByAccount = await getUserByAccount({
    provider: account.provider,
    providerAccountId: account.providerAccountId,
  });

  if (userByAccount) {
    return {
      user: userByAccount,
      session: await generateSession(userByAccount.id),
    };
  }

  const userByEmail = await getUserByEmail(profile.email);

  if (userByEmail) {
    await linkAccount({ ...account, userId: userByEmail.id });

    return {
      user: userByEmail,
      session: await generateSession(userByEmail.id),
    };
  }

  const { id: _, ...newUser } = profile;
  const user = await createUser(newUser);

  await linkAccount({ ...account, userId: user.id });

  return {
    user,
    session: await generateSession(user.id),
  };
};

export default callback;
