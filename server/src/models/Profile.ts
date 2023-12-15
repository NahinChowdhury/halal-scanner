import { client } from './index';

export interface ProfileInterface {
    USERNAME?: string;
    FIRSTNAME?: string;
    LASTNAME?: string;
}

export class ProfileModel implements ProfileInterface {
    USERNAME?: string;
    FIRSTNAME?: string;
    LASTNAME?: string;

    constructor(user: ProfileInterface) {
        Object.assign(this, user);
    }

    static async getUserProfile(username: string): Promise<ProfileInterface | null> {

        const query = `Select * FROM public."Profile" u WHERE u."USERNAME" = $1;`
        const params = [username]

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(new ProfileModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }

    static async updateUserProfile(username:string, firstname:string, lastname:string): Promise<ProfileInterface | null> {
        
        // making sure user does exist before attempting to update it
        const commentExists = await this.getUserProfile(username);

        if(commentExists === null){
            return new Promise<ProfileInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "The profile you are trying to update doesn't exist. Please try to login again",
                        code:"MP001"    
                    })
            })
        }

        const query = `UPDATE public."Profile" p
                        SET "FIRSTNAME" = $1, "LASTNAME" = $2
                        WHERE "USERNAME" = $3
                        RETURNING *;`
        const params = [firstname, lastname, username];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("profile update data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(new ProfileModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }

}