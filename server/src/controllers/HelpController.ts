import { Controller, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { LoginModel } from "../models/login";
import { StatusCodes as STATUS}  from "http-status-codes";

@Controller("help")
export class HelpController {
    
    @Get("isLoggedIn")
    public async isLoggedIn(req: Request, res: Response): Promise<Response> {
        
        if(req.session?.username){
            return res.status(STATUS.OK).json({username: req.session?.username});
        }

        return res.status(STATUS.INTERNAL_SERVER_ERROR).json(null);
    }


    @Post("login")
    public async login(req: Request, res: Response){
        const {username, password} = req.body;

        let result = {userExists: false};

        if(req.session?.username === username){
            result.userExists = true;
            req.session.username = username;
            return res.status(STATUS.OK).json(result);
        }
        
        const userFound = await LoginModel.verifyUser(username, password);


        if(userFound?.PASSWORD === password) {
            result.userExists = true;
            req.session.username = username;
            return res.status(STATUS.OK).json(result);
        }

        return res.status(STATUS.NOT_FOUND).json({
            message: "Could not verify user. Please try again",
            code: "HC001"
        })
    }
  
    @Post("signup")
    public async singup(req: Request, res: Response){

        const {username, password} = req.body;

        try{
            const userCreated = await LoginModel.createNewUser(username, password);

            if(userCreated === null){
                return res.status(STATUS.BAD_REQUEST).json({
                    message: "Could not create user. Please try again",
                    code: "HC002"
                });
            }

            if( userCreated?.USERNAME == username && userCreated?.PASSWORD === password ){
                req.session.username = username;
                return res.status(STATUS.OK).json({username: userCreated?.USERNAME , password: userCreated?.PASSWORD});
            }

        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }

        return res.status(STATUS.CONFLICT).json({
            message: "A user was created but not with the credentials you requested. Please try to login before signing up again.",
            code: "HC003"
        });

    }

    @Get("logout")
    public async logout(req: Request, res: Response){

        try{
            delete req.session.username;
            return res.status(STATUS.OK).json("User has been logged out");
        }catch{
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Could not logout. Please refresh the page and try again.",
                code: "HC004"
            })
        }

    }
}