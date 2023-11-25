import { WhereFilterOp } from 'firebase/firestore';
export type firebaseConfigType = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
};
export type firestoreWhere = {
    key: string;
    operator: WhereFilterOp;
    value: any;
};
export type firestoreField = {
    [key: string]: any;
};
export type docReturnType = {
    id: string;
    data: unknown;
};
