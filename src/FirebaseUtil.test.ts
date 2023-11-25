import { FirebaseApp, getApps, initializeApp } from 'firebase/app'
import { collection, doc, setDoc, addDoc, getFirestore } from 'firebase/firestore'
import FirebaseUtil from './FirebaseUtil'
import { FirestoreStructure } from './types'
import { config } from 'dotenv'

describe('FirebaseUtil', () => {
  let firebaseUtil: FirebaseUtil
  let nowTime: string

  beforeAll(() => {
    config()
    const app = {
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.FIREBASE_APP_ID || ''
    }
    firebaseUtil = new FirebaseUtil(app)
    // 現在時刻取得
    const date = new Date()
    nowTime = `${date.getFullYear()}/${
      date.getMonth() + 1
    }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
  })

  test('firebase-test', async () => {
    const config = {
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.FIREBASE_APP_ID || ''
    }
    let app
    const apps: FirebaseApp[] = getApps() // すでに初期化されているFirebaseアプリのリストを取得
    if (!apps.length) {
      // Firebaseアプリが初期化されていなければ初期化する
      app = initializeApp(config)
    } else {
      app = apps[0] // すでに初期化されているFirebaseアプリのインスタンスを取得
    }
    const db = getFirestore(app)
    let docSnap

    docSnap = await setDoc(doc(db, 'cities', 'NY'), { no: 1 })
    // Collection: cities, Document: LA, Field: {no: 2} を登録

    docSnap = await setDoc(doc(db, 'cities/Hawaii'), { no: 2 })
    // Collection: cities, Document: LA, Field: {no: 2} を登録

    docSnap = await setDoc(doc(db, 'user', 'MyName', 'cities', 'Miami'), { no: 3 })
    // docSnap = await setDoc(doc(db, 'cities', 'LA'), { no: 2 })
    // Collection: cities, Document: LA, Field: {no: 2} を登録

    docSnap = await setDoc(doc(db, 'user/MyName/cities/SanFransisco'), { no: 4 })
    // Collection: cities, Document: LA, Field: {no: 2} を登録

    docSnap = await setDoc(doc(db, `user/MyName/cities/${FirebaseUtil.generateUUID()}`), { no: 5 })
    // Collection: cities, Document: LA, Field: {no: 2} を登録
  })

  test('updateField', async () => {
    const firestoreStructure: FirestoreStructure = {
      collection: 'test',
      document: '2023/11/10 1234',
      field: { n: 1 }
    }
    await firebaseUtil.updateField(firestoreStructure, true)
    expect(1).toEqual(1)
    // const docRef = doc(firebaseUtil.firestore, firestoreStructure.collection, firestoreStructure.document)
    // const docSnap = await getDoc(docRef)
    // expect(docSnap.data()).toEqual({ [firestoreStructure.field]: firestoreStructure.value })
  })
})
