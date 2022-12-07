type Promisable<T> = T | Promise<T>;

export type InternalOptions = {
  providerId: string;
  session: {
    maxAge: number;
    updateAge: number;
  };
};

export type RouteReturnType = {
  status?: number;
  redirect?: string;
  json?: Record<string, unknown>;
};
