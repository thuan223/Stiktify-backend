import { storage } from '../config/FirebaseConfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export const uploadFile = async (file: Express.Multer.File, folder: string) => {
  try {
    if (!file) {
      return { status: 400, message: 'No file uploaded.' };
    }

    const uniqueFileName = `${Date.now()}_${file.originalname}`;
    const storageRef = ref(storage, `${folder}/${uniqueFileName}`);
    const metaData = { contentType: file.mimetype };

    // Upload lên Firebase
    const snapshot = await uploadBytes(storageRef, file.buffer, metaData);
    console.log('✅ Upload thành công!');

    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('🔗 File URL:', downloadURL);

    return downloadURL
  } catch (error) {
    console.error('❌ Lỗi upload:', error);
    throw new Error('Upload failed');
  }
};