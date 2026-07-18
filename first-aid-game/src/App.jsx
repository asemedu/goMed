// src/App.jsx
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  // 1. Check for an active session when the app loads
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for changes (like if they log in or log out)
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  // 2. Handle User Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    const { error } = await supabase.auth.signUp({ email, password })
    
    if (error) setMessage(error.message)
    else setMessage('Check your email to verify your account (if email confirmation is turned on).')
    
    setLoading(false)
  }

  // 3. Handle User Sign In
  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) setMessage(error.message)
    setLoading(false)
  }

  // 4. Handle Logout
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  // --- RENDER LOGGED IN VIEW ---
  if (session) {
    return (
      <div className="p-8 text-white">
        <h1 className="text-2xl font-bold mb-4">You are logged in!</h1>
        <p className="text-gray-400 mb-4">Email: {session.user.email}</p>
        <button 
          onClick={handleSignOut}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-bold"
        >
          Sign Out
        </button>
      </div>
    )
  }

  // --- RENDER LOGGED OUT (AUTH) VIEW ---
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white">
      <div className="w-full max-w-sm p-6 bg-neutral-900 rounded-xl border border-neutral-800 shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">First Aid AR</h1>
        
        <form className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 bg-neutral-950 border border-neutral-800 rounded focus:border-blue-500 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 bg-neutral-950 border border-neutral-800 rounded focus:border-blue-500 outline-none"
          />

          {message && (
            <p className="text-sm text-red-400 text-center">{message}</p>
          )}

          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded font-bold transition"
            >
              Sign In
            </button>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 py-3 rounded font-bold transition"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}