// pages/login.tsx

import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default function Login() {
  const supabase = useSupabaseClient()
  const session = useSession()

  // if session exists, redirect to home
  if (session) {
    window.location.href = '/'
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', height: '100%', maxWidth: '20rem', padding: '2rem', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '2rem', textAlign: 'center', paddingBottom: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #ddd' }}>
            Login
          </span>
          <Auth supabaseClient={supabase} 
                appearance={{ theme: ThemeSupa }} 
                theme="dark"
                providers={[]}
                view="sign_in"
                />
        </div>
      </div>
    </div>
  )
}