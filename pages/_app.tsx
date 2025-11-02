import type { AppProps } from 'next/app';
import Layout from '@/components/Layout/Layout';
import { SOAPFlowProvider } from '@/contexts/SOAPFlowContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SOAPFlowProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SOAPFlowProvider>
  );
}


