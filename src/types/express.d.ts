import 'express';

declare global {
  namespace Express {
    interface Request {
      file?: {
        originalname: string;
        mimetype: string;
        buffer: Buffer;
      };
    }
  }
}
