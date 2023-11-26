"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firestore_1 = require("firebase/firestore");
const FirebaseUtil_1 = __importDefault(require("./FirebaseUtil"));
class FirestoreUtil {
    constructor(firestore) {
        this.firestore = firestore;
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
    updateField(path, field, mergeFlg = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!path)
                throw new Error('pathは必須です');
            if (!field)
                throw new Error('fieldキーは必須です');
            const docRef = this.getDocRef(path); // DocumentReference取得
            yield (0, firestore_1.setDoc)(docRef, field, { merge: mergeFlg });
            return docRef;
        });
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
    readDocument(path, whereAnd = [], onlyOne = false) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const docSnap = yield (0, firestore_1.getDoc)(docRef); // ドキュメントを読み込む
                if (docSnap.exists()) {
                    result.push({
                        id: docSnap.id,
                        data: docSnap.data() // ドキュメントのデータを取得
                    });
                }
                else {
                    result = null;
                }
            }
            if (whereAnd.length !== 0) {
                let q = (0, firestore_1.collection)(this.firestore, path); // コレクションの参照を取得
                // 複数条件のAND検索を実現できている
                whereAnd.forEach((el) => {
                    q = (0, firestore_1.query)(q, (0, firestore_1.where)(el.key, el.operator, el.value)); // 検索条件を追加
                });
                const querySnapshot = yield (0, firestore_1.getDocs)(q); // 検索を実行
                querySnapshot.forEach((doc) => {
                    if (result === null)
                        return;
                    // 結果の配列に追加
                    result.push({
                        id: doc.id,
                        data: doc.data() // ドキュメントのデータを取得
                    });
                });
            }
            if (onlyOne) {
                if ((result === null || result === void 0 ? void 0 : result.length) !== 1)
                    throw new Error('検索結果が1件になりませんでした');
                return result[0];
            }
            return result;
        });
    }
    readAllDocument(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const isDoc = this.isDoc(path);
            if (isDoc)
                throw new Error(`コレクションへのパスを指定する必要があります / ${path}`);
            const querySnapshot = yield (0, firestore_1.getDocs)((0, firestore_1.collection)(this.firestore, path));
            const result = [];
            querySnapshot.forEach((doc) => {
                result.push({
                    id: doc.id,
                    data: doc.data() // ドキュメントのデータを取得
                });
            });
            return result;
        });
    }
    /**
     * Firestoreのドキュメントを削除します
     * @param {string} path - ドキュメントへのパス
     * Firestoreのドキュメントを削除します。サブコレクションは削除されません。
     */
    deleteDocument(path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!path)
                throw new Error('pathキーは必須です');
            if (!this.isDoc(path))
                throw new Error(`pathはドキュメントを指している必要があります / ${path}`);
            // ドキュメントを削除
            const docRef = this.getDocRef(path); // DocumentReference取得
            yield (0, firestore_1.deleteDoc)(docRef); // サブコレクションは削除されないので注意
        });
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
            path += '/' + FirebaseUtil_1.default.generateUUID();
        }
        // Firestoreからドキュメントの参照を取得
        return (0, firestore_1.doc)(this.firestore, path);
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
}
exports.default = FirestoreUtil;
