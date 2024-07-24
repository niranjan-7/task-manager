import { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';

import { API_SERVER } from '../config/api';


const NotificationContainer = styled.div`
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f9f9f9;
`;

const NotificationItem = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NotificationMessage = styled.p`
  margin: 0 0 10px;
  font-size: 16px;
`;

const NotificationUpdates = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NotificationUpdate = styled.li`
  font-size: 14px;
  color: #555;
`;

interface Notification {
  _id: string;
  message: string;
  updates?: { _id: string; field: string; oldValue: string; newValue: string }[];
}

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.post(API_SERVER+'/api/notifications', { userEmail: user?.primaryEmailAddress?.emailAddress });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally{
        setIsLoading(false)
      }
    };

    if (user) {
      fetchNotifications();
    }

   
  }, [user]);

  return (
    <>
    {!isLoading?
    <>
      <NotificationContainer>
        {notifications.map((notification:any) => (
          <NotificationItem key={notification._id}>
            <NotificationMessage>{notification.message}</NotificationMessage>
            {notification.updates && notification.updates.length > 0 && (
              <NotificationUpdates>
                {notification.updates.map((update:any) => (
                  <NotificationUpdate key={update._id}>
                    {update.field} from "{update.oldValue}" to "{update.newValue}"
                  </NotificationUpdate>
                ))}
              </NotificationUpdates>
            )}
          </NotificationItem>
        ))}
      </NotificationContainer>
    </>:<>Loading</>
    }
    </>
  );
};

export default NotificationComponent;
