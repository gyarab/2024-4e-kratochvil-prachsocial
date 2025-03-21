"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

/**
 * Provider pro React Query
 * Inicializuje a poskytuje QueryClient pro celou aplikaci
 */
export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vytvoreni instance QueryClient v state, aby prezila rerender
  const [client] = useState(new QueryClient());

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
