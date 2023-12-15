import React, {FunctionComponent} from "react";
import { Link } from "react-router-dom";


export const NotFound:FunctionComponent = () => {

    return ( 
        <>
            404 page not found.
            <Link to="/login">Go to Login</Link>
        </>
    )
}