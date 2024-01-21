import {
  Auth,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  setPersistence,
  browserSessionPersistence,
  signInWithRedirect,
  getAuth
} from 'firebase/auth'
import { useEffect, useState } from 'react'
import { signInProvider, signInSession } from './types'
import { getApp } from 'firebase/app'

/**
 * Firebaseの認証ユーティリティを提供します。
 *
 * このユーティリティは、Firebaseの認証機能を簡単に使用できるようにするためのものです。
 * これには、ログイン状態の監視、ログイン・ログアウトの処理などが含まれます。
 *
 * @module AuthUtil
 */
export const useLogin = (): { loginStatus: boolean; loginLoading: boolean; loginUser: User | null } => {
  const app = getApp() // すでに初期化されているFirebaseアプリのリストを取得
  const auth = getAuth(app)
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [status, setStatus] = useState<boolean>(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user)
      if (user) {
        console.debug('Logged in')
        console.debug(user)
        setStatus(true)
        setLoading(false)
      } else {
        console.debug('Not logged in')
        setStatus(false)
        setLoading(false)
      }
    })

    // Cleanup function
    return () => unsubscribe()
  })

  return {
    loginStatus: status,
    loginLoading: loading,
    loginUser: authUser
  }
}

class AuthUtil {
  private auth: Auth

  constructor(auth: Auth) {
    this.auth = auth
  }

  public async signIn(providerName: signInProvider, session: signInSession = 'persistance'): Promise<void> {
    // プロバイダ取得
    let provider: any
    switch (providerName.toLowerCase()) {
      case 'google':
        provider = new GoogleAuthProvider()
        break
      default:
        console.error('Invalid service name')
    }
    // リダイレクト
    switch (session.toLowerCase()) {
      case 'persistance':
        // persistance（永続性セッション）の場合
        setPersistence(this.auth, browserSessionPersistence)
          .then(() => {
            return signInWithRedirect(this.auth, provider)
          })
          .catch((error: any) => {
            console.error(error)
          })
        break
      default:
        console.error('Invalid session setting')
    }
  }
}

export default AuthUtil
