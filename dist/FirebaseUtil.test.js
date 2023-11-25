import FirebaseUtil from './FirebaseUtil';
import { config } from 'dotenv';
describe('FirebaseUtil', () => {
    let firebaseUtil;
    let nowTime;
    beforeAll(() => {
        config();
        const app = {
            apiKey: process.env.FIREBASE_API_KEY || '',
            authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
            projectId: process.env.FIREBASE_PROJECT_ID || '',
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
            appId: process.env.FIREBASE_APP_ID || ''
        };
        firebaseUtil = new FirebaseUtil(app);
        // 現在時刻取得
        const date = new Date();
        nowTime = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    });
    it('スラッシュが0個の場合', async () => {
        // 入力データ
        const input = {
            path: 'test',
            field: { key: `${nowTime}-00001`, comment: 'スラッシュが0個' }
        };
        // 処理実施
        const docRef = await firebaseUtil.updateField(input.path, input.field);
        // 結果確認
        const fetch = (await firebaseUtil.readDocument(docRef.path, undefined, true));
        expect(fetch.data).toEqual(input.field);
    });
    it('スラッシュが1個の場合', async () => {
        // 入力データ
        const input = {
            path: `test/${nowTime}`,
            field: { key: `${nowTime}-00002`, comment: 'スラッシュが1個' }
        };
        // 処理実施
        const docRef = await firebaseUtil.updateField(input.path, input.field);
        // 結果確認
        const fetch = (await firebaseUtil.readDocument(docRef.path, undefined, true));
        expect(fetch.data).toEqual(input.field);
    });
    it('スラッシュが2個の場合', async () => {
        // 入力データ
        const input = {
            path: `test/${nowTime}/subcollection`,
            field: { key: `${nowTime}-00003`, comment: 'スラッシュが2個' }
        };
        // 処理実施
        const docRef = await firebaseUtil.updateField(input.path, input.field);
        // 結果確認
        const fetch = (await firebaseUtil.readDocument(docRef.path, undefined, true));
        expect(fetch.data).toEqual(input.field);
    });
    it('スラッシュが3個の場合', async () => {
        // 入力データ
        const input = {
            path: `test/${nowTime}/subcollection/subdocument`,
            field: { key: `${nowTime}-00004`, comment: 'スラッシュが3個' }
        };
        // 処理実施
        const docRef = await firebaseUtil.updateField(input.path, input.field);
        // 結果確認
        const fetch = (await firebaseUtil.readDocument(docRef.path, undefined, true));
        expect(fetch.data).toEqual(input.field);
    });
    it('ドキュメントを削除', async () => {
        // 事前準備（データの登録）
        const docRef = await firebaseUtil.updateField('test/deleteDocument', { comment: '削除されるフィールド' });
        // 入力データ
        const input = { path: `${docRef.path}` };
        // 処理実施
        await firebaseUtil.deleteDocument(input.path);
        // 結果確認
        const fetch = await firebaseUtil.readDocument(docRef.path);
        expect(fetch).toBeNull();
    });
});
