import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    subscriptionTier?: string;
  }

  interface Session {
    user: User & {
      id: string;
      subscriptionTier: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    subscriptionTier?: string;
  }
}
