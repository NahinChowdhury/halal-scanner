import { client } from './index';

export interface UserInterface {
    USERNAME?: string;
    PASSWORD?: string;
}

export class LoginModel implements UserInterface {
    USERNAME?: string;
    PASSWORD?: string;

    constructor(user: UserInterface) {
        Object.assign(this, user);
    }

    static async verifyUser(username: string, password: string): Promise<LoginModel | null> {

        const query = `Select u."USERNAME", u."PASSWORD" FROM public."User" u WHERE u."USERNAME" = $1 AND u."PASSWORD" = $2;`;
        const params = [username, password];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(new LoginModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }


    static async createNewUser(username: string, password: string): Promise<LoginModel | null>{
        
        // making sure comment does exist before attempting to update it
        const userExists = await this.findUser(username);

        if(userExists !== null){
            return new Promise<UserInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "There already exists a user with the same username",
                        code:"LM001"
                    })
            })
        }

        const query = `INSERT INTO public."User" ("USERNAME" , "PASSWORD") VALUES ($1, $2) RETURNING *;`;
        const params = [username, password];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(new LoginModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }

    static async findUser(username: string): Promise<LoginModel | null> {

        const query = `Select * FROM public."User" u WHERE u."USERNAME" = $1;`
        const params = [username];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(new LoginModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }
}