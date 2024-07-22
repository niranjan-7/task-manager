import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import styled from 'styled-components';
import logo from '../assets/logo.png';


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: "Outfit", sans-serif;
`;

const Header = styled.header`
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
`;

const Navbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavbarLeft = styled.div`
  flex: 1;
`;

const NavbarCenter = styled.div`
  flex: 2;
  text-align: center;
`;

const NavbarRight = styled.div`
  flex: 1;
  text-align: right;
  position: relative; /* Ensure relative positioning for absolute positioning within */
`;

const Logo = styled.img`
  max-width: 30px;
  cursor: pointer; /* Ensure the logo is clickable */
`;




const RootLayout: React.FC = () => {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      publishableKey={PUBLISHABLE_KEY}
    >
      <Container>
        <Header>
          <Navbar>
            <NavbarLeft>
              <Logo src={logo} alt="Logo" />
            </NavbarLeft>
            <NavbarCenter>
              <Link to="/dashboard/tasks" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
            </NavbarCenter>
            <NavbarRight>
              <SignedIn>
                <UserButton afterSignOutUrl='/sign-in' />
              </SignedIn>
              <SignedOut>
                <Link to="/sign-in" style={{ color: '#fff', textDecoration: 'none' }}>Sign In</Link>
              </SignedOut>
            </NavbarRight>
          </Navbar>
        </Header>
        <main>
          <Outlet />
        </main>
      </Container>
    </ClerkProvider>
  );
};

export default RootLayout;
