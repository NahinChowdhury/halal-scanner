import { Controller, Get, Post, Put, Delete, Middleware } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";
import { CommentModel, CommentInterface } from "../../models/Comment";
import { PostModel, PostInterface } from "../../models/Post";
import { isLoggedIn } from "../../middlewares/LoggedIn";
import { convertToAMPM } from "../../utils/helperFunctions";

@Controller("posts")
export class GlobalPostController {
    
    @Get("")
    @Middleware([isLoggedIn])
    public async getGlobalPosts(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;

        try{
            const postsFound: PostInterface[] = await PostModel.getGlobalPosts(username) as PostInterface[];
            
            if(postsFound.length === 0) {
                return res.status(STATUS.NOT_FOUND).json({
                    message: "User has no posts.",
                    code: "GPC001"
                });
            }
            console.log("GOT ALL POSTS")

            const globalPosts = postsFound.map( post => {

                return {
                    postId: post.POST_ID,
                    username: post.USERNAME,
                    title: post.TITLE,
                    details: post.DETAILS,
                    updatedAt: convertToAMPM(new Date(post.UPDATED_AT))  // setting time to AM/PM
                }
            })


            return res.status(STATUS.OK).json({globalPosts: globalPosts});

        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }

    @Get(":postId/comments")
    @Middleware([isLoggedIn])
    public async getPostComments(req: Request, res: Response): Promise<Response> {
        const { postId } = req.params;

        try{
            const commentsFound: CommentInterface[] = await CommentModel.getAllPostComment(postId) as CommentInterface[];

            if(commentsFound.length === 0) {
                return res.status(STATUS.NOT_FOUND).json({
                    message: "This post has no comments.",
                    code: "GPC002"
                });
            }

            const postComments = commentsFound.map( comment => {
                return {
                    commentId: comment.COMMENT_ID,
                    postId: comment.POST_ID,
                    commentedBy: comment.COMMENTED_BY,
                    details: comment.DETAILS,
                    updatedAt: convertToAMPM(new Date(comment.UPDATED_AT))  // setting time to AM/PM
                }
            })


            return res.status(STATUS.OK).json({postComments: postComments});

        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }

    @Post(":postId/comments")
    @Middleware([isLoggedIn])
    public async createPostComment(req: Request, res: Response): Promise<Response> {
        
        const { postId } = req.params;
        const username = req.session?.username;
        const { parentCommentId, details } = req.body;

        try{
            const commentCreated: CommentInterface = await CommentModel.createPostComment(postId, parentCommentId, username, details, ) as CommentInterface;
            
            if(commentCreated === null) {
                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Comment could not be created. Please try again.",
                    code: "UPC003"
                });
                
            }
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }

        return res.status(STATUS.OK).json({message: "Comment has been created."});
    }

    @Put(":postId/comments")
    @Middleware([isLoggedIn])
    public async updatePostComment(req: Request, res: Response): Promise<Response> {
        
        const { postId } = req.params;
        const username = req.session?.username;
        const { commentId, details } = req.body;

        try{

            const commentUpdated: CommentInterface = await CommentModel.updatePostComment(commentId, postId, username, details) as CommentInterface;
            
            if(commentUpdated === null) {
                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Comment could not be updated. Please try again.",
                    code: "UPC004"
                });
                
            }
        }catch(e){
            console.log(e);
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code,
            });
        }

        return res.status(STATUS.OK).json({message: "Comment has been updated."});
    }

    @Delete(":postId/comments/:commentId")
    @Middleware([isLoggedIn])
    public async deleteUserComment(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;
        const { postId, commentId } = req.params;

        try{
            const commentDeleted: CommentInterface = await CommentModel.deletePostComment(commentId, postId, username) as CommentInterface;

            if(commentDeleted === null) {
                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Comment could not be deleted. Please try again.",
                    code: "UPC004"
                });

            }
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }

        return res.status(STATUS.OK).json({message: "Comment has been deleted."});
    }


    @Get(":postId/comments/all")
    @Middleware([isLoggedIn])
    public async getAllPostComments(req: Request, res: Response): Promise<Response> {
        const { postId } = req.params;

        try{
            const commentsFound: CommentInterface[] = await CommentModel.getPostComment(postId) as CommentInterface[];

            if(commentsFound.length === 0) {
                return res.status(STATUS.NOT_FOUND).json({
                    message: "This post has no comments.",
                    code: "GPC005"
                });
            }
            const topLevelComments = commentsFound.filter(comment => comment.PARENT_COMMENT_ID === null);


            const postComments = await Promise.all( // need promise because await doesnt work on map function
                topLevelComments.map( comment => {
                    return {
                        commentId: comment.COMMENT_ID,
                        postId: comment.POST_ID,
                        commentedBy: comment.COMMENTED_BY,
                        details: comment.DETAILS,
                        updatedAt: convertToAMPM(new Date(comment.UPDATED_AT)),  // setting time to AM/PM
                        children: getChildrenComments(comment.COMMENT_ID)
                    }
                })
            )
            return res.status(STATUS.OK).json({postComments: postComments});

        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }

    }
    
    @Get(":postId/comments/:commentId")
    @Middleware([isLoggedIn])
    public async getAllCommentReplies(req: Request, res: Response): Promise<Response> {
        const { postId, commentId } = req.params;

        try{
            const repliesFound: CommentInterface[] = await CommentModel.getCommentReplies(commentId) as CommentInterface[];

            if(repliesFound.length === 0) {
                return res.status(STATUS.NOT_FOUND).json({
                    message: "This comments has no replies.",
                    code: "GPC006"
                });
            }

            const commentReplies = await Promise.all( // need promise because await doesnt work on map function
                repliesFound.map( async (reply) => {
                    return {
                        commentId: reply.COMMENT_ID,
                        postId: reply.POST_ID,
                        commentedBy: reply.COMMENTED_BY,
                        details: reply.DETAILS,
                        updatedAt: convertToAMPM(new Date(reply.UPDATED_AT)),  // setting time to AM/PM
                    }
                })
            )

            return res.status(STATUS.OK).json({commentReplies: commentReplies});

        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }
}


// This is a recursive function
async function getChildrenComments(parentCommentId: string): Promise<any>{
    // I will treat commentsFound as the result we get from db
    // console.log("I am in getChildren function")
    // getting the comment with matching parentCommentId
    const commentsFound: CommentInterface[] = await CommentModel.getCommentReplies(parentCommentId) as CommentInterface[];

        console.log("Found matching children")
        console.log(commentsFound)

    if(commentsFound.length === 0){
        // console.log("RETURNING EMPTY STRING")
        return [];
    }

    return await commentsFound.map( async (comment) => {
        return {
            commentId: comment.COMMENT_ID,
            postId: comment.POST_ID,
            commentedBy: comment.COMMENTED_BY,
            details: comment.DETAILS,
            updatedAt: convertToAMPM(new Date(comment.UPDATED_AT)),  // setting time to AM/PM
            children: await getChildrenComments(comment.COMMENT_ID)
        }
    })
}