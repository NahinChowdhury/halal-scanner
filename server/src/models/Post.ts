import { client } from './index';

export interface PostInterface {
    POST_ID?: string;
    USERNAME?: string;
    TITLE?: string;
    DETAILS?: string;
    UPDATED_AT?: Date;
    CREATED_AT?: Date;
}

export class PostModel implements PostInterface {
    POST_ID?: string;
    USERNAME?: string;
    TITLE?: string;
    DETAILS?: string;
    UPDATED_AT?: Date;
    CREATED_AT?: Date;

    constructor(user: PostInterface) {
        Object.assign(this, user);
    }

    static async getUserPost(username: string): Promise<PostInterface[] | null> {

        const query = `Select * FROM public."Posts" u 
                        WHERE u."USERNAME" = $1
                        ORDER BY u."UPDATED_AT" DESC;`
        const params = [username];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    resolve(
                        data.map( d=> {
                            return new PostModel(d);
                        })
                    );
                    
                })
                .catch(err => reject(err));
        })
    }
    
    static async getGlobalPosts(username: string): Promise<PostInterface[] | null> {

        const query = `Select * FROM public."Posts" u 
                        WHERE "USERNAME" != $1
                        ORDER BY "UPDATED_AT" DESC;`
        const params = [username];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    resolve(
                        data.map( d=> {
                            return new PostModel(d);
                        })
                    );
                    
                })
                .catch(err => reject(err));
        })
    }

    static async getOnePost(postId: string): Promise<PostInterface[] | null> {

        const query = `Select * FROM public."Posts" u 
                        WHERE u."POST_ID" = $1
                        ORDER BY u."UPDATED_AT" DESC;`
        const params = [postId];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    resolve(
                        data.map( d=> {
                            return new PostModel(d);
                        })
                    );
                    
                })
                .catch(err => reject(err));
        })
    }

    static async updateUserPost(username: string, postId: string, title: string, details: string): Promise<PostInterface | null> {

        // making sure post does exist before attempting to update it
        const postExists = await this.getOnePost(postId);

        if(postExists === null || postExists.length === 0){
            return new Promise<PostInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "The post you are trying to update has been deleted.",
                        code:"MP001"    
                    })
            })
        }

        const query = `UPDATE public."Posts" p
                        SET "TITLE" = $1, "DETAILS" = $2, "UPDATED_AT" = now()
                        WHERE "POST_ID" = $3 AND "USERNAME" = $4
                        RETURNING *;`
        const params = [title, details, postId, username];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    if(data.length > 0){
                        resolve(new PostModel(data[0]));
                    }else{
                        resolve(null);
                    }
                    
                })
                .catch(err => reject(err));
        })
    }

    static async createUserPost(username: string, title: string, details: string): Promise<PostInterface | null> {

        // can check if user exists before creating but might be overkill since we already check if user session exists

        const query = `INSERT INTO public."Posts" ("USERNAME" , "TITLE", "DETAILS") VALUES ($1, $2, $3) returning *;`
        const params = [username, title, details,];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    if(data.length > 0){
                        resolve(new PostModel(data[0]));
                    }else{
                        resolve(null);
                    }
                    
                })
                .catch(err => reject(err));
        })
    }

    static async deleteUserPost(postId: string, username: string): Promise<PostInterface | null> {

        // making sure post does exist before attempting to update it
        const postExists = await this.getOnePost(postId);

        if(postExists === null || postExists.length === 0){
            return new Promise<PostInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "The post you are trying to delete has already been deleted.",
                        code:"MP002"    
                    })
            })
        }
        const query = `DELETE FROM public."Posts" WHERE "POST_ID" = $1 AND "USERNAME" = $2 returning *;`
        const params = [postId, username];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    if(data.length > 0){
                        resolve(new PostModel(data[0]));
                    }else{
                        resolve(null);
                    }
                    
                })
                .catch(err => reject(err));
        })
    }

}