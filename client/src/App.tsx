import { Route, Routes as Switch, BrowserRouter as Router } from "react-router-dom";
import { PrivateRoute } from './components/PrivateRoute';
import { Header, Footer } from './components/Index';
import { Login } from './main/Login';
import { Signup } from './main/Signup';
import { Profile } from "./main/Profile";
import { NotFound } from "./others/NotFound";
import { GoogleOCR } from "./main/GoogleOCR";
import { BarCode } from "./main/BarCode";
import { Main } from "./main/Main";

function App() {
  return (
    <>
		
		<Router>
		{/* <Header /> */}
		
			<Switch>
				{/* <Route path="/profile" element={ <PrivateRoute />  }>
					<Route path="/profile" element={ <Profile /> } />
				</Route> */}

				{/* <Route path="/signup" element={ <Signup /> } /> */}
				{/* <Route path="/login" element={ <Login /> }/> */}

				<Route path="/" element={ <Main /> } />
				<Route path="/ocr" element={ <GoogleOCR /> } />
				<Route path="/barCode" element={ <BarCode /> } />

				<Route path="*" element={ <NotFound /> } />

			</Switch>
		
		{/* <Footer /> */}
		</Router>

    </>
  );
}

export default App;
