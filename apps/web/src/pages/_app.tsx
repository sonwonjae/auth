import "@/styles/globals.css";
import type { AppProps } from "next/app";

import {
  DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function MyApp({
  Component,
  pageProps,
}: AppProps<{ dehydratedState: DehydratedState }>) {
  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          // With SSR, we usually want to set some default staleTime
          // above 0 to avoid refetching immediately on the client
          staleTime: 60 * 1000,
        },
      },
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      <HydrationBoundary state={pageProps.dehydratedState}>
        <Component {...pageProps} />
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
