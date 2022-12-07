import { prisma, type User, type Account, type Session, Prisma } from "@toogood/db";

type AccountCompoundId = Pick<Account, "provider" | "providerAccountId">;

type UpdateEntry<T extends { id: string }> = Partial<T> & Pick<T, "id">;

type CreateEntry<T extends { id: string }> = NullablePartial<Omit<T, "id">>;

type NonNullableKeys<T> = { [K in keyof T]-?: null extends T[K] ? never : K }[keyof T];

type NullableKeys<T> = { [K in keyof T]-?: null extends T[K] ? K : never }[keyof T];

type NullablePartial<T> = {
  [K in NonNullableKeys<T>]: T[K];
} & {
  [K in NullableKeys<T>]?: T[K];
};

export const createUser = (data: CreateEntry<User>) => {
  return prisma.user.create({
    data,
  });
};

export const getUser = (id: string) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
};

export const getUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const getUserByAccount = async (data: AccountCompoundId) => {
  const account = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: data,
    },
    select: {
      user: true,
    },
  });

  return account?.user ?? null;
};

export const updateUser = ({ id, ...data }: UpdateEntry<User>) => {
  return prisma.user.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteUser = (id: string) => {
  return prisma.user.delete({
    where: {
      id,
    },
  });
};

export const linkAccount = (data: CreateEntry<Account>) => {
  return prisma.account.create({
    data,
  });
};

export const unlinkAccount = (data: AccountCompoundId) => {
  return prisma.account.delete({
    where: {
      provider_providerAccountId: data,
    },
  });
};

export const getSessionAndUser = async (sessionToken: string) => {
  const userAndSession = await prisma.session.findUnique({
    where: {
      sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!userAndSession) return null;

  const { user, ...session } = userAndSession;

  return { user, session };
};

export const createSession = (data: CreateEntry<Session>) => {
  return prisma.session.create({
    data,
  });
};

export const updateSession = (data: Omit<Partial<Session>, "id"> & Pick<Session, "sessionToken">) => {
  return prisma.session.update({
    where: {
      sessionToken: data.sessionToken,
    },
    data,
  });
};

export const deleteSession = (sessionToken: string) => {
  return prisma.session.delete({
    where: {
      sessionToken,
    },
  });
};
