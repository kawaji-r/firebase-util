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
const FirebaseUtil_1 = __importDefault(require("./FirebaseUtil"));
const dotenv_1 = require("dotenv");
describe('Firestoreテスト', () => {
    // let firebaseUtil: FirebaseUtil
    let nowTime;
    beforeAll(() => {
        (0, dotenv_1.config)();
        FirebaseUtil_1.default.init();
        // 現在時刻取得
        const date = new Date();
        nowTime = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    });
    it('スラッシュが0個の場合', () => __awaiter(void 0, void 0, void 0, function* () {
        // 入力データ
        const input = {
            path: 'test',
            field: { key: `${nowTime}-00001`, comment: 'スラッシュが0個' }
        };
        // 処理実施
        const docRef = yield FirebaseUtil_1.default.firestore.updateField(input.path, input.field);
        // 結果確認
        const fetch = (yield FirebaseUtil_1.default.firestore.readDocument(docRef.path, undefined, true));
        expect(fetch.data).toEqual(input.field);
    }));
    it('スラッシュが1個の場合', () => __awaiter(void 0, void 0, void 0, function* () {
        // 入力データ
        const input = {
            path: `test/${nowTime}`,
            field: { key: `${nowTime}-00002`, comment: 'スラッシュが1個' }
        };
        // 処理実施
        const docRef = yield FirebaseUtil_1.default.firestore.updateField(input.path, input.field);
        // 結果確認
        const fetch = (yield FirebaseUtil_1.default.firestore.readDocument(docRef.path, undefined, true));
        expect(fetch.data).toEqual(input.field);
    }));
    it('スラッシュが2個の場合', () => __awaiter(void 0, void 0, void 0, function* () {
        // 入力データ
        const input = {
            path: `test/${nowTime}/subcollection`,
            field: { key: `${nowTime}-00003`, comment: 'スラッシュが2個' }
        };
        // 処理実施
        const docRef = yield FirebaseUtil_1.default.firestore.updateField(input.path, input.field);
        // 結果確認
        const fetch = (yield FirebaseUtil_1.default.firestore.readDocument(docRef.path, undefined, true));
        expect(fetch.data).toEqual(input.field);
    }));
    it('スラッシュが3個の場合', () => __awaiter(void 0, void 0, void 0, function* () {
        // 入力データ
        const input = {
            path: `test/${nowTime}/subcollection/subdocument`,
            field: { key: `${nowTime}-00004`, comment: 'スラッシュが3個' }
        };
        // 処理実施
        const docRef = yield FirebaseUtil_1.default.firestore.updateField(input.path, input.field);
        // 結果確認
        const fetch = (yield FirebaseUtil_1.default.firestore.readDocument(docRef.path, undefined, true));
        expect(fetch.data).toEqual(input.field);
    }));
    it('フィールドをマージする', () => __awaiter(void 0, void 0, void 0, function* () {
        // 事前準備（データの登録）
        yield FirebaseUtil_1.default.firestore.updateField(`test/${nowTime}/mergeField/doc`, { before_comment: 'マージ前' });
        // 処理実施
        yield FirebaseUtil_1.default.firestore.updateField(`test/${nowTime}/mergeField/doc`, { after_comment: 'マージ後' }, true);
        // 結果確認
        const fetch = (yield FirebaseUtil_1.default.firestore.readDocument(`test/${nowTime}/mergeField/doc`, undefined, true));
        expect(fetch.id).toEqual('doc');
        expect(fetch.data).toEqual({ before_comment: 'マージ前', after_comment: 'マージ後' });
    }));
    it('コレクション内のすべてのドキュメントを取得', () => __awaiter(void 0, void 0, void 0, function* () {
        // 事前準備（データの登録）
        yield FirebaseUtil_1.default.firestore.updateField(`test/${nowTime}/getAllDocument/doc1`, { comment: '全ドキュメント取得1' });
        yield FirebaseUtil_1.default.firestore.updateField(`test/${nowTime}/getAllDocument/doc2`, { comment: '全ドキュメント取得2' });
        yield FirebaseUtil_1.default.firestore.updateField(`test/${nowTime}/getAllDocument/doc3`, { comment: '全ドキュメント取得3' });
        // 処理実施
        const docsRef = yield FirebaseUtil_1.default.firestore.readAllDocument(`test/${nowTime}/getAllDocument/`);
        // 結果確認
        expect(docsRef[0].id).toEqual('doc1');
        expect(docsRef[0].data).toEqual({ comment: '全ドキュメント取得1' });
        expect(docsRef[1].id).toEqual('doc2');
        expect(docsRef[1].data).toEqual({ comment: '全ドキュメント取得2' });
        expect(docsRef[2].id).toEqual('doc3');
        expect(docsRef[2].data).toEqual({ comment: '全ドキュメント取得3' });
    }));
    it('ドキュメントを削除', () => __awaiter(void 0, void 0, void 0, function* () {
        // 事前準備（データの登録）
        const docRef = yield FirebaseUtil_1.default.firestore.updateField(`test/${nowTime}/deleteDocument/doc`, {
            comment: '削除されるフィールド'
        });
        // 入力データ
        const input = { path: `${docRef.path}` };
        // 処理実施
        yield FirebaseUtil_1.default.firestore.deleteDocument(input.path);
        // 結果確認
        const fetch = yield FirebaseUtil_1.default.firestore.readDocument(docRef.path);
        expect(fetch).toBeNull();
    }));
});
