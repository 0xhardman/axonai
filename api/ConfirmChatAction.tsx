
import { authPost } from "@/lib/auth";

const BE_API = process.env.NEXT_PUBLIC_BE_API;
if (!BE_API) {
  throw new Error('NEXT_PUBLIC_BE_API environment variable is not set');
}

interface TransactionOptions {
  a: string;
}

interface TransactionTask {
  address: string;
  contractName: string;
  method: string;
  arguments: string[];
  options: TransactionOptions;
}

interface ConfirmActionReq {
  actionId: string;
  txData: TransactionTask;
  confirm: boolean;
}

interface ConfirmActionResp {
  txHash: string;
}

export const confirmChatAction = authPost<ConfirmActionReq, ConfirmActionResp>(
  BE_API,
  `/chat/action/confirm`
);
