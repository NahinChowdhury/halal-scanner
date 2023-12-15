import { client } from './index';
import { LoginModel, UserInterface } from './login';

export class UserModel implements UserInterface {
    USERNAME?: string;
    PASSWORD?: string;

    constructor(user: UserInterface) {
        Object.assign(this, user);
    }

    static async findAllOtherUsers(username: string): Promise<UserModel[] | null> {

        // making sure user does exist before fetching all other users
        const userExists = await LoginModel.findUser(username);
        if(userExists === null){
            return new Promise<UserInterface[] | null>((resolve, reject) => {
                reject(
                    {
                        message: "Please log in and try again.",
                        code:"UM001"
                    })
            })
        }

        const query = `Select "USERNAME" FROM public."User" u WHERE u."USERNAME" != $1;`
        const params = [username];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(
                            data.map( d=> {
                                return new UserModel(d);
                            })
                        );
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }
}