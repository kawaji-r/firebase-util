import { Auth, User } from 'firebase/auth';
import { signInProvider, signInSession } from './types.js';
/**
 * Firebaseの認証ユーティリティを提供します。
 *
 * このユーティリティは、Firebaseの認証機能を簡単に使用できるようにするためのものです。
 * これには、ログイン状態の監視、ログイン・ログアウトの処理などが含まれます。
 *
 * @module AuthUtil
 */
export declare const useLogin: () => {
    loginStatus: boolean;
    loginLoading: boolean;
    loginUser: User | null;
};
declare class AuthUtil {
    private auth;
    constructor(auth: Auth);
    signIn(providerName: signInProvider, session?: signInSession): Promise<void>;
}
export default AuthUtil;
