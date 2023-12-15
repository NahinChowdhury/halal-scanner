import axios from "axios";
import React, {FunctionComponent, useEffect, useState} from "react";
import { Link } from "react-router-dom";


interface ProfileInterface {
    firstname: string;
    lastname: string;
}

export const Header:FunctionComponent = () => {
    const [profile, setProfile] = useState<ProfileInterface>({firstname: "", lastname: ""}) 
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

    useEffect(() => {
        axios.get("/api/user/profile")
        .then(res => {
            const {firstname, lastname} = res.data;
            setProfile({firstname: firstname, lastname: lastname});
            setIsLoggedIn(true);
    
        })
        .catch(e => {
            setIsLoggedIn(false)
        })
    },[])

    const logOutClicked = () => {
        axios.get("/api/help/logout")
        .then(res => {
            window.localStorage.clear();
            setIsLoggedIn(false);
            window.location.pathname = "/login";
        })
        .catch(e => {
            const error = e.response;
            console.log(error.data);
            setIsLoggedIn(true);
        })
    }
    
    return ( 
        <>
            <div style={{display:"flex", flexDirection:"row", justifyContent: "space-around"}}>

            <div>Header</div>
            { isLoggedIn ? 
                <div>{`Hello ${profile.firstname} ${profile.lastname}  `} <button onClick={logOutClicked}>Log Out</button></div> 
                : <div><button><Link to="/login">Log In</Link></button></div>
            }
            </div>
            <hr/>
        </>
    )
}