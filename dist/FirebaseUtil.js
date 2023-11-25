import { getApps, initializeApp } from 'firebase/app';
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from 'firebase/firestore';
/**
 * Firebaseのユーティリティクラス
 * Firebaseの操作を抽象化し、簡単に利用できるようにするためのクラスです。
 */
class FirebaseUtil {
    app; // Firebaseアプリのインスタンス
    firestore; // Firestoreのインスタンス
    /**
     * FirebaseUtilのコンストラクタ
     * @param {firebaseConfigType} config - Firebaseの設定
     * Firebaseの設定を元に、FirebaseアプリとFirestoreを初期化します。
     */
    constructor(config) {
        this.app = this.init(config); // Firebaseアプリの初期化
        this.firestore = getFirestore(this.app); // Firestoreの初期化
    }
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
    async updateField(path, field, mergeFlg = false) {
        if (!path)
            throw new Error('pathは必須です');
        if (!field)
            throw new Error('fieldキーは必須です');
        const docRef = this.getDocRef(path); // DocumentReference取得
        await setDoc(docRef, field, { merge: mergeFlg });
        return docRef;
    }
    /**
     * Firestoreのドキュメントを読み込みます
     * @param {string} path - ドキュメントへのパス
     * @param {firestoreWhere[]} whereAnd - 検索条件
     * @param {boolean} onlyOne - 一つだけのドキュメントを返すかどうか
     * @returns {Promise<{id: string, data: unknown}[] | null>} ドキュメントのデータ
     * Firestoreのドキュメントを読み込み、そのデータを返します。
     * ドキュメントが存在しない場合はnullを返します。
     */
    async readDocument(path, whereAnd = [], onlyOne = false) {
        if (!path)
            throw new Error('pathキーは必須です');
        const isDoc = this.isDoc(path); // パスがドキュメントを指しているかどうかを判定
        if (isDoc && whereAnd.length !== 0)
            throw new Error(`pathがドキュメントの場合はwhereAndキーは禁止です / path: ${JSON.stringify(path)} / whereAnd: ${whereAnd}`);
        if (!isDoc && whereAnd.length === 0)
            throw new Error(`pathがコレクションの場合はwhereAndキーが必須です / path: ${JSON.stringify(path)} / whereAnd: ${whereAnd}`);
        let result = [];
        if (isDoc) {
            const docRef = this.getDocRef(path); // DocumentReference取得
            const docSnap = await getDoc(docRef); // ドキュメントを読み込む
            if (docSnap.exists()) {
                result.push({
                    id: path,
                    data: docSnap.data() // ドキュメントのデータを取得
                });
            }
            else {
                result = null;
            }
        }
        if (whereAnd.length !== 0) {
            let q = collection(this.firestore, path); // コレクションの参照を取得
            // 複数条件のAND検索を実現できている
            whereAnd.forEach((el) => {
                q = query(q, where(el.key, el.operator, el.value)); // 検索条件を追加
            });
            const querySnapshot = await getDocs(q); // 検索を実行
            querySnapshot.forEach((document) => {
                // (whr && nxt)の場合は、whrの結果のドキュメントIDを使ってnxt処理に使用する。
                // それもあり、whrの結果は1つのみの想定。そうでない場合は任意の一つのドキュメントが採用される。
                result.push({
                    id: document.id,
                    data: document.data() // ドキュメントのデータを取得
                });
            });
        }
        if (onlyOne) {
            if (result.length !== 1)
                throw new Error('検索結果が1件になりませんでした');
            return result[0];
        }
        return result;
    }
    /**
     * Firestoreのドキュメントを削除します
     * @param {string} path - ドキュメントへのパス
     * Firestoreのドキュメントを削除します。サブコレクションは削除されません。
     */
    async deleteDocument(path) {
        if (!path)
            throw new Error('pathキーは必須です');
        if (!this.isDoc(path))
            throw new Error(`pathはドキュメントを指している必要があります / ${path}`);
        // ドキュメントを削除
        const docRef = this.getDocRef(path); // DocumentReference取得
        await deleteDoc(docRef); // サブコレクションは削除されないので注意
    }
    /**
     * Firestoreのコレクションを削除します
     * @throws {Error} Webクライアントからのコレクションの削除は推奨されていません
     * Webクライアントからコレクションを削除することは推奨されていません。このメソッドはエラーをスローします。
     */
    deleteCollection() {
        throw new Error('Webクライアントからのコレクションの削除は推奨されていません');
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
    /**
     * 指定したパスのドキュメントを取得します。
     * @param {string} path - ドキュメントへのパス
     * @returns {DocumentReference} ドキュメントの参照
     * pathがコレクションである場合は、UUIDを生成してパスに追加します。
     * 最終的にFirestoreからドキュメントの参照を取得します。
     */
    getDocRef(path) {
        const isDoc = this.isDoc(path);
        // pathがコレクションである場合は、UUIDを生成してパスに追加
        if (!isDoc) {
            path += '/' + FirebaseUtil.generateUUID();
        }
        // Firestoreからドキュメントの参照を取得
        return doc(this.firestore, path);
    }
    /**
     * パスがドキュメントを指しているかどうかを判断します。
     * @param {string} path - ドキュメントへのパス
     * @returns {boolean} パスがドキュメントを指している場合はtrue、そうでない場合はfalse
     * パスの先頭と末尾のスラッシュを除去した後、スラッシュの数を数えます。スラッシュの数が奇数の場合は、パスはドキュメントを指しています。
     */
    isDoc(path) {
        // 先頭と末尾のスラッシュを除去
        path = path.replace(/^\/|\/$/g, '');
        // スラッシュの数をreturn
        const slashCount = (path.match(/\//g) || []).length;
        if (slashCount % 2 !== 0) {
            // スラッシュの数が奇数 => document
            return true;
        }
        else {
            // スラッシュの数が偶数 => not document
            return false;
        }
    }
    /**
     * Firebaseアプリを初期化します
     * @param {firebaseConfigType} config - Firebaseの設定
     * @returns {FirebaseApp} Firebaseアプリ
     * Firebaseの設定を元に、Firebaseアプリを初期化します。すでに初期化されている場合は、そのインスタンスを返します。
     */
    init(config) {
        let app;
        const apps = getApps(); // すでに初期化されているFirebaseアプリのリストを取得
        if (!apps.length) {
            // Firebaseアプリが初期化されていなければ初期化する
            app = initializeApp(config);
        }
        else {
            app = apps[0]; // すでに初期化されているFirebaseアプリのインスタンスを取得
        }
        return app;
    }
}
export default FirebaseUtil;
