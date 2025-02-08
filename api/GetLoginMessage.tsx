import { post } from "@/lib/api";

const API_ENDPOINT = '/api';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface MessageReq {
  // Add properties as needed
}

interface MessageResp {
  message: string;
}

export const message = post<MessageReq, MessageResp>(API_ENDPOINT, `/auth/message`);
