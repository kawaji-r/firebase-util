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

class FirebaseUtil {
  private readonly app: FirebaseApp
  private readonly firestore: Firestore

  constructor(config: firebaseConfigType) {
    this.app = this.init(config)
    this.firestore = getFirestore(this.app)
  }

  /**
   * | collection | document | field | next | operation    |
   * | o          | o        | o    | o    | 登録して次へ |
   * | o          | o        | o    | x    | 登録して終了 |
   * | o          | o        | x    | o    | 次へ         |
   * | o          | null     | o    | o    | 登録して次へ |
   * | o          | null     | o    | x    | 登録して終了 |
   * | o          | null     | x    | o    | 次へ         |
   * 上記以外はエラー
   * @param firestoreStructure
   * @param ref
   * @param mergeFlg
   * @private
   */
  public async updateField(
    firestoreStructure: FirestoreStructure,
    mergeFlg: boolean = false,
    ref: any = this.firestore
  ) {
    const obj = {
      col: firestoreStructure.collection,
      doc: firestoreStructure.document,
      fld: firestoreStructure.field,
      nxt: firestoreStructure.next
    }

    if (!obj.col) throw new Error(`collectionキーは必須です / ${JSON.stringify(obj)}`)
    if (!obj.fld && !obj.nxt) throw new Error(`fieldキーとnextキーのどちらかは必須です / ${JSON.stringify(obj)}`)

    if (obj.doc && obj.fld && obj.nxt) {
      ref = doc(ref, obj.col, obj.doc)
      await setDoc(ref, obj.fld, { merge: mergeFlg })
      await this.updateField(obj.nxt, mergeFlg, ref)
    } else if (obj.doc && obj.fld && !obj.nxt) {
      ref = doc(ref, obj.col, obj.doc)
      await setDoc(ref, obj.fld, { merge: mergeFlg })
    } else if (obj.doc && !obj.fld && obj.nxt) {
      ref = doc(ref, obj.col, obj.doc)
      await this.updateField(obj.nxt, mergeFlg, ref)
    } else if (!obj.doc && obj.fld && obj.nxt) {
      ref = collection(ref, obj.col)
      ref = await addDoc(ref, obj.fld)
      await this.updateField(obj.nxt, mergeFlg, ref)
    } else if (!obj.doc && obj.fld && !obj.nxt) {
      ref = collection(ref, obj.col)
      await addDoc(ref, obj.fld)
    } else if (!obj.doc && !obj.fld && obj.nxt) {
      ref = collection(ref, obj.col)
      ref = await addDoc(ref, {})
      await this.updateField(obj.nxt, mergeFlg, ref)
    } else {
      throw new Error(`インプットデータが不正です / ${JSON.stringify(obj)}`)
    }
  }

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
      col: firestoreStructure.collection,
      doc: firestoreStructure.document,
      and: firestoreStructure.whereAnd,
      nxt: firestoreStructure.next
    }

    if (!obj.col) throw new Error(`collectionキーは必須です / ${JSON.stringify(obj)}`)
    if ((obj.doc && obj.and) || (!obj.doc && !obj.and))
      throw new Error(`documentキーとwhereAndキーのどちらか一方のみ必須です / ${JSON.stringify(obj)}`)

    let result: { id: string; data: unknown }[] | null = []

    if (obj.doc) {
      ref = doc(ref, obj.col, obj.doc)
      const docSnap = await getDoc(ref)
      if (docSnap.exists()) {
        result.push({
          id: obj.doc,
          data: docSnap.data()
        })
      } else {
        result = null
      }
    }

    if (obj.and) {
      let q: Query<unknown, DocumentData> = collection(ref, obj.col)
      // 複数条件のAND検索を実現できている
      obj.and.forEach((el: any) => {
        q = query(q, where(el.key, el.operator, el.value))
      })
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach((document) => {
        // (whr && nxt)の場合は、whrの結果のドキュメントIDを使ってnxt処理に使用する。
        // それもあり、whrの結果は1つのみの想定。そうでない場合は任意の一つのドキュメントが採用される。
        ref = doc(ref, obj.col, document.id)
        result.push({
          id: document.id,
          data: document.data()
        })
      })
    }

    // nxt がある場合はrefのみ、ない場合は result のみが使われる
    if (obj.nxt) return await this.readDocument(obj.nxt, ref)
    return result
  }

  public async deleteDocument(firestoreStructure: FirestoreStructure, ref: any = this.firestore) {
    if (!firestoreStructure.collection) throw new Error('collectionキーは必須です')
    if (!firestoreStructure.document) throw new Error('documentキーは必須です')

    ref = doc(ref, firestoreStructure.collection, firestoreStructure.document)
    if (firestoreStructure.next) {
      // サブコレクションは削除されないので注意
      await this.deleteDocument(firestoreStructure.next, ref)
    }
    await deleteDoc(ref)
  }

  public deleteCollection(): void {
    throw new Error('Webクライアントからのコレクションの削除は推奨されていません')
  }

  private init(config: firebaseConfigType): FirebaseApp {
    let app: FirebaseApp
    const apps: FirebaseApp[] = getApps()
    if (!apps.length) {
      // Firebaseアプリが初期化されていなければ初期化する
      app = initializeApp(config)
    } else {
      app = apps[0]
    }
    return app
  }
}

export default FirebaseUtil
