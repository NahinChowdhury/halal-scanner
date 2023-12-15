import { FriendsInterface, FriendsModel } from './Friends';
import { client } from './index';

export interface FriendRequestInterface {
    REQUEST_ID?: string;
    SENDER_ID?: string;
    RECEIVER_ID?: string;
    CREATED_AT?: Date;
    UPDATED_AT?: Date;
}

export class FriendRequestModel implements FriendRequestInterface {
    REQUEST_ID?: string;
    SENDER_ID?: string;
    RECEIVER_ID?: string;
    CREATED_AT?: Date;
    UPDATED_AT?: Date;

    constructor(user: FriendRequestInterface) {
        Object.assign(this, user);
    }

    static getUserFriendRequestsReceived(receiverId: string): Promise<FriendRequestInterface[]> {

        const query = `Select * FROM public."FriendRequests" u WHERE u."RECEIVER_ID" = $1 AND u."STATUS" = 'pending';`
        const params = [receiverId]

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    resolve(
                        data.map( d=> {
                            return new FriendRequestModel(d);
                        })
                    );
                })
                .catch(err => reject(err));
        })
    }

    static getUserFriendRequestsSent(senderId: string): Promise<FriendRequestInterface[]> {

        const query = `Select * FROM public."FriendRequests" u WHERE u."SENDER_ID" = $1 AND u."STATUS" = 'pending';`
        const params = [senderId]

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    resolve(
                        data.map( d=> {
                            return new FriendRequestModel(d);
                        })
                    );
                })
                .catch(err => reject(err));
        })
    }

	static findPendingFriendRequest(senderId: string, receiverId: string): Promise<FriendRequestInterface | null> {

        const query = `Select * FROM public."FriendRequests" u 
						WHERE (u."SENDER_ID" IN ($1, $2) AND u."RECEIVER_ID" IN ($1, $2) AND u."SENDER_ID" != u."RECEIVER_ID") 
						AND u."STATUS" = 'pending' 
						ORDER BY u."UPDATED_AT" DESC;`
        const params = [senderId, receiverId]

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(new FriendRequestModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }

    static async sendFriendRequest(senderId: string, receiverId: string): Promise<FriendRequestInterface | null> {

		const [friendExists, friendRequestExists] = await Promise.all([FriendsModel.getOneFriend(senderId, receiverId), this.findPendingFriendRequest(senderId, receiverId)]);
		
        // making sure friend does not exist before attempting to send request
        if(friendExists !== null){
            return new Promise<FriendRequestInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "This person is already your friend. Cannot send a friend request",
                        code:"MFR001"
                    })
            })
        }

		// making sure friend request does not exist before attempting to send request
		if(friendRequestExists !== null){
			return new Promise<FriendRequestInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "Cannot send a friend request because a pending request already exists.",
                        code:"MFR002"
                    })
            })
		}

        const query = `INSERT INTO public."FriendRequests" ("SENDER_ID" , "RECEIVER_ID") VALUES ($1, $2) returning *;`
        const params = [senderId, receiverId]

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(new FriendRequestModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }

	static async updateFriendRequest(receiverId: string, requestId: string, status: 'pending' | 'rejected' | 'accepted'): Promise<FriendRequestInterface | null> {
		// users can accept and reject friend requests using this single model

        const query = `UPDATE public."FriendRequests" SET "STATUS" = $1, "UPDATED_AT" = now() WHERE "RECEIVER_ID" = $2 AND "REQUEST_ID" = $3 returning *;`
        const params = [status, receiverId, requestId]

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(new FriendRequestModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }

    static async cancelFriendRequest(senderId: string, requestId: string): Promise<FriendRequestInterface | null> {
		// users can accept and reject friend requests using this single model

        const query = `UPDATE public."FriendRequests" SET "STATUS" = 'calcelled', "UPDATED_AT" = now() WHERE "SENDER_ID" = $1 AND "REQUEST_ID" = $2 returning *;`
        const params = [senderId, requestId]

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(new FriendRequestModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }

}