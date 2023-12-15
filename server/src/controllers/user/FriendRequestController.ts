import { Controller, Get, Post, Put, Delete, Middleware } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";
import { convertToAMPM } from "../../utils/helperFunctions";
import { isLoggedIn } from "../../middlewares/LoggedIn";
import { FriendRequestInterface, FriendRequestModel } from "../../models/FriendRequest";
import { UserInterface } from "../../models/login";
import { UserModel } from "../../models/User";
import { FriendsInterface, FriendsModel } from "../../models/Friends";

@Controller("friendRequests")
export class FriendRequestController {
    
    @Get("")
    @Middleware([isLoggedIn])
    public async getFriendRequestsReceived(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;

        try{
            const friendRequestsFound: FriendRequestInterface[] = await FriendRequestModel.getUserFriendRequestsReceived(username) as FriendRequestInterface[];

            if(friendRequestsFound.length === 0) {
                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Friend requests not found. Please log in again.",
                    code: "UFRC001"
                });

            }

            const requests = friendRequestsFound.map( request => {
                return {
                    requestId: request.REQUEST_ID,
                    senderId: request.SENDER_ID,
                    createdAt: convertToAMPM(new Date(request.CREATED_AT)),  // setting time to AM/PM
                    updatedAt: convertToAMPM(new Date(request.CREATED_AT))  // setting time to AM/PM
                }
            })

            return res.status(STATUS.OK).json({requests: requests});

        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }

    // fetch requests sent by user
    @Get("sent")
    @Middleware([isLoggedIn])
    public async getFriendRequestsSent(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;

        try{
            const friendRequestsFound: FriendRequestInterface[] = await FriendRequestModel.getUserFriendRequestsSent(username) as FriendRequestInterface[];

            if(friendRequestsFound.length === 0) {
                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Friend requests not found. Please log in again.",
                    code: "UFRC002"
                });

            }

            const requests = friendRequestsFound.map( request => {
                return {
                    requestId: request.REQUEST_ID,
                    receiverId: request.RECEIVER_ID,
                    createdAt: convertToAMPM(new Date(request.CREATED_AT)),  // setting time to AM/PM
                    updatedAt: convertToAMPM(new Date(request.CREATED_AT))  // setting time to AM/PM
                }
            })

            return res.status(STATUS.OK).json({requests: requests});

        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }
    
    // fetch all users and whether 
    @Get("getAllUsersAndFriendshipStatus")
    @Middleware([isLoggedIn])
    public async getAllUsersAndFriendshipStatus(req: Request, res: Response): Promise<Response> {
        
        const username = req.session?.username;
        
        try{

            const usersFound: UserInterface[] = await UserModel.findAllOtherUsers(username) as UserInterface[];
            
            if(usersFound.length === 0) {
                return res.status(STATUS.NOT_FOUND).json({
                    message: "No other users exist.",
                    code: "UFRC007"
                });
            }

            const allUsers = usersFound.map(user => {
                return {
                    username: user.USERNAME,
                    requestSent: false,
                    requestReceived: false,
                    friends: false
                }
            });

            const friendRequestsSent: FriendRequestInterface[] = await FriendRequestModel.getUserFriendRequestsSent(username) as FriendRequestInterface[];
            const friendRequestsReceived: FriendRequestInterface[] = await FriendRequestModel.getUserFriendRequestsReceived(username) as FriendRequestInterface[];
            const friends: FriendsInterface[] = await FriendsModel.getUserFriends(username) as FriendsInterface[];

            const allUsersAndStatus = allUsers.map(item => {
                if (friendRequestsSent.map(user => user.RECEIVER_ID).includes(item.username)) {
                    return {...item, requestSent: true};
                }
                if (friendRequestsReceived.map(user => user.SENDER_ID).includes(item.username)) {
                    return {...item, requestReceived: true};
                }
                if (friends.map(user => user.FRIEND_ID === username ? user.USER_ID : user.FRIEND_ID).includes(item.username)) {
                    return {...item, friends: true};
                }
                return item;
            });

            return res.status(STATUS.OK).json({allUsersAndStatus: allUsersAndStatus});
            
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }

    // send/create friend requests
    @Post("send")
    @Middleware([isLoggedIn])
    public async sendFriendRequest(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;

        try{
            const {receiverId} = req.body;
            const friendRequestsSent: FriendRequestInterface[] = await FriendRequestModel.sendFriendRequest(username, receiverId) as FriendRequestInterface[];

            if(friendRequestsSent.length === 0) {
                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Friend request could not be sent. Please try again.",
                    code: "UFRC003"
                });

            }

            return res.status(STATUS.OK).json({message: "Friend request sent."});

        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }

    // cancel sent friend request
    @Post("cancel/:requestId")
    @Middleware([isLoggedIn])
    public async removeFriendRequest(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;

        try{
            const {requestId} = req.params;
            const friendRequestsCancelled: FriendRequestInterface[] = await FriendRequestModel.cancelFriendRequest(username, requestId) as FriendRequestInterface[];

            if(friendRequestsCancelled.length === 0) {
                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Friend request could not be cancelled. Please try again.",
                    code: "UFRC004"
                });

            }


            return res.status(STATUS.OK).json({message: "Friend request cancelled."});

        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }
    
    // accept friend request - pass request id
    @Post("accept/:requestId")
    @Middleware([isLoggedIn])
    public async acceptFriendRequest(req: Request, res: Response): Promise<Response> {

        try{
            const {requestId} = req.params;
            const {receiverId} = req.body;
            const friendRequestsAccepted: FriendRequestInterface[] = await FriendRequestModel.updateFriendRequest(receiverId, requestId, 'accepted') as FriendRequestInterface[];

            if(friendRequestsAccepted.length === 0) {
                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Friend request could not be accepted. Please try again.",
                    code: "UFRC005"
                });

            }

            return res.status(STATUS.OK).json({message: "Friend request accepted."});

        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }

    // reject friend request - pass request id
    @Post("reject/:requestId")
    @Middleware([isLoggedIn])
    public async rejectFriendRequest(req: Request, res: Response): Promise<Response> {

        try{
            const {requestId} = req.params;
            const {receiverId} = req.body;
            const friendRequestsRejected: FriendRequestInterface[] = await FriendRequestModel.updateFriendRequest(receiverId, requestId, 'rejected') as FriendRequestInterface[];

            if(friendRequestsRejected.length === 0) {
                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Friend request could not be rejected. Please try again.",
                    code: "UFRC006"
                });

            }

            return res.status(STATUS.OK).json({message: "Friend request rejected."});

        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }
}