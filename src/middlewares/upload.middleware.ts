import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

@Injectable()
export class UploadMiddleware implements NestMiddleware {
  private multerInstance = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      // Kiểm tra loại file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('File type not allowed'), false);
      }
      cb(null, true);
    },
  }).single('file'); // Đặt tên trường input là `file`

  use(req: Request, res: Response, next: NextFunction) {
    this.multerInstance(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          message: error.message,
        });
      }
      next();
    });
  }
}
