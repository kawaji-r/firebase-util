var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getApps, initializeApp, deleteApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import FirestoreUtil from './FirestoreUtil.js';
import AuthUtil from './AuthUtil.js';
// 単順なimport-export
export { useLogin } from './AuthUtil';
/**
 * Firebaseのユーティリティクラス
 * Firebaseの操作を抽象化し、簡単に利用できるようにするためのクラスです。
 */
class FirebaseUtil {
    /**
     * FirebaseUtilのコンストラクタ
     * @param {firebaseConfigType} config - Firebaseの設定
     * Firebaseの設定を元に、FirebaseアプリとFirestoreを初期化します。設定がnullの場合、環境変数から設定を読み込みます。
     */
    static init(config = null) {
        if (config === null) {
            config = {
                apiKey: process.env.FIREBASE_API_KEY || '',
                authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
                projectId: process.env.FIREBASE_PROJECT_ID || '',
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
                messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
                appId: process.env.FIREBASE_APP_ID || ''
            };
        }
        const apps = getApps(); // すでに初期化されているFirebaseアプリのリストを取得
        const app = apps.length
            ? apps[0] // すでに初期化されているFirebaseアプリのインスタンスを取得
            : initializeApp(config); // Firebaseアプリが初期化されていなければ初期化する
        FirebaseUtil.firestore = new FirestoreUtil(getFirestore(app)); // Firestoreの初期化
        FirebaseUtil.auth = new AuthUtil(getAuth(app)); // Firestoreの初期化
    }
    /**
     * すでに初期化されているFirebaseアプリをすべて削除します。
     * Firebaseアプリが存在しない場合、何も行いません。
     */
    static deleteApps() {
        return __awaiter(this, void 0, void 0, function* () {
            const apps = getApps(); // すでに初期化されているFirebaseアプリのリストを取得
            if (apps.length) {
                // Firebaseアプリがある場合は削除する
                for (let app of apps) {
                    yield deleteApp(app);
                }
            }
        });
    }
    /**
     * UUIDを生成します
     * @returns {string} 生成されたUUID
     * このメソッドは、cryptoモジュールを使用してUUIDを生成します。
     */
    static generateUUID() {
        const crypto = require('crypto');
        return crypto.randomUUID();
    }
}
export default FirebaseUtil;
