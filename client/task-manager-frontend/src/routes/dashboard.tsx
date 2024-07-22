import React from "react";
import AgileBoard from "../components/new/Board";
import NotificationComponent from "../components/Notifications";



const DashboardPage : React.FC = () => {
  return (
    <div>
      <>
        <AgileBoard />
      </>
      <>
        <NotificationComponent />
      </>
    </div>
  );
};

export default DashboardPage;
