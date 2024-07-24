import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
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
                    <DragDropContext onDragEnd={()=>{}}>
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

import { Link } from 'react-router-dom';
import editIcon from '../../assets/edit_note_24dp.svg';
import delteIcon from '../../assets/delete_24dp.svg';

interface IssueItemProps {
    type?: 'Low' | 'Medium' | 'High';
    overdue: boolean;
}

const IssueItem = styled.li<IssueItemProps>`
    display: block;
    position: relative;
    min-height: 90px;
    padding: 1em;
    padding-left: calc(1em + 19px);
    border: 1px solid #b0b0b0;
    background-color: white;
    font-size: 14px;

    &:before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 5px;
        background-color: ${props => {
            switch (props.type) {
                case 'Low':
                    return '#ffc107';
                case 'Medium':
                    return '#ff9800';
                case 'High':
                    return '#dc3545';
                default:
                    return '#dc3545';
            }
        }};
    }

    &:hover {
        a {
            color: #0000ff;
            border-bottom-color: #0000ff;
        }
    }

    & + & {
        border-top: 0;
    }

    ${props => props.overdue && `
        background-color: #f8d7da; /* Light red background for overdue tasks */
    `}
`;


const StyledLink = styled(Link)`
  text-decoration: none;
`;
const DueTime = styled.div`
    position: absolute;
    right: 1em;
    bottom: 1em;
    min-height: calc(1em * 1.618);
    min-width: 2em;
    padding: 0 0.5em;
    background-color: #d0d0d0;
    border-radius: 999em;
    font-size: 11px;
    text-align: center;
`;

const Creator = styled.div`
    position: absolute;
    left: 1em;
    bottom: 1em;
    min-height: calc(1em * 1.618);
    min-width: 2em;
    padding: 0 0.5em;
    background-color: #d0d0d0;
    border-radius: 999em;
    font-size: 11px;
    text-align: center;
`;

const ActionButtons = styled.div`
    position: absolute;
    right: 1em;
    top: 1em;
    
    padding: 0 0.5em;
    
    border-radius: 999em;
    
`;

const TaskName = styled(Link)`
    border-bottom: 1px solid transparent;
    color: black;
    text-transform: uppercase;
    text-decoration: none;
    transition: all 150ms ease-in;
`;

const Description = styled.p`
    margin-top: 0;
    margin-right: calc(1em + 32px + 5px);
    margin-bottom: 0;
`;

const Button = styled.img`
    margin-left: 0.3rem;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.1);
    }
`

interface TaskProps {
    index:number;
    taskId: string;
    priority: 'Low' | 'Medium' | 'High';
    name: string;
    description: string;
    dueDate: string;
    creatorEmail: string;
    status: string
    collaborators:string[]
}

const calculateTimeLeft = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const difference = due.getTime() - now.getTime() - (5 * 60 * 60 * 1000 + 30 * 60 * 1000);

    if (difference <= 0) {
        return {
            overdue: true,
            message: `Due ${Math.abs(Math.floor(difference / (1000 * 60 * 60 * 24)))}d ${Math.abs(Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))}h ago`
        };
    }

    return {
        overdue: false,
        message: `${Math.floor(difference / (1000 * 60 * 60 * 24))}d ${Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}h`
    };
};

export const Task: React.FC<TaskProps> = ({ index,taskId, priority, name, description, dueDate, creatorEmail,status,collaborators }) => {
    const { overdue, message } = calculateTimeLeft(dueDate);
    const { isSignedIn, user, isLoaded } = useUser();
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      if (isSignedIn && isLoaded) {
        setCurrentUserEmail(user?.primaryEmailAddress?.emailAddress ?? null);
      }
    }, [isSignedIn, isLoaded, user]);


    const deleteTask = async (taskId: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this task?');
        if (!confirmed) return;
        try {
          const response = await fetch(API_SERVER+`/api/tasks/${taskId}`, {
            method: 'DELETE',
          });
          navigate('/dashboard');

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        } catch (error) {
          console.error('Error deleting task:', error);
        }
      };
    return (
        <div>
        <Draggable draggableId={taskId} index={index}>
        {
            (provided)=>(
                <IssueItem 
                ref={provided.innerRef} 
                {...provided.draggableProps}
                {...provided.dragHandleProps} 
                type={priority} 
                overdue={overdue && status!=='Completed'}>
                    <DueTime>{message}</DueTime>
                    <Creator>{creatorEmail}</Creator>
                    <ActionButtons>
                        {collaborators.includes(currentUserEmail as string)&&<StyledLink to={`edit/${taskId}`}><Button src={editIcon} /></StyledLink>}
                        {currentUserEmail == creatorEmail &&<StyledLink to={`edit/${taskId}`}><Button src={editIcon} /></StyledLink>}
                        {<Button src={delteIcon} onClick={()=>deleteTask(taskId)}/>}
                    </ActionButtons>
                    <TaskName to={`${taskId}`}>{name}</TaskName>
                    <Description>{description}</Description>
                </IssueItem>
            )
        }
        </Draggable>
        </div>
            
    );
};
