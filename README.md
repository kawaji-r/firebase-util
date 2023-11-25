# FirebaseUtil

FirebaseUtilは、Firebaseの操作を抽象化し、簡単に利用できるようにするためのクラスです。

## install
```
npm install --save git@github.com:kawaji-r/firebase-util.git
# Firebase SDK install
npx firebase login
npx firebase init
```

## First Step
```
import FirebaseUtil from 'firebase-util'
const app = {
  apiKey:              'XXXXX'
  , authDomain:        'XXXXX'
  , projectId:         'XXXXX'
  , storageBucket:     'XXXXX'
  , messagingSenderId: 'XXXXX'
  , appId:             'XXXXX'
}
const firebaseUtil = new FirebaseUtil(app)
const result = await firebaseUtil.readDocument('collectionId/documentId')
console.log(`id => ${result[0].id}`)
console.log(`data => ${result[0].data}`)
```

## publicメソッド

- `updateField(path: string, field: firestoreField, mergeFlg: boolean = false): Promise<DocumentReference>`  
  Firestoreのドキュメントのフィールドを更新します。ドキュメントが存在しない場合は新規作成します。

- `readDocument(path: string, whereAnd: firestoreWhere[] = [], onlyOne: boolean = false): Promise<docReturnType | docReturnType[] | null>`  
  Firestoreのドキュメントを読み込み、そのデータを返します。

- `deleteDocument(path: string)`  
  Firestoreのドキュメントを削除します。

- `generateUUID(): string`  
  UUIDを生成します。
