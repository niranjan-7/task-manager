import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { format, isAfter } from 'date-fns';
import { API_SERVER } from '../config/api';
import { useUser } from '@clerk/clerk-react';

const getColor = (priority: string): string => {
    switch (priority) {
        case 'Low':
            return '#ffc107';
        case 'Medium':
            return '#ff9800';
        case 'High':
            return '#dc3545';
        default:
            return '#dc3545';
    }
};

const TaskCard = styled.div<{ priority: string; overdue?: boolean }>`
    width: 50%;
    margin: auto;
    padding: 20px;
    border: 2px solid ${({ priority }) => getColor(priority)};
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    ${(props) =>
        props.overdue &&
        `
        background-color: #f8d7da; /* Light red background for overdue tasks */
    `}
`;

const ReturnButton = styled.button`
    display: inline-block;
    margin-top: 10px;
    margin-right: 10px;
    padding: 10px 20px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    text-decoration: none;
    text-align: center;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #0056b3;
    }
`;

const AddViewerButton = styled.button`
    display: inline-block;
    margin-top: 10px;
    padding: 10px 20px;
    background-color: #28a745; /* Green color for add viewer button */
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    text-decoration: none;
    text-align: center;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #218838; /* Darker green on hover */
    }
`;

const AddCollaboratorButton = styled.button`
    display: inline-block;
    margin-top: 10px;
    padding: 10px 20px;
    background-color: #ffc107; /* Yellow color for add collaborator button */
    color: #333;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    text-decoration: none;
    text-align: center;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #e0a800; /* Darker yellow on hover */
    }
`;

const Label = styled.span`
    font-weight: bold;
    color: #333; /* Dark gray color */
    margin-right: 5px;
`;

const EmptyDiv = styled.div`
    min-height: 3rem;
`;

interface Task {
    name: string;
    description: string;
    dueDate: string;
    priority: string;
    status: string;
    collaborators: string[];
    viewers: string[];
    creatorEmail: string;
}

const TaskDetail: React.FC = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const currentDate = new Date();
    const isoDateString = currentDate.toISOString();

    const [task, setTask] = useState<Task>({
        name: '',
        description: '',
        dueDate: isoDateString,
        priority: '',
        status: '',
        collaborators: [],
        viewers: [],
        creatorEmail: ''
    });

    const [addingViewer, setAddingViewer] = useState<boolean>(false);
    const [addingCollaborator, setAddingCollaborator] = useState<boolean>(false);

    const { user } = useUser();
    const dueDate = new Date(task.dueDate);
    const overdue = isAfter(currentDate, dueDate);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const response = await axios.get(`${API_SERVER}/api/tasks/${taskId}`);
                setTask(response.data);
            } catch (error) {
                console.error('Error fetching task:', error);
            }
        };
        fetchTask();

    }, [taskId]);

    const addViewer = async () => {
        setAddingViewer(true);
        try {
            const updatedTask = {
                ...task,
                viewers: [...task.viewers, user?.primaryEmailAddress?.emailAddress], // Add current user's email to viewers array
            };
            await axios.put(`${API_SERVER}/api/tasks/${taskId}`, updatedTask);
            navigate('/dashboard/tasks');
        } catch (error) {
            console.error('Error adding viewer:', error);
        } finally {
            setAddingViewer(false);
        }
    };

    const addCollaborator = async () => {
        setAddingCollaborator(true);
        try {
            const updatedTask = {
                ...task,
                collaborators: [...task.collaborators, user?.primaryEmailAddress?.emailAddress],
            };
            await axios.put(`${API_SERVER}/api/tasks/${taskId}`, updatedTask);
            navigate('/dashboard/tasks');
        } catch (error) {
            console.error('Error adding collaborator:', error);
        } finally {
            setAddingCollaborator(false);
        }
    };

    if (!task) {
        return <div>Loading task...</div>;
    }

    return (
        <>
            <EmptyDiv></EmptyDiv>
            <TaskCard priority={task.priority} overdue={overdue && task.status !== 'Completed'}>
                <h2>{task.name}</h2>
                <p>
                    <Label>Creator:</Label> {task.creatorEmail}
                </p>
                <p>
                    <Label>Description:</Label> {task.description}
                </p>
                <p>
                    <Label>Due Date:</Label> {format(new Date(task.dueDate), 'yyyy-MM-dd')}
                </p>
                <p>
                    <Label>Priority:</Label> {task.priority}
                </p>
                <p>
                    <Label>Status:</Label> {task.status}
                </p>
                <div>
                    <h3>Collaborators:</h3>
                    <ul>
                        {task.collaborators.map((collaborator: string, index: number) => (
                            <li key={index}>{collaborator}</li>
                        ))}
                    </ul>
                    {user?.primaryEmailAddress?.emailAddress !== task.creatorEmail &&
                        !task.collaborators.includes(user?.primaryEmailAddress?.emailAddress as string) && (
                            <AddCollaboratorButton disabled={addingCollaborator} onClick={addCollaborator}>
                                {addingCollaborator ? 'Adding...' : 'Add Yourself as Collaborator'}
                            </AddCollaboratorButton>
                        )}
                </div>
                <div>
                    <h3>Viewers:</h3>
                    <ul>
                        {task.viewers.map((viewer: string, index: number) => (
                            <li key={index}>{viewer}</li>
                        ))}
                    </ul>
                    {user?.primaryEmailAddress?.emailAddress !== task.creatorEmail &&
                        !task.collaborators.includes(user?.primaryEmailAddress?.emailAddress as string) &&
                        !task.viewers.includes(user?.primaryEmailAddress?.emailAddress as string) && (
                            <AddViewerButton disabled={addingViewer} onClick={addViewer}>
                                {addingViewer ? 'Adding...' : 'Add Yourself as Viewer'}
                            </AddViewerButton>
                        )}
                </div>
                <Link to="/dashboard/tasks">
                    <ReturnButton>Return to Dashboard</ReturnButton>
                </Link>
            </TaskCard>
        </>
    );
};

export default TaskDetail;
