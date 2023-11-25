import { WhereFilterOp } from 'firebase/firestore'

export type firebaseConfigType = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

export type FirestoreStructure = {
  collection: string
  document?: string
  whereAnd?: { key: string; operator: WhereFilterOp; value: any }[]
  field?: { [key: string]: any }
  next?: FirestoreStructure
}
