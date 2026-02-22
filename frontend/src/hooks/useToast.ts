import { useState } from "react";

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const [kind, setKind] = useState<"success" | "error">("success");

  return {
    message,
    kind,
    showSuccess: (value: string) => {
      setKind("success");
      setMessage(value);
      setTimeout(() => setMessage(null), 2400);
    },
    showError: (value: string) => {
      setKind("error");
      setMessage(value);
      setTimeout(() => setMessage(null), 2800);
    }
  };
}
