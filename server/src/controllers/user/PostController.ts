import { Controller, Get, Post, Put, Delete, Middleware } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";
import { convertToAMPM } from "../../utils/helperFunctions";
import { isLoggedIn } from "../../middlewares/LoggedIn";
import { PostModel, PostInterface } from "../../models/Post";

@Controller("posts")
export class PostController {
    
    @Get("")
    @Middleware([isLoggedIn])
    public async getUserPosts(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;

        try{
            const postsFound: PostInterface[] = await PostModel.getUserPost(username) as PostInterface[];

            if(postsFound.length === 0) {
                return res.status(STATUS.NOT_FOUND).json({
                    message: "User has no posts.",
                    code: "UPC001"
                });
            }

            const userPosts = postsFound.map( post => {

                return {
                    postId: post.POST_ID,
                    title: post.TITLE,
                    details: post.DETAILS,
                    updatedAt: convertToAMPM(new Date(post.UPDATED_AT))  // setting time to AM/PM
                }
            })


            return res.status(STATUS.OK).json({userPosts: userPosts});
            
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }

    @Put(":id")
    @Middleware([isLoggedIn])
    public async updateUserPost(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;
        const {id} = req.params;
        const {title, details} = req.body;

        try{
            const postCreated: PostInterface = await PostModel.updateUserPost(username, id, title, details) as PostInterface;

            if(postCreated === null) {
                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Post could not be updated. Please try again.",
                    code: "UPC002"
                });

            }
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }

        return res.status(STATUS.OK).json({message: "Post has been updated."});
    }
    
    @Post("")
    @Middleware([isLoggedIn])
    public async createUserPost(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;
        const {title, details} = req.body;

        try{
            const postCreated: PostInterface = await PostModel.createUserPost(username, title, details) as PostInterface;

            if(postCreated === null) {
                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Post could not be created. Please try again.",
                    code: "UPC003"
                });

            }
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }

        return res.status(STATUS.OK).json({message: "Post has been created."});
    }

    @Delete(":id")
    @Middleware([isLoggedIn])
    public async deleteUserPost(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;
        const {id} = req.params;

        try{
            const postDeleted: PostInterface = await PostModel.deleteUserPost(id, username) as PostInterface;

            if(postDeleted === null) {
                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Post could not be deleted. Please try again.",
                    code: "UPC004"
                });

            }
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }

        return res.status(STATUS.OK).json({message: "Post has been deleted."});
    }
}