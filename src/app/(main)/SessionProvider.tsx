"use client";

import { Session, User } from "lucia";
import React, { createContext, useContext } from "react";

interface SessionContext {
  user: User;
  session: Session;
}

// Vytvoreni kontextu pro sdileni session dat v ramci aplikace
const SessionContext = createContext<SessionContext | null>(null);

/**
 * Provider pro predani session dat komponentam
 * Pouziva se v hlavnim layoutu aplikace
 */
export default function SessionProvider({
  children,
  value,
}: React.PropsWithChildren<{ value: SessionContext }>) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/**
 * Hook pro pristup k datum prihlaseneho uzivatele a session
 * Pouziva se v klientskych komponentach pro ziskani informaci o uzivateli
 *
 * @throws Error pokud se pouzije mimo SessionProvider
 * @returns Objekt obsahujici data uzivatele a session
 */
export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
