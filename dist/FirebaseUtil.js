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
import FirestoreUtil from './FirestoreUtil.js';
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
        return __awaiter(this, void 0, void 0, function* () {
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
            if (apps.length) {
                // Firebaseアプリがある場合は削除する
                for (const app of apps) {
                    yield deleteApp(app);
                }
            }
            // Firebaseアプリを初期化する
            const app = initializeApp(config);
            // Firestoreアプリを初期化する
            FirebaseUtil.firestore = new FirestoreUtil(getFirestore(app));
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
