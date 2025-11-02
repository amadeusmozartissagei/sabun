import type { AppProps } from 'next/app';
import Layout from '@/components/Layout/Layout';
import { SOAPFlowProvider } from '@/contexts/SOAPFlowContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <SOAPFlowProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SOAPFlowProvider>
    </ThemeProvider>
  );
}


