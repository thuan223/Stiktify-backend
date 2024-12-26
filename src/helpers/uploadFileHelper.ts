import { Request, Response, NextFunction } from 'express';
import { storage } from '../config/FirebaseConfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import multer from 'multer';

// Cấu hình multer để lưu trữ tệp trong bộ nhớ
const upload = multer({ storage: multer.memoryStorage() });

// Middleware để xử lý upload tệp
export const uploadMiddleware = upload.single('file');

// Hàm xử lý upload tệp lên Firebase Storage
export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
  folder: string,
): Promise<any> => {
  try {
    if (!req.file) {
      res.status(400).json({
        message: 'No file uploaded. (File must be jpg, jpeg, png, gif)',
      });
      return;
    }

    const uniqueFileName = `${Date.now()}_${req.file.originalname}`;
    const storageRef = ref(storage, `${folder}/${uniqueFileName}`);
    const metaData = { contentType: req.file.mimetype };

    const snapshot = await uploadBytes(storageRef, req.file.buffer, metaData);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      status: 200,
      data: {
        message: 'File uploaded successfully to Firebase Storage',
        downloadURL: downloadURL,
      },
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    next(error);
  }
};
