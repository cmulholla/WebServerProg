import { useRouter } from 'next/router';
import Head from 'next/head'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'

export default function BoardPage() {
  const router = useRouter();
  const [boardID, setBoardId] = useState<string | string[] | undefined>(undefined);

  // Wait until router is ready to access query params
  useEffect(() => {
    if (router.isReady) {
      setBoardId(router.query.boardID);
      console.log('Board ID: ', router.query.boardID)
    }
  }, [router]);

  const session = useSession()
  const supabase = useSupabaseClient()

  return (
    <div>
      <Head>
        <title>Board</title>
        <meta name="description" content="Board" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header session={session} supabase={supabase}/>
      <h1>Board ID: {router.query.boardID}</h1>
    </div>
  );
}