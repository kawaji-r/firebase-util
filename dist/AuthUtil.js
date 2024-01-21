var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { onAuthStateChanged, GoogleAuthProvider, setPersistence, browserSessionPersistence, signInWithRedirect } from 'firebase/auth';
import { useState } from 'react';
class AuthUtil {
    constructor(auth) {
        this.auth = auth;
    }
    useLogin() {
        const [authUser, setAuthUser] = useState(null);
        const [loading, setLoading] = useState(true);
        const [status, setStatus] = useState(false);
        onAuthStateChanged(this.auth, (user) => {
            setAuthUser(user);
            if (user) {
                console.debug('Logged in');
                console.debug(user);
                setStatus(true);
                setLoading(false);
            }
            else {
                console.debug('Not logged in');
                setStatus(false);
                setLoading(false);
            }
        });
        return {
            loginStatus: status,
            loginLoading: loading,
            loginUser: authUser
        };
    }
    signIn(providerName, session = 'persistance') {
        return __awaiter(this, void 0, void 0, function* () {
            // プロバイダ取得
            let provider;
            switch (providerName.toLowerCase()) {
                case 'google':
                    provider = new GoogleAuthProvider();
                    break;
                default:
                    console.error('Invalid service name');
            }
            // リダイレクト
            switch (session.toLowerCase()) {
                case 'persistance':
                    // persistance（永続性セッション）の場合
                    setPersistence(this.auth, browserSessionPersistence)
                        .then(() => {
                        return signInWithRedirect(this.auth, provider);
                    })
                        .catch((error) => {
                        console.error(error);
                    });
                    break;
                default:
                    console.error('Invalid session setting');
            }
        });
    }
}
export default AuthUtil;
