
import { authPost } from "@/lib/auth";

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
  '/api',
  `/chat/action/confirm`
);
