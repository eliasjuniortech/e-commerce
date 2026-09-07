import { Roles } from "@prisma/client";

export type Payload = {
  sub: string;
  email: string;
  role: Roles;
  iat: number;
  exp: number;
};
