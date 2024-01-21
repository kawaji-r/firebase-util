import {
  Auth,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  setPersistence,
  browserSessionPersistence,
  signInWithRedirect
} from 'firebase/auth'
import { useState } from 'react'
import { signInProvider, signInSession } from './types'

class AuthUtil {
  private auth: Auth

  constructor(auth: Auth) {
    this.auth = auth
  }

  public useLogin() {
    const [authUser, setAuthUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [status, setStatus] = useState<boolean>(false)
    onAuthStateChanged(this.auth, (user) => {
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
    return {
      loginStatus: status,
      loginLoading: loading,
      loginUser: authUser
    }
  }

  public async signIn(providerName: signInProvider, session: signInSession = 'persistance') {
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
