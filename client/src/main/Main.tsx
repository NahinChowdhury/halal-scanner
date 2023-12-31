import axios from "axios";
import React, {FunctionComponent, useState} from "react";
import { Link } from "react-router-dom";
import halalLogo from '../images/halal-logo-no-bg.png';
import barcodeLogo from '../images/barcode-logo-no-bg.png';


export const Main:FunctionComponent = () => {

	return (
		<>
			<div style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#24603C', 
				padding: '10rem'
			}}>
				<div>
					<img src={halalLogo} alt="logo" />
				</div>
				<span style={{fontSize: '6.4rem', position: 'absolute', marginTop: '16rem', marginLeft: '41rem', color: 'white', fontFamily: 'Lustria'}}>LIFE</span>
				<hr style={{border: '0.25rem solid white', width: "100%", marginLeft:"35%"}}/>
			</div>
			<hr style={{border: '2.5rem solid #00412A', width: "100%", margin: 0}}/>
			
			<section style={{padding:"0 3rem", paddingBottom: '3rem', color: "#24603C", fontWeight: "bold", backgroundColor: '#EBEBEB'}}>
				<div style={{padding: "1rem"}}>Scan your food item bar code to know if the item is Halal.</div>
				<div style={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-around',
					fontSize: '1.5rem',
				}}>
					<Link to='barCode' style={{
						display: 'flex',
						flexDirection: 'column',
						backgroundColor: "#24603C",
						padding: '3rem 5rem',
						borderRadius: '50px',
						color: 'white',
						textDecoration: 'none'
					}}>
						<img src={barcodeLogo} alt="Barcode Logo" style={{ width: '250px', height: '250px', filter: 'invert(1)'}} />
						<span style={{margin: 'auto'}}>Scan Bar-code</span>
					</Link>
					<Link to='ocr' style={{
						display: 'flex',
						flexDirection: 'column',
						backgroundColor: "#24603C",
						padding: '3rem 5rem',
						borderRadius: '50px',
						color: 'white',
						textDecoration: 'none'
					}}>
						<img src={barcodeLogo} alt="Barcode Logo" style={{ width: '250px', height: '250px', filter: 'invert(1)'}} />
						<span style={{margin: 'auto'}}>Scan Ingredients</span>
					</Link>
				</div>
			</section>
		</>
	)
}