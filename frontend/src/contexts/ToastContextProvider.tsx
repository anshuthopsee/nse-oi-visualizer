import { useState, createContext, type ReactNode } from "react";

export type ToastMessage = {
  message: string;
  type: "success" | "error" | "warning" | "info";
  key: number;
};

type ToastContextProviderProps = {
  children: ReactNode;
};

type ToastContextType = {
  open: boolean;
  toastPack: readonly ToastMessage[];
  messageInfo?: ToastMessage;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setToastPack: React.Dispatch<React.SetStateAction<readonly ToastMessage[]>>;
  setMessageInfo: React.Dispatch<React.SetStateAction<ToastMessage | undefined>>;
};

export const ToastContext = createContext<ToastContextType>({
  open: false,
  toastPack: [] as readonly ToastMessage[],
  messageInfo: undefined as ToastMessage | undefined,
  setOpen: () => {},
  setToastPack: () => {},
  setMessageInfo: () => {},
});

const ToastContextProvider = ({ children }: ToastContextProviderProps) => {

  const [toastPack, setToastPack] = useState<readonly ToastMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState<ToastMessage | undefined>(
    undefined,
  );

  return (
    <ToastContext.Provider value={{ open, toastPack, messageInfo, setOpen, setToastPack, setMessageInfo }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastContextProvider;