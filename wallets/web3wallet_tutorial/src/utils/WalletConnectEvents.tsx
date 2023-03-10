import { useCallback, useEffect } from "react";
import { web3wallet } from "./WalletConnectUtils";
import { SignClientTypes } from "@walletconnect/types";

export default function useWalletConnectEventsManager(initialized: boolean) {
  const onSessionProposal = useCallback(
    (proposal: SignClientTypes.EventArguments["session_proposal"]) => {
      console.log("proposal", proposal);
      //   ModalStore.open("SessionProposalModal", { proposal });
    },
    []
  );

  useEffect(() => {
    web3wallet?.on("session_proposal", onSessionProposal);
    // web3wallet.on('session_request', onSessionRequest)
  }, [initialized, onSessionProposal]);
}
