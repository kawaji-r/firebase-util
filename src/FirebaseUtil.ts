import { FirebaseApp, getApps, initializeApp } from 'firebase/app'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  query,
  Query,
  setDoc,
  where
} from 'firebase/firestore'
import { firebaseConfigType, FirestoreStructure } from './types'

/**
 * Firebaseのユーティリティクラス
 * Firebaseの操作を抽象化し、簡単に利用できるようにするためのクラスです。
 */
class FirebaseUtil {
  private readonly app: FirebaseApp  // Firebaseアプリのインスタンス
  private readonly firestore: Firestore  // Firestoreのインスタンス

  /**
   * FirebaseUtilのコンストラクタ
   * @param {firebaseConfigType} config - Firebaseの設定
   * Firebaseの設定を元に、FirebaseアプリとFirestoreを初期化します。
   */
  constructor(config: firebaseConfigType) {
    this.app = this.init(config)  // Firebaseアプリの初期化
    this.firestore = getFirestore(this.app)  // Firestoreの初期化
  }

  /**
   * Firestoreのフィールドを更新します
   * @param {FirestoreStructure} firestoreStructure - Firestoreの構造
   * @param {boolean} mergeFlg - マージフラグ
   * @param {any} ref - Firestoreの参照
   * Firestoreのドキュメントのフィールドを更新します。ドキュメントが存在しない場合は新規作成します。
   * マージフラグがtrueの場合、既存のフィールドは保持され、指定したフィールドのみが更新されます。
   * マージフラグがfalseの場合、ドキュメント全体が新たに書き換えられます。
   */
  public async updateField(
    firestoreStructure: FirestoreStructure,
    mergeFlg: boolean = false,
    ref: any = this.firestore
  ) {
    const obj = {
      col: firestoreStructure.collection,  // コレクション名
      doc: firestoreStructure.document,  // ドキュメントID
      fld: firestoreStructure.field,  // 更新するフィールドのデータ
      nxt: firestoreStructure.next  // 次に更新するFirestoreの構造
    }

    if (!obj.col) throw new Error(`collectionキーは必須です / ${JSON.stringify(obj)}`)
    if (!obj.fld && !obj.nxt) throw new Error(`fieldキーとnextキーのどちらかは必須です / ${JSON.stringify(obj)}`)

    if (obj.doc && obj.fld && obj.nxt) {
      ref = doc(ref, obj.col, obj.doc)  // ドキュメントの参照を取得
      await setDoc(ref, obj.fld, { merge: mergeFlg })  // フィールドを更新
      await this.updateField(obj.nxt, mergeFlg, ref)  // 次の更新を実行
    } else if (obj.doc && obj.fld && !obj.nxt) {
      ref = doc(ref, obj.col, obj.doc)  // ドキュメントの参照を取得
      await setDoc(ref, obj.fld, { merge: mergeFlg })  // フィールドを更新
    } else if (obj.doc && !obj.fld && obj.nxt) {
      ref = doc(ref, obj.col, obj.doc)  // ドキュメントの参照を取得
      await this.updateField(obj.nxt, mergeFlg, ref)  // 次の更新を実行
    } else if (!obj.doc && obj.fld && obj.nxt) {
      ref = collection(ref, obj.col)  // コレクションの参照を取得
      ref = await addDoc(ref, obj.fld)  // 新規ドキュメントを作成
      await this.updateField(obj.nxt, mergeFlg, ref)  // 次の更新を実行
    } else if (!obj.doc && obj.fld && !obj.nxt) {
      ref = collection(ref, obj.col)  // コレクションの参照を取得
      await addDoc(ref, obj.fld)  // 新規ドキュメントを作成
    } else if (!obj.doc && !obj.fld && obj.nxt) {
      ref = collection(ref, obj.col)  // コレクションの参照を取得
      ref = await addDoc(ref, {})  // 空の新規ドキュメントを作成
      await this.updateField(obj.nxt, mergeFlg, ref)  // 次の更新を実行
    } else {
      throw new Error(`インプットデータが不正です / ${JSON.stringify(obj)}`)
    }
  }

  /**
   * Firestoreのドキュメントを読み込みます
   * @param {FirestoreStructure} firestoreStructure - Firestoreの構造
   * @param {any} ref - Firestoreの参照
   * @returns {Promise<{id: string, data: unknown}[] | null>} ドキュメントのデータ
   * Firestoreのドキュメントを読み込み、そのデータを返します。
   * ドキュメントが存在しない場合はnullを返します。
   */
  public async readDocument(
    firestoreStructure: FirestoreStructure,
    ref: any = this.firestore
  ): Promise<
    | {
        id: string
        data: unknown
      }[]
    | null
  > {
    const obj = {
      col: firestoreStructure.collection,  // コレクション名
      doc: firestoreStructure.document,  // ドキュメントID
      and: firestoreStructure.whereAnd,  // 検索条件
      nxt: firestoreStructure.next  // 次に読み込むFirestoreの構造
    }

    if (!obj.col) throw new Error(`collectionキーは必須です / ${JSON.stringify(obj)}`)
    if ((obj.doc && obj.and) || (!obj.doc && !obj.and))
      throw new Error(`documentキーとwhereAndキーのどちらか一方のみ必須です / ${JSON.stringify(obj)}`)

    let result: { id: string; data: unknown }[] | null = []

    if (obj.doc) {
      ref = doc(ref, obj.col, obj.doc)  // ドキュメントの参照を取得
      const docSnap = await getDoc(ref)  // ドキュメントを読み込む
      if (docSnap.exists()) {
        result.push({
          id: obj.doc,
          data: docSnap.data()  // ドキュメントのデータを取得
        })
      } else {
        result = null
      }
    }

    if (obj.and) {
      let q: Query<unknown, DocumentData> = collection(ref, obj.col)  // コレクションの参照を取得
      // 複数条件のAND検索を実現できている
      obj.and.forEach((el: any) => {
        q = query(q, where(el.key, el.operator, el.value))  // 検索条件を追加
      })
      const querySnapshot = await getDocs(q)  // 検索を実行
      querySnapshot.forEach((document) => {
        // (whr && nxt)の場合は、whrの結果のドキュメントIDを使ってnxt処理に使用する。
        // それもあり、whrの結果は1つのみの想定。そうでない場合は任意の一つのドキュメントが採用される。
        ref = doc(ref, obj.col, document.id)  // ドキュメントの参照を取得
        result.push({
          id: document.id,
          data: document.data()  // ドキュメントのデータを取得
        })
      })
    }

    // nxt がある場合はrefのみ、ない場合は result のみが使われる
    if (obj.nxt) return await this.readDocument(obj.nxt, ref)  // 次の読み込みを実行
    return result
  }

  /**
   * Firestoreのドキュメントを削除します
   * @param {FirestoreStructure} firestoreStructure - Firestoreの構造
   * @param {any} ref - Firestoreの参照
   * Firestoreのドキュメントを削除します。サブコレクションは削除されません。
   */
  public async deleteDocument(firestoreStructure: FirestoreStructure, ref: any = this.firestore) {
    if (!firestoreStructure.collection) throw new Error('collectionキーは必須です')
    if (!firestoreStructure.document) throw new Error('documentキーは必須です')

    ref = doc(ref, firestoreStructure.collection, firestoreStructure.document)  // ドキュメントの参照を取得
    if (firestoreStructure.next) {
      // サブコレクションは削除されないので注意
      await this.deleteDocument(firestoreStructure.next, ref)  // 次の削除を実行
    }
    await deleteDoc(ref)  // ドキュメントを削除
  }

  /**
   * Firestoreのコレクションを削除します
   * @throws {Error} Webクライアントからのコレクションの削除は推奨されていません
   * Webクライアントからコレクションを削除することは推奨されていません。このメソッドはエラーをスローします。
   */
  public deleteCollection(): void {
    throw new Error('Webクライアントからのコレクションの削除は推奨されていません')
  }

  /**
   * Firebaseアプリを初期化します
   * @param {firebaseConfigType} config - Firebaseの設定
   * @returns {FirebaseApp} Firebaseアプリ
   * Firebaseの設定を元に、Firebaseアプリを初期化します。すでに初期化されている場合は、そのインスタンスを返します。
   */
  private init(config: firebaseConfigType): FirebaseApp {
    let app: FirebaseApp
    const apps: FirebaseApp[] = getApps()  // すでに初期化されているFirebaseアプリのリストを取得
    if (!apps.length) {
      // Firebaseアプリが初期化されていなければ初期化する
      app = initializeApp(config)
    } else {
      app = apps[0]  // すでに初期化されているFirebaseアプリのインスタンスを取得
    }
    return app
  }
}

export default FirebaseUtil
