import { Request, Response } from 'express'

export const check = async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json({ state: 'healthy' }).send();
}