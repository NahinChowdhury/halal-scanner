import { Request, Response, NextFunction } from 'express';
import { StatusCodes as STATUS}  from "http-status-codes";

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    const username = req.session?.username;

    if(!username) {
            res.status(STATUS.UNAUTHORIZED).json({
            message: "User cannot be identified since session has expired. Please log in again.",
            code: "LI001"
        });
        return;
    }

    next();
}

