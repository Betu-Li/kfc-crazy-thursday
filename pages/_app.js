import React from 'react'
import Head from 'next/head'
 
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>肯德基疯狂星期四</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp