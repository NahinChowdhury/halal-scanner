import React, { useEffect, useState} from "react";
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';


export const PrivateRoute= () => {

    const [isLoggedIn, setIsLoggedIn] = useState<boolean|null>(null);

    useEffect(() => {
        axios.get("/api/help/isLoggedIn")
            .then(res => {
                const { username } = res.data;
                window.localStorage.setItem("user", username);
                setIsLoggedIn(true);
            })
            .catch(error => {
                setIsLoggedIn(false);
            })
    },[]);

    const renderComponent = () => {
        if(isLoggedIn === null){
            return <>Loading...</>
        }else if(isLoggedIn){
            return <Outlet />;
        }else{
            return <Navigate to="/NotFound" />;
        }
    }

    return renderComponent();
}