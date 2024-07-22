import * as React from 'react';
import { useAuth } from "@clerk/clerk-react";
import { Outlet, useNavigate } from "react-router-dom";



const DashboardLayout: React.FC = () => {
  const { userId, isLoaded } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLoaded && !userId) {
      navigate("/sign-in");
    }
  }, [isLoaded]);

  if (!isLoaded) return "Loading...";

  return (
    <Outlet />
  );
};

export default DashboardLayout;
