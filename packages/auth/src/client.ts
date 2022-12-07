import { Issuer } from "openid-client";
import { Provider } from "./providers";

export const createOpenIdClient = async (provider: Provider) => {
  const issuer = await Issuer.discover(provider.issuer);

  const client = new issuer.Client({
    client_id: provider.clientId,
    client_secret: provider.clientSecret,
    redirect_uris: [provider.callbackUrl],
  });

  return client;
};
