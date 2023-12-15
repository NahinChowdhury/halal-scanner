import { client } from './index';
import { PostModel, PostInterface } from './Post';

export interface CommentInterface {
    COMMENT_ID?: string;
    POST_ID?: string;
    COMMENTED_BY?: string;
    DETAILS?: string;
    CREATED_AT?: Date;
    UPDATED_AT?: Date;
    PARENT_COMMENT_ID?: string;
}

export class CommentModel implements CommentInterface {
    COMMENT_ID?: string;
    POST_ID?: string;
    COMMENTED_BY?: string;
    DETAILS?: string;
    CREATED_AT?: Date;
    UPDATED_AT?: Date;
    PARENT_COMMENT_ID?: string;

    constructor(user: CommentInterface) {
        Object.assign(this, user);
    }

    static async getPostComment(postId: string): Promise<CommentInterface[] | null> {

        const query = `Select * FROM public."Comments" c 
                        WHERE "POST_ID" = $1
                        ORDER BY "UPDATED_AT" DESC;`;
        const params = [postId]

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    resolve(
                        data.map( d=> {
                            return new CommentModel(d);
                        })
                    );
                    
                })
                .catch(err => reject(err));
        })
    }
    
    static async getCommentReplies(commentId: string): Promise<CommentInterface[] | null> {

        const query = `Select * FROM public."Comments" c 
                        WHERE "PARENT_COMMENT_ID" = $1
                        ORDER BY "UPDATED_AT" DESC;`;
        const params = [commentId]

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    resolve(
                        data.map( d=> {
                            return new CommentModel(d);
                        })
                    );
                    
                })
                .catch(err => reject(err));
        })
    }
    
    static async getAllPostComment(postId: string): Promise<CommentInterface[] | null> {

        const query = `Select * FROM public."Comments" c 
                        WHERE "POST_ID" = $1 AND "PARENT_COMMENT_ID" IS NULL
                        ORDER BY "UPDATED_AT" DESC;`;
        const params = [postId]

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    resolve(
                        data.map( d=> {
                            return new CommentModel(d);
                        })
                    );
                    
                })
                .catch(err => reject(err));
        })
    }
    
    static async getOneComment(commentId: string): Promise<CommentInterface[] | null> {

        const query = `Select * FROM public."Comments" c 
                        WHERE "COMMENT_ID" = $1
                        ORDER BY "UPDATED_AT" DESC;`;
        const params = [commentId]

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    resolve(
                        data.map( d=> {
                            return new CommentModel(d);
                        })
                    );
                    
                })
                .catch(err => reject(err));
        })
    }
    
    static async updatePostComment(commentId: string, postId: string, commentedBy: string, details: string): Promise<CommentInterface | null> {
        
        // making sure comment does exist before attempting to update it
        const commentExists = await this.getOneComment(commentId);

        if(commentExists === null || commentExists.length === 0){
            return new Promise<CommentInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "The comment you are trying to update has been deleted.",
                        code:"MC001"    
                    })
            })
        }

        const query = `UPDATE public."Comments" c
                        SET "DETAILS" = $1, "UPDATED_AT" = now()
                        WHERE "COMMENT_ID" = $2 AND "POST_ID" = $3 AND "COMMENTED_BY" = $4
                        RETURNING *;`;
        const params = [details, commentId, postId, commentedBy];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    if(data.length > 0){
                        resolve(new CommentModel(data[0]));
                    }else{
                        resolve(null);
                    }
                    
                })
                .catch(err => reject(err));
        })
    }

    static async createPostComment(postId: string, parentCommentId: string, commentedBy: string, details: string): Promise<CommentInterface | null> {

        
        let query = "";
        let params: string[] = [];
        // making sure comment does exist before attempting to update it
        const postExists = await PostModel.getOnePost(postId);
            
        if(postExists === null || postExists.length === 0){
            return new Promise<PostInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "Cannot create a reply because the post has been deleted.",
                        code:"MC004"
                    })
            })
        }

        if(parentCommentId === ""){
            query = `INSERT INTO public."Comments" ("POST_ID", "COMMENTED_BY" , "DETAILS") VALUES ($1, $2, $3) returning *;`;
            params = [postId, commentedBy, details];
        }else{

            // making sure comment does exist before attempting to update it
            const parentCommentExists = await this.getOneComment(parentCommentId);
            
            if(parentCommentExists === null || parentCommentExists.length === 0){
                return new Promise<CommentInterface | null>((resolve, reject) => {
                    reject(
                        {
                            message: "Cannot create a reply because the parent comment has been deleted.",
                            code:"MC002"
                        })
                })
            }

            query = `INSERT INTO public."Comments" ("POST_ID", "COMMENTED_BY" , "DETAILS", "PARENT_COMMENT_ID") VALUES ($1, $2, $3, $4) returning *;`;
            params = [postId, commentedBy, details, parentCommentId];
            
        }

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    if(data.length > 0){
                        resolve(new CommentModel(data[0]));
                    }else{
                        resolve(null);
                    }
                    
                })
                .catch(err => reject(err));
        })
    }

    static async deletePostComment(commentId: string, postId: string, commentedBy: string): Promise<CommentInterface | null> {
        
        // making sure comment does exist before attempting to update it
        const commentExists = await this.getOneComment(commentId);

        if(commentExists === null || commentExists.length === 0){
            return new Promise<CommentInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "The comment you are trying to delete has already been deleted.",
                        code:"MC003"    
                    })
            })
        }

        const query = `DELETE FROM public."Comments" WHERE "COMMENT_ID" = $1 AND "POST_ID" = $2 AND "COMMENTED_BY" = $3 returning *;`;
        const params = [commentId, postId, commentedBy];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    if(data.length > 0){
                        resolve(new CommentModel(data[0]));
                    }else{
                        resolve(null);
                    }
                    
                })
                .catch(err => reject(err));
        })
    }

}