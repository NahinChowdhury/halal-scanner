import { Controller, Get, Post, Put, Delete, Middleware } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";
import { convertToAMPM } from "../../utils/helperFunctions";
import { isLoggedIn } from "../../middlewares/LoggedIn";
import { FriendsInterface, FriendsModel } from "../../models/Friends";

@Controller("friends")
export class FriendsController {
    
    @Get("")
    @Middleware([isLoggedIn])
    public async getUserFriends(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;

        try{
            const friendsFound: FriendsInterface[] = await FriendsModel.getUserFriends(username) as FriendsInterface[];

            if(friendsFound.length === 0) {
                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Friends not found. Please log in again.",
                    code: "UFC001"
                });

            }

            const friends = friendsFound.map( friend => {
                return {
                    friendId: friend.FRIEND_ID === username ? friend.USER_ID : friend.FRIEND_ID,
                    createdAt: convertToAMPM(new Date(friend.CREATED_AT))  // setting time to AM/PM
                }
            })

            return res.status(STATUS.OK).json({friends: friends});

        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }

    @Post("add/:friendId")
    @Middleware([isLoggedIn])
    public async addFriend(req: Request, res: Response): Promise<Response> {
        // might never need this since friend row is added to db using db triggers when friend request is accepted
        const username = req.session?.username;
		const {friendId} = req.params;

        try{
            const friendAdded: FriendsInterface = await FriendsModel.addUserFriend(username, friendId) as FriendsInterface;

            if(friendAdded === null) {
                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Friend could not be added. Please try again.",
                    code: "UFC002"
                });
            }

        }catch(e){
			return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
				message: e.message,
                code: e.code
            });
        }
		return res.status(STATUS.OK).json({message: "Friend has been added."});
    }

	@Delete("remove/:friendId")
    @Middleware([isLoggedIn])
    public async removeFriend(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;
		const {friendId} = req.params;

        try{
            const friendRemoved: FriendsInterface = await FriendsModel.deleteUserFriend(username, friendId) as FriendsInterface;

            if(friendRemoved === null) {
                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Friend could not be removed. Please try again.",
                    code: "UFC003"
                });
            }
			
        }catch(e){
			return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
				message: e.message,
                code: e.code
            });
        }
		return res.status(STATUS.OK).json({message: "Friend has been removed."});
    }
}