// Firebase Storage — imported only by the upload forms so the SDK stays out of
// the shared bundle.
import { getStorage } from 'firebase/storage';
import app from './firebase';

export const storage = getStorage(app);
