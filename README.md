# FirebaseUtil

FirebaseUtilは、Firebaseの操作を抽象化し、簡単に利用できるようにするためのクラスです。

## install
```
npm install --save git@github.com:kawaji-r/firebase-util.git
```

## First Step
```
import fb from 'firebase-util'
const app = {
  apiKey:              'XXXXX'
  , authDomain:        'XXXXX'
  , projectId:         'XXXXX'
  , storageBucket:     'XXXXX'
  , messagingSenderId: 'XXXXX'
  , appId:             'XXXXX'
}
await fb.init(app)
fb.firestore.updateField('collectionId/documentId', {data: 'Hello World!'})
```

## Firestore

- `updateField(path: string, field: firestoreField, mergeFlg: boolean = false): Promise<DocumentReference>`  
  Firestoreのドキュメントのフィールドを更新します。ドキュメントが存在しない場合は新規作成します。

- `readDocument(path: string, whereAnd: firestoreWhere[] = [], onlyOne: boolean = false): Promise<docReturnType | docReturnType[] | null>`  
  Firestoreのドキュメントを読み込み、そのデータを返します。

- `deleteDocument(path: string)`  
  Firestoreのドキュメントを削除します。

- `generateUUID(): string`  
  UUIDを生成します。

## Authentcation

- `useLogin(): { loginStatus: boolean; loginLoading: boolean; loginUser: User | null }`  
  Firebase Authenticationへのログイン状況を取得するカスタムフック  
  `import {useLogin} from 'firebase-util'` でインポート

- `signIn(providerName: signInProvider, session: signInSession = 'persistance'): Promise<void>`  
  リダイレクトを使ってFirebase Authenticationへログインする  
  `fb.auth.signIn(...)` で使用する
