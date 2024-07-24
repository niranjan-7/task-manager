import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Task } from './Task';
import { useUser } from '@clerk/clerk-react';
import { API_SERVER } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';


const Board = styled.div`
    display: flex;
    flex-direction: column;
    margin: 10px;
    overflow: hidden;
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 10px;
`;

const ColumnBox = styled.div`
    display: flex;
    width:100%;
`;

const ColumnTitle = styled.h3`
    margin-top: 0;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 3px solid #007bff;
    font-size: 16px;
    font-weight: 300;
`;

const IssueList = styled.ul`
    flex-grow: 1;
    width: 100%;
    margin: 0;
    padding: 0;
    background-color: #f0f0f0;
`;

const FilterContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
`;

const FilterInput = styled.input`
    flex-grow: 1;
    padding: 8px;
    margin-right: 10px;
    font-size: 14px;
`;

const FilterButton = styled.button`
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 14px;
`;

interface Task {
    _id: string;
    name: string;
    creatorEmail: string;
    description: string;
    dueDate: string;
    priority: "Low" | "Medium" | "High";
    status: string;
    collaborators: string[];
    viewers: string[];
}

interface DraggableTaskProps {
    task: Task;
    index: number;
    moveTask: any;
}

const ItemTypes = {
    TASK: 'task',
};

const ColumnList: React.FC<{ context: string, taskList: Task[],droppableId:string }> = ({ context, taskList,droppableId }) => {
        return (
        <div>
            <Column >
                    <ColumnTitle>{context}</ColumnTitle>
            <Droppable droppableId={droppableId} key={droppableId}>
            {
                (provided) => (
                    
                    <IssueList ref={provided.innerRef} {...provided.droppableProps}>
                       {taskList.map((task, index) => (
                            <Task
                                index={index}
                                taskId={task._id}
                                key={task._id}
                                priority={task.priority}
                                collaborators={task.collaborators}
                                name={task.name}
                                description={task.description}
                                dueDate={task.dueDate}
                                creatorEmail={task.creatorEmail}
                                status={task.status}
                            />
                        ))}
                        {provided.placeholder}
                    </IssueList>
                          
                )
            }
            </Droppable>
            </Column>
        </div>

    );
};

const AgileBoard: React.FC = () => {
    const { isSignedIn, user, isLoaded } = useUser();
    const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
    const [progressTasks, setProgressTasks] = useState<Task[]>([]);
    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
    const [pending1Tasks, setPending1Tasks] = useState<Task[]>([]);
    const [progress1Tasks, setProgress1Tasks] = useState<Task[]>([]);
    const [completed1Tasks, setCompleted1Tasks] = useState<Task[]>([]);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [filterName, setFilterName] = useState<string>(''); 
    const [filterDesc, setFilterDesc] = useState<string>(''); 
    const [selectedPriority, setSelectedPriority] = useState<'Low' | 'High' | 'Medium' | 'All'>('All');

    const handleTaskCreated = (task: Task) => {
        switch (task.status) {
            case 'Pending':
                setPendingTasks(prevTasks => [...prevTasks, task]);
                break;
            case 'In Progress':
                setProgressTasks(prevTasks => [...prevTasks, task]);
                break;
            case 'Completed':
                setCompletedTasks(prevTasks => [...prevTasks, task]);
                break;
            default:
                break;
        }
    };

    const handleTaskUpdated = (updatedTask: Task) => {
        switch (updatedTask.status) {
            case 'Pending':
                setPendingTasks(prevTasks =>
                    prevTasks.map(task => (task._id === updatedTask._id ? updatedTask : task))
                );
                break;
            case 'In Progress':
                setProgressTasks(prevTasks =>
                    prevTasks.map(task => (task._id === updatedTask._id ? updatedTask : task))
                );
                break;
            case 'Completed':
                setCompletedTasks(prevTasks =>
                    prevTasks.map(task => (task._id === updatedTask._id ? updatedTask : task))
                );
                break;
            default:
                break;
        }
    };

    const handleTaskDeleted = (deletedTask: Task) => {
        switch (deletedTask.status) {
            case 'Pending':
                setPendingTasks(prevTasks => prevTasks.filter(task => task._id !== deletedTask._id));
                break;
            case 'In Progress':
                setProgressTasks(prevTasks => prevTasks.filter(task => task._id !== deletedTask._id));
                break;
            case 'Completed':
                setCompletedTasks(prevTasks => prevTasks.filter(task => task._id !== deletedTask._id));
                break;
            default:
                break;
        }
    };

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            let pendingUrl = `${API_SERVER}/api/tasks?status=${encodeURIComponent('Pending')}`;
            let inProgressUrl = `${API_SERVER}/api/tasks?status=${encodeURIComponent('In Progress')}`;
            let completedUrl = `${API_SERVER}/api/tasks?status=${encodeURIComponent('Completed')}`;

            const responsePending = await fetch(pendingUrl);
            const responseInProgress = await fetch(inProgressUrl);
            const responseCompleted = await fetch(completedUrl);

            if (!responsePending.ok || !responseInProgress.ok || !responseCompleted.ok) {
                throw new Error(`HTTP error!`);
            }

            const dataPending = await responsePending.json();
            const dataInProgress = await responseInProgress.json();
            const dataCompleted = await responseCompleted.json();
            
            setPendingTasks(dataPending);
            setProgressTasks(dataInProgress);
            setCompletedTasks(dataCompleted);
            setPending1Tasks(dataPending);
            setProgress1Tasks(dataInProgress);
            setCompleted1Tasks(dataCompleted);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isSignedIn && isLoaded) {
            setCurrentUserEmail(user?.primaryEmailAddress?.emailAddress ?? null);
        }
    }, [isSignedIn, isLoaded, user]);

    useEffect(() => {
        fetchTasks();
    }, [currentUserEmail]);

    useEffect(() => {
        const filterTasks = () => {
            const filteredPendingByName = pending1Tasks.filter(task =>
                task.name.toLowerCase().includes(filterName.toLowerCase())
            );
            const filteredProgressByName = progress1Tasks.filter(task =>
                task.name.toLowerCase().includes(filterName.toLowerCase())
            );
            const filteredCompletedByName = completed1Tasks.filter(task =>
                task.name.toLowerCase().includes(filterName.toLowerCase())
            );
            setPendingTasks(filteredPendingByName);
            setProgressTasks(filteredProgressByName);
            setCompletedTasks(filteredCompletedByName);
        };

        if (filterName !== '') {
            filterTasks();
        }
    }, [filterName]);

    useEffect(() => {
        const filterTasks = () => {
            const filteredPendingByDesc = pending1Tasks.filter(task =>
                task.description.toLowerCase().includes(filterDesc.toLowerCase())
            );
            const filteredProgressByDesc = progress1Tasks.filter(task =>
                task.description.toLowerCase().includes(filterDesc.toLowerCase())
            );
            const filteredCompletedByDesc = completed1Tasks.filter(task =>
                task.description.toLowerCase().includes(filterDesc.toLowerCase())
            );
            setPendingTasks(filteredPendingByDesc);
            setProgressTasks(filteredProgressByDesc);
            setCompletedTasks(filteredCompletedByDesc);
        };

        if (filterDesc !== '') {
            filterTasks();
        }
    }, [filterDesc]);

    const handleResetForName = () => {
        setSelectedPriority('All');
        setFilterName('');
        setPendingTasks(pending1Tasks);
        setProgressTasks(progress1Tasks);
        setCompletedTasks(completed1Tasks);
    };

    const handleResetForDesc = () => {
        setSelectedPriority('All');
        setFilterDesc('');
        setPendingTasks(pending1Tasks);
        setProgressTasks(progress1Tasks);
        setCompletedTasks(completed1Tasks);
    };

    const handleEditTask = async (updatedTask: any, taskId: string) => {
        try {
            await axios.put(API_SERVER + `/api/tasks/${taskId}`, updatedTask);
            handleTaskUpdated(updatedTask);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const onDragEnd = (result:DropResult) => {
        const { source , destination } = result;
    console.log(result);

        if (!destination) return;
        
        if (destination.droppableId ===source.droppableId) return ;
        
    }
    const taskStatus = {
        pending: {
          name: "Pending",
          items: pendingTasks
        },
        progress: {
          name: "In Progress",
          items: progressTasks
        },
        completed: {
          name: "Completed",
          items: completedTasks
        }
      };
    const [columns, setColumns] = useState(taskStatus);
    return (
        <div>
            <Board>
                <FilterButton onClick={() => { navigate('/dashboard/create-task') }}>Add a Task</FilterButton>
                <ColumnBox>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <ColumnList context="Pending" taskList={pendingTasks} droppableId='pending'/>
                        <ColumnList context="In Progress" taskList={progressTasks} droppableId='progress'/>
                        <ColumnList context="Completed" taskList={completedTasks} droppableId='completed'/>
                    </DragDropContext>
                </ColumnBox>
            </Board>            
        </div>

    );
};

export default AgileBoard;


{/* 
                        <ColumnList context="In Progress" taskList={progressTasks} />
                        <ColumnList context="Completed" taskList={completedTasks} /> */}