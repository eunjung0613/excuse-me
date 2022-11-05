import '../styles/globals.css';
import type { AppProps /*, AppContext */ } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useRef } from 'react';
import { AuthUserProvider } from '@/contexts/auth_user.context';

const MyApp = function ({ Component, pageProps }: AppProps) {
  const queryClinetRef = useRef<QueryClient>();
  if (!queryClinetRef.current) {
    queryClinetRef.current = new QueryClient();
  }
  return (
    <QueryClientProvider client={queryClinetRef.current}>
      <ChakraProvider>
        <AuthUserProvider>
          <Component {...pageProps} />
        </AuthUserProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
};

export default MyApp;
