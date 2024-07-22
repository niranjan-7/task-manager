import { Link } from "react-router-dom";
import styled from 'styled-components';

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* Ensure the container takes up the full viewport height */
`;

const Button = styled.button`
  padding: 15px 30px; /* Increased padding for bigger size */
  font-size: 18px; /* Increased font size */
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none; /* Ensure no underline for the Link */
  display: inline-block;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3; /* Darker shade on hover */
  }
`;

export default function IndexPage() {
  return (
    <CenteredContainer>
      <div>
        <div>
          <Button as={Link} to="/dashboard/tasks">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </CenteredContainer>
  );
}
