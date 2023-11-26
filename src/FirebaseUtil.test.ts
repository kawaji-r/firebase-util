import fb from './FirebaseUtil'
import { config } from 'dotenv'
import { docReturnType } from './types'

describe('Firestoreテスト', () => {
  // let firebaseUtil: FirebaseUtil
  let nowTime: string

  beforeAll(() => {
    config()
    fb.init()

    // 現在時刻取得
    const date = new Date()
    nowTime = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
  })

  it('スラッシュが0個の場合', async () => {
    // 入力データ
    const input = {
      path: 'test',
      field: { key: `${nowTime}-00001`, comment: 'スラッシュが0個' }
    }

    // 処理実施
    const docRef = await fb.firestore.updateField(input.path, input.field)

    // 結果確認
    const fetch = (await fb.firestore.readDocument(docRef.path, undefined, true)) as docReturnType
    expect(fetch.data).toEqual(input.field)
  })

  it('スラッシュが1個の場合', async () => {
    // 入力データ
    const input = {
      path: `test/${nowTime}`,
      field: { key: `${nowTime}-00002`, comment: 'スラッシュが1個' }
    }

    // 処理実施
    const docRef = await fb.firestore.updateField(input.path, input.field)

    // 結果確認
    const fetch = (await fb.firestore.readDocument(docRef.path, undefined, true)) as docReturnType
    expect(fetch.data).toEqual(input.field)
  })

  it('スラッシュが2個の場合', async () => {
    // 入力データ
    const input = {
      path: `test/${nowTime}/subcollection`,
      field: { key: `${nowTime}-00003`, comment: 'スラッシュが2個' }
    }

    // 処理実施
    const docRef = await fb.firestore.updateField(input.path, input.field)

    // 結果確認
    const fetch = (await fb.firestore.readDocument(docRef.path, undefined, true)) as docReturnType
    expect(fetch.data).toEqual(input.field)
  })

  it('スラッシュが3個の場合', async () => {
    // 入力データ
    const input = {
      path: `test/${nowTime}/subcollection/subdocument`,
      field: { key: `${nowTime}-00004`, comment: 'スラッシュが3個' }
    }

    // 処理実施
    const docRef = await fb.firestore.updateField(input.path, input.field)

    // 結果確認
    const fetch = (await fb.firestore.readDocument(docRef.path, undefined, true)) as docReturnType
    expect(fetch.data).toEqual(input.field)
  })

  it('フィールドをマージする', async () => {
    // 事前準備（データの登録）
    await fb.firestore.updateField(`test/${nowTime}/mergeField/doc`, { before_comment: 'マージ前' })

    // 処理実施
    await fb.firestore.updateField(`test/${nowTime}/mergeField/doc`, { after_comment: 'マージ後' }, true)

    // 結果確認
    const fetch = (await fb.firestore.readDocument(`test/${nowTime}/mergeField/doc`, undefined, true)) as docReturnType
    expect(fetch.id).toEqual('doc')
    expect(fetch.data).toEqual({ before_comment: 'マージ前', after_comment: 'マージ後' })
  })

  it('コレクション内のすべてのドキュメントを取得', async () => {
    // 事前準備（データの登録）
    await fb.firestore.updateField(`test/${nowTime}/getAllDocument/doc1`, { comment: '全ドキュメント取得1' })
    await fb.firestore.updateField(`test/${nowTime}/getAllDocument/doc2`, { comment: '全ドキュメント取得2' })
    await fb.firestore.updateField(`test/${nowTime}/getAllDocument/doc3`, { comment: '全ドキュメント取得3' })

    // 処理実施
    const docsRef = await fb.firestore.readAllDocument(`test/${nowTime}/getAllDocument/`)

    // 結果確認
    expect(docsRef[0].id).toEqual('doc1')
    expect(docsRef[0].data).toEqual({ comment: '全ドキュメント取得1' })
    expect(docsRef[1].id).toEqual('doc2')
    expect(docsRef[1].data).toEqual({ comment: '全ドキュメント取得2' })
    expect(docsRef[2].id).toEqual('doc3')
    expect(docsRef[2].data).toEqual({ comment: '全ドキュメント取得3' })
  })

  it('ドキュメントを削除', async () => {
    // 事前準備（データの登録）
    const docRef = await fb.firestore.updateField(`test/${nowTime}/deleteDocument/doc`, {
      comment: '削除されるフィールド'
    })

    // 入力データ
    const input = { path: `${docRef.path}` }

    // 処理実施
    await fb.firestore.deleteDocument(input.path)

    // 結果確認
    const fetch = await fb.firestore.readDocument(docRef.path)
    expect(fetch).toBeNull()
  })
})
