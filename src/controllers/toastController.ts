import { Request, Response } from 'express'

export const toast = async (req: Request, res: Response): Promise<Response> => {
    return res.status(201).send();
}
