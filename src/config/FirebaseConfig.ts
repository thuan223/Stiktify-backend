// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { deleteObject, getStorage, ref } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyD6vmq9CAy8vKxdjMBihWvoENkvgpvTgSs',
  authDomain: 'stiktify-bachend.firebaseapp.com',
  projectId: 'stiktify-bachend',
  storageBucket: 'stiktify-bachend.firebasestorage.app',
  messagingSenderId: '410858091011',
  appId: '1:410858091011:web:eb5d11e002a6d763f4d436',
  measurementId: 'G-Q5JPZ4WX4C',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Hàm deleteFile dùng để xóa một file khỏi Firebase Storage
 * @param {string} fileURL - URL của file cần xóa
 * @returns {Promise<void>}
 */

export const deleteFile = async (fileURL: string): Promise<void> => {
  try {
    const fileRef = ref(storage, fileURL);

    await deleteObject(fileRef);

  } catch (error) {
    throw error;
  }
};
