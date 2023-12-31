import React, {FunctionComponent} from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NavbarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 0.3rem;
  background-color: #24603C;
`;

const NavbarLeft = styled.div`
  flex: 1;
`;

const NavbarRight = styled.div`
  flex: 3;
  display: flex;
  justify-content: flex-end;
`;

export const Navbar:FunctionComponent = () => {
  return (
    <NavbarWrapper>
      <NavbarLeft>
        <Link to="/left-link" style={{marginLeft: "3rem", color: "white", textDecoration: "none"}}>HELP</Link>
      </NavbarLeft>
      <NavbarRight>
        <Link to="/right-link-2" style={{marginRight: "1rem", color: "white", textDecoration: "none"}}>About</Link>
        <Link to="/right-link-1" style={{marginRight: "1rem", color: "white", textDecoration: "none"}}>Community</Link>
        <Link to="/right-link-3" style={{marginRight: "3rem", color: "white", textDecoration: "none"}}>Legitimacy</Link>
      </NavbarRight>
    </NavbarWrapper>
  );
};