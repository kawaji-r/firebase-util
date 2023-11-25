import { DocumentReference } from 'firebase/firestore';
import { docReturnType, firebaseConfigType, firestoreField, firestoreWhere } from './types';
/**
 * Firebaseのユーティリティクラス
 * Firebaseの操作を抽象化し、簡単に利用できるようにするためのクラスです。
 */
declare class FirebaseUtil {
    private readonly app;
    private readonly firestore;
    /**
     * FirebaseUtilのコンストラクタ
     * @param {firebaseConfigType} config - Firebaseの設定
     * Firebaseの設定を元に、FirebaseアプリとFirestoreを初期化します。
     */
    constructor(config: firebaseConfigType);
    /**
     * Firestoreのフィールドを更新します
     * @param {string} path - ドキュメントへのパス
     * @param {firestoreField} field - 更新するフィールド
     * @param {boolean} mergeFlg - マージフラグ
     * @returns {Promise<DocumentReference>} ドキュメントの参照
     * Firestoreのドキュメントのフィールドを更新します。ドキュメントが存在しない場合は新規作成します。
     * マージフラグがtrueの場合、既存のフィールドは保持され、指定したフィールドのみが更新されます。
     * マージフラグがfalseの場合、ドキュメント全体が新たに書き換えられます。
     */
    updateField(path: string, field: firestoreField, mergeFlg?: boolean): Promise<DocumentReference>;
    /**
     * Firestoreのドキュメントを読み込みます
     * @param {string} path - ドキュメントへのパス
     * @param {firestoreWhere[]} whereAnd - 検索条件
     * @param {boolean} onlyOne - 一つだけのドキュメントを返すかどうか
     * @returns {Promise<{id: string, data: unknown}[] | null>} ドキュメントのデータ
     * Firestoreのドキュメントを読み込み、そのデータを返します。
     * ドキュメントが存在しない場合はnullを返します。
     */
    readDocument(path: string, whereAnd?: firestoreWhere[], onlyOne?: boolean): Promise<docReturnType | docReturnType[] | null>;
    /**
     * Firestoreのドキュメントを削除します
     * @param {string} path - ドキュメントへのパス
     * Firestoreのドキュメントを削除します。サブコレクションは削除されません。
     */
    deleteDocument(path: string): Promise<void>;
    /**
     * Firestoreのコレクションを削除します
     * @throws {Error} Webクライアントからのコレクションの削除は推奨されていません
     * Webクライアントからコレクションを削除することは推奨されていません。このメソッドはエラーをスローします。
     */
    deleteCollection(): void;
    /**
     * UUIDを生成します
     * @returns {string} 生成されたUUID
     * このメソッドは、cryptoモジュールを使用してUUIDを生成します。
     */
    static generateUUID(): string;
    /**
     * 指定したパスのドキュメントを取得します。
     * @param {string} path - ドキュメントへのパス
     * @returns {DocumentReference} ドキュメントの参照
     * pathがコレクションである場合は、UUIDを生成してパスに追加します。
     * 最終的にFirestoreからドキュメントの参照を取得します。
     */
    private getDocRef;
    /**
     * パスがドキュメントを指しているかどうかを判断します。
     * @param {string} path - ドキュメントへのパス
     * @returns {boolean} パスがドキュメントを指している場合はtrue、そうでない場合はfalse
     * パスの先頭と末尾のスラッシュを除去した後、スラッシュの数を数えます。スラッシュの数が奇数の場合は、パスはドキュメントを指しています。
     */
    private isDoc;
    /**
     * Firebaseアプリを初期化します
     * @param {firebaseConfigType} config - Firebaseの設定
     * @returns {FirebaseApp} Firebaseアプリ
     * Firebaseの設定を元に、Firebaseアプリを初期化します。すでに初期化されている場合は、そのインスタンスを返します。
     */
    private init;
}
export default FirebaseUtil;
