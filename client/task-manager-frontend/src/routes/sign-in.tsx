import { SignIn } from "@clerk/clerk-react";
import styled from 'styled-components';

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* Ensure the container takes up the full viewport height */
`;

export default function SignInPage() {
  return (
    <CenteredContainer>
      <SignIn path="/sign-in" />
    </CenteredContainer>
  );
}
