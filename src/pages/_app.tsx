import '../styles/globals.css'
import { chakraTheme } from "@/theme";
import { ChakraProvider } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { Router, useRouter } from 'next/router';
import PageLoader from '@/components/PageLoader'
import { NextComponentType } from 'next';
import "@fullcalendar/common/main.css";
import Head from 'next/head';
import type { AppType } from 'next/app';
import { trpc } from '../utils/trpc';

function MyApp({ Component, pageProps }: { Component: NextComponentType, pageProps: any }) {
  const [render, setRender] = useState(false);
  useEffect(() => setRender(true), []);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  Router.events.on('routeChangeStart', (url) => {
    setLoading(true);
  });

  Router.events.on('routeChangeComplete', (url) => {
    setLoading(false);
  });

  useEffect(() => {
  }, [setLoading])

  return (
    render ?
      <ChakraProvider theme={chakraTheme}>
        <Head>
          <title>SavageManage</title>
        </Head>
        {loading ? (
          <PageLoader />
        ) : (
          <Component {...pageProps} />
        )}
      </ChakraProvider> : null
  )
}

export default trpc.withTRPC(MyApp)