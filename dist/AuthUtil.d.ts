import { Auth, User } from 'firebase/auth';
import { signInProvider, signInSession } from './types.js';
declare class AuthUtil {
    private auth;
    constructor(auth: Auth);
    useLogin(): {
        loginStatus: boolean;
        loginLoading: boolean;
        loginUser: User | null;
    };
    signIn(providerName: signInProvider, session?: signInSession): Promise<void>;
}
export default AuthUtil;
