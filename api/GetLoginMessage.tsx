import {get, post} from "@/lib/api";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface MessageReq {
  // Add properties as needed
  address: string
}

interface MessageResp {
  message: string;
}

export const message = get<MessageReq, MessageResp>('/api', `/user/login/message`);
