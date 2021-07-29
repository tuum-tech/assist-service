import { NextFunction, Request, Response } from 'express';
import config from '../../config/config';

const serverHealthCheck = (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
        _status: 'OK',
        message: 'pong'
    });
};

export default { serverHealthCheck };
