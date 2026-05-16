"use client";

import { createContext, useContext } from "react";

interface EcommerceContextValue {
  enabled: boolean;
  whatsappNumber: string;
}

const EcommerceContext = createContext<EcommerceContextValue>({
  enabled: true,
  whatsappNumber: "",
});

export const useEcommerce = () => useContext(EcommerceContext);

export function EcommerceProvider({
  enabled,
  whatsappNumber,
  children,
}: {
  enabled: boolean;
  whatsappNumber: string;
  children: React.ReactNode;
}) {
  return (
    <EcommerceContext.Provider value={{ enabled, whatsappNumber }}>
      {children}
    </EcommerceContext.Provider>
  );
}
