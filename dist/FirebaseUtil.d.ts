import { firebaseConfigType } from './types.js';
import FirestoreUtil from './FirestoreUtil.js';
import AuthUtil from './AuthUtil.js';
export { useLogin } from './AuthUtil';
/**
 * Firebaseのユーティリティクラス
 * Firebaseの操作を抽象化し、簡単に利用できるようにするためのクラスです。
 */
declare class FirebaseUtil {
    static firestore: FirestoreUtil;
    static auth: AuthUtil;
    /**
     * FirebaseUtilのコンストラクタ
     * @param {firebaseConfigType} config - Firebaseの設定
     * Firebaseの設定を元に、FirebaseアプリとFirestoreを初期化します。設定がnullの場合、環境変数から設定を読み込みます。
     */
    static init(config?: firebaseConfigType | null): void;
    /**
     * すでに初期化されているFirebaseアプリをすべて削除します。
     * Firebaseアプリが存在しない場合、何も行いません。
     */
    static deleteApps(): Promise<void>;
    /**
     * UUIDを生成します
     * @returns {string} 生成されたUUID
     * このメソッドは、cryptoモジュールを使用してUUIDを生成します。
     */
    static generateUUID(): string;
}
export default FirebaseUtil;
