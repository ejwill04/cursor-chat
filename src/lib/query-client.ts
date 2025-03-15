import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Chat data doesn't change unless we change it
      retry: 1, // Only retry failed queries once
    },
  },
}) 