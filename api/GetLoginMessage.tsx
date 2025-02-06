import { get } from "@/lib/api";

const BE_API = process.env.NEXT_PUBLIC_BE_API;
if (!BE_API) {
  throw new Error('NEXT_PUBLIC_BE_API environment variable is not set');
}

interface LoginMessageReq {
  address: string;
}

interface LoginMessageResp {
  message: string;
}

export const message = get<LoginMessageReq, LoginMessageResp>(BE_API, `/user/login/message`);
