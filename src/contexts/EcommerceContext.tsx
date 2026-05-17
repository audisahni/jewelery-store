"use client";

import { createContext, useContext } from "react";

interface EcommerceContextValue {
  enabled: boolean;
  whatsappNumber: string;
  newsletterEnabled: boolean;
}

const EcommerceContext = createContext<EcommerceContextValue>({
  enabled: true,
  whatsappNumber: "",
  newsletterEnabled: false,
});

export const useEcommerce = () => useContext(EcommerceContext);

export function EcommerceProvider({
  enabled,
  whatsappNumber,
  newsletterEnabled,
  children,
}: {
  enabled: boolean;
  whatsappNumber: string;
  newsletterEnabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <EcommerceContext.Provider value={{ enabled, whatsappNumber, newsletterEnabled }}>
      {children}
    </EcommerceContext.Provider>
  );
}
