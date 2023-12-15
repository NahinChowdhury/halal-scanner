import axios from "axios";
import React, {FunctionComponent, useState} from "react";
import { Link } from "react-router-dom";


export const Login:FunctionComponent = () => {

    const [userName, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const loginClicked = (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if( userName.length === 0 || password.length === 0 ){
            return alert("Both fields need to be full");
        }

        // make a request to the backend to verify account exists

        axios.post("/api/help/login",  {username: userName, password: password})
            .then(res => {
                console.log(res.data)
                window.location.pathname = '/';
            })
            .catch(e => {
                const error = e.response.data;
                console.log(error);
                alert(`${error.message}. CODE: ${error.code}`)
            })
    }

    return ( 
        <div className="login">
            <div>User Name</div>
            <input 
                type="text" 
                value={userName} 
                onChange={e => {
                    setUserName(e.target.value)
                }}
            />
            <div>Password</div>
            <input 
                type="text" 
                value={password} 
                onChange={e => {
                    setPassword(e.target.value)
                }}
            />
            <button onClick={loginClicked}>Log In</button>
            
            <div>Don't have an account? Sign up!</div>
            <Link to="/signup">Go to Sign up</Link>
        </div>
    )
}