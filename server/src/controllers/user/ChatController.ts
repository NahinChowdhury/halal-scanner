import { Controller, Get, Post, Put, Delete, Middleware } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";
import { convertToAMPM } from "../../utils/helperFunctions";
import { isLoggedIn } from "../../middlewares/LoggedIn";
import { ChatMessageInterface, ChatModel, ChatRoomInterface } from "../../models/Chat";
import { UserInterface } from "../../models/login";
import { UserModel } from "../../models/User";

@Controller("chat")
export class ChatController {
    
    @Post("findChat")
    @Middleware([isLoggedIn])
    public async findUserChat(req: Request, res: Response): Promise<Response> {
        
        const username = req.session?.username;
        const {otherMember} = req.body;
        console.log('otherMember')
        console.log(otherMember)

        try{
            const chatRoomFound: ChatRoomInterface = await ChatModel.findChatFromMembers(username, otherMember) as ChatRoomInterface;
            
            if(chatRoomFound === null) {

                // if chatRoom not found, then try catch with trying to create a room for them.
                try{
                    const chatRoomCreated: ChatRoomInterface = await ChatModel.createChatRoom(username, otherMember) as ChatRoomInterface;

                    if(chatRoomCreated === null) {
                        return res.status(STATUS.NOT_FOUND).json({
                            message: "Could not create a chat with User: " + otherMember,
                            code: "UCC001"
                        });
                    }

                    console.log("chatRoomCreated")
                    console.log(chatRoomCreated)

                    const chatRoom = { 
                        roomId: chatRoomCreated.ROOM_ID,
                        existed: false
                    }
                    
                    return res.status(STATUS.OK).json({chatRoom: chatRoom});
                    
                }catch(e){
                    throw new Error(e);
                }
            }


            console.log("chatRoomFound")
            console.log(chatRoomFound)
            const chatRoom = {
                roomId: chatRoomFound.ROOM_ID,
                existed: true
            }


            return res.status(STATUS.OK).json({chatRoom: chatRoom});
            
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }

    @Get("getAllUsersAndChats")
    @Middleware([isLoggedIn])
    public async getAllUsersAndChats(req: Request, res: Response): Promise<Response> {
        
        const username = req.session?.username;
        const {chatId} = req.params;
        console.log('chatId')
        console.log(chatId)

        
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
                    username: user.USERNAME,
                    chatExists: false
                }
            });

            const chatRoomsandUsersFound: ChatRoomInterface[] = await ChatModel.findUserChats(username) as ChatRoomInterface[];

            // The code below checks if the usernames fetched in chatRoomsFound match the username in allUsers
            // If they match, then there already exists a chat for this user
            // so we set its chatExists to true
            const allUsersAndChats = allUsers.map(item => {
                if (chatRoomsandUsersFound.map(user => user.OTHER_MEMBER).includes(item.username)) {
                  return {...item, chatExists: true};
                }
                return item;
            });

            console.log("allUsersAndChats")
            console.log(allUsersAndChats)
              
            
            return res.status(STATUS.OK).json({allUsersAndChats: allUsersAndChats});
            
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }
    
    @Get(":chatId/hasAccess")
    @Middleware([isLoggedIn])
    public async userHasAccess(req: Request, res: Response): Promise<Response> {
        
        const username = req.session?.username;
        const {chatId} = req.params;
        console.log('chatId')
        console.log(chatId)

        try{
            const chatRoomFound: ChatRoomInterface = await ChatModel.checkUserHasAccess(username, chatId) as ChatRoomInterface;
            
            if(chatRoomFound === null) {

                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "User does not have access to this chat.",
                    code: "UCC002"
                });

            }


            console.log("chatRoomFound")
            console.log(chatRoomFound)
            const hasAccess = {
                hasAccess: true
            }


            return res.status(STATUS.OK).json({hasAccess: hasAccess});
            
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }
    
    @Get(":chatId/getMessages")
    @Middleware([isLoggedIn])
    public async getMessage(req: Request, res: Response): Promise<Response> {
        
        const username = req.session?.username;
        const {chatId} = req.params;
        console.log('get chatId')
        console.log(chatId)

        try{
            // making sure user has permission to send messages to the chat
            const messagesFound: ChatMessageInterface[] = await ChatModel.getMessages(username, chatId) as ChatMessageInterface[];
             
            if(messagesFound.length === 0) {
                return res.status(STATUS.OK).json({messages: messagesFound});
            }
            
            console.log("messagesFound");
            console.log(messagesFound);

            const messages = messagesFound.map( message => {
                return {
                    messageId: message.MESSAGE_ID,
                    sender: message.SENDER,
                    details: message.DETAILS,
                    read: message.READ,
                    createdAtString: convertToAMPM( new Date(message.CREATED_AT)),
                    updatedAtString: convertToAMPM( new Date(message.UPDATED_AT)),
                    createdAt: message.CREATED_AT,
                    updatedAt: message.UPDATED_AT
                }
            })

            console.log('get messages');
            console.log(messages);

            return res.status(STATUS.OK).json({messages: messages});
            
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }

    @Post(":chatId/createMessage")
    @Middleware([isLoggedIn])
    public async createMessage(req: Request, res: Response): Promise<Response> {
        
        const username = req.session?.username;
        const {chatId} = req.params;
        const {details} = req.body;
        console.log('chatId')
        console.log(chatId)

        try{
            // making sure user has permission to send messages to the chat
            const messageCreated: ChatMessageInterface = await ChatModel.createMessage(username, chatId, details) as ChatMessageInterface;
            
            if(messageCreated === null) {

                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Message could not be sent. Please try again.",
                    code: "UCC003"
                });
            }

            console.log("messageCreated");
            console.log(messageCreated);

            const messageCreatedRes = {
                messageId: messageCreated.MESSAGE_ID,
                sender: messageCreated.SENDER,
                details: messageCreated.DETAILS,
                read: messageCreated.READ,
                createdAtString: convertToAMPM( new Date(messageCreated.CREATED_AT)),
                updatedAtString: convertToAMPM( new Date(messageCreated.UPDATED_AT)),
                createdAt: messageCreated.CREATED_AT,
                updatedAt: messageCreated.UPDATED_AT
            }

            return res.status(STATUS.OK).json({messageCreated: messageCreatedRes});
            
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }
    
    @Post(":chatId/deleteMessage")
    @Middleware([isLoggedIn])
    public async deleteMessage(req: Request, res: Response): Promise<Response> {
        
        const username = req.session?.username;
        const {chatId} = req.params;
        const {messageId} = req.body;
        console.log('chatId')
        console.log(chatId)

        try{
            // making sure user has permission to send messages to the chat
            const messageDeleted: ChatMessageInterface = await ChatModel.deleteMessage(username, chatId, messageId) as ChatMessageInterface;
            
            if(messageDeleted === null) {

                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Message could not be deleted. Please try again.",
                    code: "UCC004"
                });
            }

            console.log("messageDeleted");
            console.log(messageDeleted);

            const messageDeletedRes = {
                messageId: messageDeleted.MESSAGE_ID,
                sender: messageDeleted.SENDER,
                details: messageDeleted.DETAILS,
                read: messageDeleted.READ,
                createdAtString: convertToAMPM( new Date(messageDeleted.CREATED_AT)),
                updatedAtString: convertToAMPM( new Date(messageDeleted.UPDATED_AT)),
                createdAt: messageDeleted.CREATED_AT,
                updatedAt: messageDeleted.UPDATED_AT
            }

            return res.status(STATUS.OK).json({messageDeleted: messageDeletedRes});
            
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }

    @Put(":chatId/editMessage")
    @Middleware([isLoggedIn])
    public async editMessage(req: Request, res: Response): Promise<Response> {
        
        const username = req.session?.username;
        const {chatId} = req.params;
        const {messageId, messageDetails} = req.body;
        console.log('chatId')
        console.log(chatId)

        try{
            // making sure user has permission to send messages to the chat
            const messageEdited: ChatMessageInterface = await ChatModel.editMessage(username, chatId, messageId, messageDetails) as ChatMessageInterface;
            
            if(messageEdited === null) {

                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Message could not be edited. Please try again.",
                    code: "UCC005"
                });
            }

            console.log("messageEdited");
            console.log(messageEdited);

            const messageEditedRes = {
                messageId: messageEdited.MESSAGE_ID,
                sender: messageEdited.SENDER,
                details: messageEdited.DETAILS,
                read: messageEdited.READ,
                createdAtString: convertToAMPM( new Date(messageEdited.CREATED_AT)),
                updatedAtString: convertToAMPM( new Date(messageEdited.UPDATED_AT)),
                createdAt: messageEdited.CREATED_AT,
                updatedAt: messageEdited.UPDATED_AT
            }

            return res.status(STATUS.OK).json({messageEdited: messageEditedRes});
            
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }
}