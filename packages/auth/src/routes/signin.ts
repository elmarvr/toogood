import { getProvider } from "../providers";
import { createOpenIdClient } from "../client";
import { InternalOptions, RouteReturnType } from "./types";

interface SigninOptions {
  options: InternalOptions;
}

const signin = async ({ options }: SigninOptions): Promise<RouteReturnType> => {
  const { providerId } = options;

  const provider = getProvider(providerId);

  console.log(provider);

  const client = await createOpenIdClient(provider);

  const url = client.authorizationUrl(provider.authorisation?.params);

  return {
    redirect: url,
  };
};

export default signin;
