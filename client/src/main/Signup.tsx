import axios from "axios";
import React, {FunctionComponent, useState} from "react";
import { Link } from "react-router-dom";


export const Signup:FunctionComponent = () => {

    const [userName, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    
    
    const signupClicked = (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if( userName.length === 0 || password.length === 0 || confirmPassword.length === 0 ){
            return alert("All 3 fields need to be full");
        }
        if(password !== confirmPassword){
            return alert("Password needs to be the same as confirm password");
        }
        
        // alert("Checking backend to sign you up");

        // make a backend call to create the account.
        // if successful, then redirect to login page to log in

        axios.post("/api/help/signup",  {username: userName, password: password})
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
        <div className="signup">
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
            
            <div>Confirm Password</div>
            <input 
                type="text" 
                value={confirmPassword} 
                onChange={e => {
                    setConfirmPassword(e.target.value)
                }}
            />            
            <button onClick={signupClicked}>Sign Up</button>
            <div>Have an account? Log In!</div>
            <Link to="/login">Go to Log In</Link>
        </div>
        
    )
}