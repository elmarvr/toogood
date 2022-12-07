import { makeRedirectUri, startAsync } from "expo-auth-session";

const returnUrl = makeRedirectUri({
  useProxy: false,
});

export function useSignin(opts: any) {
  const { provider } = opts;
  const authUrl = `http://localhost:3000/auth/${provider}/signin`;

  return {
    startAsync: () => startAsync({ authUrl, returnUrl }),
  };
}
