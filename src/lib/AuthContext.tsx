'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
})

function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // まずリダイレクト結果を処理してからauth状態を監視する
    const init = async () => {
      try {
        const result = await getRedirectResult(auth)
        // リダイレクト結果があればそのユーザーをセット
        if (result?.user) {
          setUser(result.user)
          setLoading(false)
          return
        }
      } catch (e) {
        // リダイレクト結果がない場合は無視
      }

      // 通常のauth状態監視
      const unsubscribe = onAuthStateChanged(auth, u => {
        setUser(u)
        setLoading(false)
      })
      return unsubscribe
    }

    let unsubscribe: (() => void) | undefined
    init().then(unsub => {
      unsubscribe = unsub
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    if (isMobile()) {
      await signInWithRedirect(auth, googleProvider)
    } else {
      await signInWithPopup(auth, googleProvider)
    }
  }

  const signOutUser = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)