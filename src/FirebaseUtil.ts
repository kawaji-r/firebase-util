// src/index.ts
import { readdirSync } from 'fs';
import { resolve } from 'path';

const FirebaseUtil = (): void => {
    const currentDir = resolve('.');
    const files = readdirSync(currentDir);
    console.log('Files and directories in current directory:', files);
}

export default FirebaseUtil
