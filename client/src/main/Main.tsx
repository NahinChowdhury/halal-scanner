import axios from "axios";
import React, {FunctionComponent, useState} from "react";
import { Link } from "react-router-dom";


export const Main:FunctionComponent = () => {

	return (
		<>
			<Link to='ocr'>OCR</Link>
			<br/>
			<Link to='barCode'>Bar Code</Link>
		</>
	)
}