import { memo } from "react";
import { ConfirmModal } from "./confirm-modal";

interface ClearLogsModalProps {
  visible: boolean;
  count: number;
  onConfirm: () => void;
  onClose: () => void;
}

function ClearLogsModalBase({
  visible,
  count,
  onConfirm,
  onClose,
}: ClearLogsModalProps) {
  return (
    <ConfirmModal
      visible={visible}
      icon={require("@/assets/images/trash.png")}
      title={`You're about to clear ${count} log ${
        count === 1 ? "entry" : "entries"
      }`}
      description="This can't be undone. We don't keep a copy, so copy them first if support needs them."
      confirmLabel="Clear logs"
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}

export const ClearLogsModal = memo(ClearLogsModalBase);
