import { FirebaseApp, getApps, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { firebaseConfigType } from './types'
import FirestoreUtil from './FirestoreUtil'

/**
 * Firebaseのユーティリティクラス
 * Firebaseの操作を抽象化し、簡単に利用できるようにするためのクラスです。
 */
class FirebaseUtil {
  public static firestore: FirestoreUtil // Firestoreのインスタンス

  /**
   * FirebaseUtilのコンストラクタ
   * @param {firebaseConfigType} config - Firebaseの設定
   * Firebaseの設定を元に、FirebaseアプリとFirestoreを初期化します。設定がnullの場合、環境変数から設定を読み込みます。
   */
  public static init(config: firebaseConfigType = null) {
    if (config === null) {
      config = {
        apiKey: process.env.FIREBASE_API_KEY || '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.FIREBASE_APP_ID || ''
      }
    }
    let app: FirebaseApp
    const apps: FirebaseApp[] = getApps() // すでに初期化されているFirebaseアプリのリストを取得
    if (!apps.length) {
      // Firebaseアプリが初期化されていなければ初期化する
      app = initializeApp(config)
    } else {
      app = apps[0] // すでに初期化されているFirebaseアプリのインスタンスを取得
    }
    FirebaseUtil.firestore = new FirestoreUtil(getFirestore(app)) // Firestoreの初期化
  }

  /**
   * UUIDを生成します
   * @returns {string} 生成されたUUID
   * このメソッドは、cryptoモジュールを使用してUUIDを生成します。
   */
  public static generateUUID(): string {
    const crypto = require('crypto')
    return crypto.randomUUID()
  }
}

export default FirebaseUtil
