import { FirebaseApp, getApps, initializeApp, deleteApp } from 'firebase/app'
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
  public static init(config: firebaseConfigType | null = null): void {
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

    const apps: FirebaseApp[] = getApps() // すでに初期化されているFirebaseアプリのリストを取得
    const app = apps.length
      ? apps[0] // すでに初期化されているFirebaseアプリのインスタンスを取得
      : initializeApp(config) // Firebaseアプリが初期化されていなければ初期化する
    FirebaseUtil.firestore = new FirestoreUtil(getFirestore(app)) // Firestoreの初期化
  }

  /**
   * すでに初期化されているFirebaseアプリをすべて削除します。
   * Firebaseアプリが存在しない場合、何も行いません。
   */
  public static async deleteApps(): Promise<void> {
    const apps = getApps() // すでに初期化されているFirebaseアプリのリストを取得
    if (apps.length) {
      // Firebaseアプリがある場合は削除する
      for (let app of apps) {
        await deleteApp(app)
      }
    }
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
