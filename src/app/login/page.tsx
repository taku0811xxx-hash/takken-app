'use client'

import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  return /FBAN|FBAV|Instagram|Line|Twitter|Snapchat|WeChat|MicroMessenger/.test(ua)
}

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState('')
  const [inAppBrowser, setInAppBrowser] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setInAppBrowser(isInAppBrowser())
  }, [])

  useEffect(() => {
    if (!loading && user) router.push('/')
  }, [user, loading, router])

  const handleSignIn = async () => {
    try {
      setSigningIn(true)
      setError('')
      await signInWithGoogle()
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user') {
        setError('ログインに失敗しました。もう一度お試しください。')
      }
    } finally {
      setSigningIn(false)
    }
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // clipboard APIが使えない場合
      const el = document.createElement('textarea')
      el.value = window.location.href
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-4xl mb-4">📖</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">宅建単語帳</h1>
          <p className="text-sm text-gray-400">Googleアカウントでログインして<br />学習をはじめましょう</p>
        </div>

        {inAppBrowser ? (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
              <p className="text-sm font-medium text-amber-800 mb-1">⚠️ Safariで開いてください</p>
              <p className="text-xs text-amber-600 leading-relaxed">
                LINEなどのアプリ内ブラウザではGoogleログインができません。
              </p>
            </div>

            <button
              onClick={copyUrl}
              className={`w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                copied ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
              }`}
            >
              {copied ? '✅ コピーしました！' : '🔗 URLをコピー'}
            </button>

            {copied && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-3">
                <p className="text-xs text-green-700 font-medium mb-1">次の手順でSafariで開いてください</p>
                <div className="space-y-1 text-xs text-green-600">
                  <p>1. ホーム画面から <span className="font-bold">Safari</span> を起動</p>
                  <p>2. アドレスバーを長押し → <span className="font-bold">ペースト</span></p>
                  <p>3. <span className="font-bold">移動</span> をタップ</p>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <p className="text-xs text-gray-500 leading-relaxed text-center">
                または画面右下の <span className="font-medium">「...」</span> →<br />
                <span className="font-medium">「ブラウザで開く」</span> を選択
              </p>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl py-4 px-6 text-sm font-medium text-gray-700 shadow-sm active:bg-gray-50 transition-all disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              {signingIn ? 'ログイン中...' : 'Googleでログイン'}
            </button>

            {error && (
              <p className="text-xs text-red-500 text-center mt-3">{error}</p>
            )}

            <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
              ログインすることで学習データがクラウドに保存され<br />どのデバイスからでもアクセスできます
            </p>
          </>
        )}
      </div>
    </div>
  )
}