import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import { ThemeProvider } from '@mui/material'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import { lightTheme } from '../themes/light-theme';
import { SWRConfig } from 'swr';
import { UiProvider } from '../context/ui/UiProvider';
import { AuthProvider, CartProvider } from '../context';

function MyApp({ Component, pageProps }: AppProps) {
  return (

    <SessionProvider>
      <PayPalScriptProvider options={{ 'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT || '' }}>
        <SWRConfig
          value={{
            /* refreshInterval: 3000, */
            fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
          }}
        >
          <AuthProvider>
            <CartProvider>
              <UiProvider>
                <ThemeProvider theme={lightTheme}>
                  <Component {...pageProps} />
                </ThemeProvider>
              </UiProvider>
            </CartProvider>
          </AuthProvider>
        </SWRConfig>
      </PayPalScriptProvider>
    </SessionProvider>
  )
}

export default MyApp
