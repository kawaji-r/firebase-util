"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const FirestoreUtil_1 = __importDefault(require("./FirestoreUtil"));
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
        let app;
        const apps = (0, app_1.getApps)(); // すでに初期化されているFirebaseアプリのリストを取得
        if (!apps.length) {
            // Firebaseアプリが初期化されていなければ初期化する
            app = (0, app_1.initializeApp)(config);
        }
        else {
            app = apps[0]; // すでに初期化されているFirebaseアプリのインスタンスを取得
        }
        FirebaseUtil.firestore = new FirestoreUtil_1.default((0, firestore_1.getFirestore)(app)); // Firestoreの初期化
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
exports.default = FirebaseUtil;
