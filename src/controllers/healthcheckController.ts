import { Request, Response } from 'express';

export const check = (req: Request, res: Response): Response => {
    return res.status(200).json({ status: 'OK' });
};
