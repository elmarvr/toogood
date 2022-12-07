import { User } from "@toogood/db";

export type Provider<Profile = any> = {
  id: string;
  issuer: string;
  clientSecret: string;
  clientId: string;
  callbackUrl: string;
  authorisation?: { params?: Record<string, string> };
  profile: (profile: Profile) => User;
};

type ProviderUserConfig<Profile extends Record<string, any>> = Pick<Provider<Profile>, "clientId" | "clientSecret">;

const createProvider = <Profile extends Record<string, any>>(
  config: Omit<Provider<Profile>, keyof ProviderUserConfig<Profile> | "callbackUrl">
) => {
  return (userConfig: ProviderUserConfig<Profile>): Provider<Profile> => ({
    ...config,
    ...userConfig,
    callbackUrl: `http://localhost:3000/auth/${config.id}/callback`,
  });
};

type GoogleProfile = { sub: string; name: string; email: string; picture: string };

const GoogleProvider = createProvider<GoogleProfile>({
  id: "google",
  issuer: "https://accounts.google.com",
  authorisation: {
    params: {
      scope: "openid email profile",
      prompt: "select_account",
    },
  },
  profile: (profile) => {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    };
  },
});

const providers = [
  GoogleProvider({
    clientId: "645799757276-srcpek98mh9rt6vcu1ihdjccti560l4a.apps.googleusercontent.com",
    clientSecret: "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",
  }),
] satisfies Provider[];

export const getProvider = (providerId: string) => {
  const provider = providers.find((provider) => provider.id === providerId);

  if (!provider) {
    throw new Error(`Provider ${providerId} not found`);
  }

  return provider;
};
