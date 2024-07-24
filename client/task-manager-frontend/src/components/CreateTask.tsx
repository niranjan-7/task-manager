import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import TaskForm from './TaskForm';
import { API_SERVER } from '../config/api';



const CreateTask: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleCreateTask = async (task: any) => {
    const newTask = {
      ...task,
      creatorEmail: user?.primaryEmailAddress?.emailAddress,
    };

    try {
      const response = await axios.post(API_SERVER+'/api/tasks', newTask);
      console.log(response);
      navigate('/dashboard/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <TaskForm
      onSubmit={handleCreateTask}
      submitButtonText="Create"
      creatorEmail={user?.primaryEmailAddress?.emailAddress as string}
    />
  );
};

export default CreateTask;
