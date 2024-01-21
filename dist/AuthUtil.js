var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { onAuthStateChanged, GoogleAuthProvider, setPersistence, browserSessionPersistence, signInWithRedirect, getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { getApp } from 'firebase/app';
/**
 * Firebaseの認証ユーティリティを提供します。
 *
 * このユーティリティは、Firebaseの認証機能を簡単に使用できるようにするためのものです。
 * これには、ログイン状態の監視、ログイン・ログアウトの処理などが含まれます。
 *
 * @module AuthUtil
 */
export const useLogin = () => {
    const app = getApp(); // すでに初期化されているFirebaseアプリのリストを取得
    const auth = getAuth(app);
    const [authUser, setAuthUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(false);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
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
        // Cleanup function
        return () => unsubscribe();
    });
    return {
        loginStatus: status,
        loginLoading: loading,
        loginUser: authUser
    };
};
class AuthUtil {
    constructor(auth) {
        this.auth = auth;
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
