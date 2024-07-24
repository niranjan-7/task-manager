import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { format } from 'date-fns';
import { useUser } from '@clerk/clerk-react';
import { API_SERVER } from '../config/api';

interface Task {
  _id: string;
  name: string;
  creatorEmail: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
  collaborators: string[];
  viewers: string[];
}

const TaskList: React.FC = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn && isLoaded) {
      setCurrentUserEmail(user?.primaryEmailAddress?.emailAddress ?? null);
    }
  }, [isSignedIn, isLoaded, user]);

  useEffect(() => {
    fetch(API_SERVER+'/api/tasks')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setTasks(data);
        // console.log('Tasklist',data);
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
      })
      .finally(()=>{
        setIsLoading(false)
      });

      const handleTaskCreated = (task: Task) => {
        setTasks(prevTasks => [...prevTasks, task]);
      };
    
      const handleTaskUpdated = (updatedTask: Task) => {
        setTasks(prevTasks =>
          prevTasks.map(task => (task._id === updatedTask._id ? updatedTask : task))
        );
      };
    
      const handleTaskDeleted = (deletedTask: Task) => {
        setTasks(prevTasks => prevTasks.filter(task => task._id !== deletedTask._id));
      };
    
  }, [currentUserEmail]);







  const deleteTask = async (taskId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    try {
      const response = await fetch(API_SERVER+`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <TaskListContainer>
      <Header>
        <Title>Tasks</Title>
        <CreateTaskButton to="/dashboard/create-task">Create New Task</CreateTaskButton>
      </Header>
      {isLoading ? (<>Loading</>):
      <TaskTable>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Task Creator</th>
            <th>Due Date</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Collaborators</th>
            <th>Viewers</th>
            <th>View</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task._id}>
              <td>{task.name}</td>
              <td>{task.description}</td>
              <td>{task.creatorEmail}</td>
              <td>{format(new Date(task.dueDate), 'PP')}</td>
              <td>{task.priority}</td>
              <td>{task.status}</td>
              <td>
                {task.collaborators.map((collaborator, index) => (
                  <Chip key={index}>{collaborator}</Chip>
                ))}
              </td>
              <td>
                {task.viewers.map((viewer, index) => (
                  <Chip key={index}>{viewer}</Chip>
                ))}
              </td>
              <td>
                <StyledLink to={`${task._id}`}>View</StyledLink>
              </td>
              <td>
                {task.collaborators.includes(currentUserEmail as string) && <StyledLink to={`edit/${task._id}`}>Edit</StyledLink>}
                {currentUserEmail == task.creatorEmail && <StyledLink to={`edit/${task._id}`}>Edit</StyledLink>}
              </td>
              <td>
                <DeleteButton
                  onClick={() => deleteTask(task._id)}
                  disabled={currentUserEmail !== task.creatorEmail}
                >
                  Delete
                </DeleteButton>
              </td>
            </tr>
          ))}
        </tbody>
      </TaskTable>}
    </TaskListContainer>
  );
};

const TaskListContainer = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  color: #333;
`;

const CreateTaskButton = styled(Link)`
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const TaskTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 10px;
    text-align: left;
    border: 1px solid #ddd;
  }

  th {
    background-color: #f4f4f4;
  }

  tbody tr:nth-child(odd) {
    background-color: #f9f9f9;
  }

  tbody tr:hover {
    background-color: #f1f1f1;
  }
`;

const StyledLink = styled(Link)`
  color: #007bff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const DeleteButton = styled.button`
  color: #fff;
  background-color: #dc3545;
  border: none;
  padding: 5px 10px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Chip = styled.span`
  background-color: #f0f0f0;
  color: #333;
  padding: 5px 10px;
  border-radius: 20px;
  margin-right: 5px;
  margin-bottom: 5px;
  display: inline-block;
`;

export default TaskList;
