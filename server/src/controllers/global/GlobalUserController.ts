import { Controller, Get, Post, Put, Delete, Middleware } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";
import { CommentModel, CommentInterface } from "../../models/Comment";
import { PostModel, PostInterface } from "../../models/Post";
import { isLoggedIn } from "../../middlewares/LoggedIn";
import { convertToAMPM } from "../../utils/helperFunctions";
import { UserInterface } from "../../models/login";
import { UserModel } from "../../models/User";

@Controller("user")
export class GlobalUserController {
    
    @Get("getAllOtherUsers")
    @Middleware([isLoggedIn])
    public async getAllOtherUsers(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;

        try{
            const usersFound: UserInterface[] = await UserModel.findAllOtherUsers(username) as UserInterface[];
            
            if(usersFound.length === 0) {
                return res.status(STATUS.NOT_FOUND).json({
                    message: "No other users exist.",
                    code: "GUC001"
                });
            }

            const allUsers = usersFound.map(user => {
                return {
                    username: user.USERNAME
                }
            });
            
            return res.status(STATUS.OK).json({allUsers: allUsers});

        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }

}