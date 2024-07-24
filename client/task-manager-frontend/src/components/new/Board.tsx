import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Task } from './Task';
import { useUser } from '@clerk/clerk-react';
import { API_SERVER } from '../../config/api';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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

interface DraggableTaskProps{
    task:Task;
    index:number;
    moveTask:any;
}

const ItemTypes = {
    TASK: 'task',
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
    const socket = io(API_SERVER+'/');

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

    const moveTask = (taskId: string, sourceStatus: string, targetStatus: string) => {
        let taskToUpdate: Task | undefined;

        const updateTaskLists = (sourceList: Task[], targetList: Task[]) => {
            const taskIndex = sourceList.findIndex(task => task._id === taskId);
            if (taskIndex !== -1) {
                taskToUpdate = { ...sourceList[taskIndex], status: targetStatus };
                sourceList.splice(taskIndex, 1);
                targetList.push(taskToUpdate);
            }
        };

        switch (sourceStatus) {
            case 'Pending':
                updateTaskLists(pendingTasks, targetStatus === 'In Progress' ? progressTasks : completedTasks);
                break;
            case 'In Progress':
                updateTaskLists(progressTasks, targetStatus === 'Pending' ? pendingTasks : completedTasks);
                break;
            case 'Completed':
                updateTaskLists(completedTasks, targetStatus === 'Pending' ? pendingTasks : progressTasks);
                break;
            default:
                break;
        }

        if (taskToUpdate) {
            handleEditTask(taskToUpdate, taskId);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                <FilterContainer>
                    <FilterInput
                        type="text"
                        placeholder="Filter by name"
                        value={filterName}
                        onChange={e => setFilterName(e.target.value)}
                    />
                    <FilterButton onClick={handleResetForName}>Reset</FilterButton>
                </FilterContainer>
                <FilterContainer>
                    <FilterInput
                        type="text"
                        placeholder="Filter by description"
                        value={filterDesc}
                        onChange={e => setFilterDesc(e.target.value)}
                    />
                    <FilterButton onClick={handleResetForDesc}>Reset</FilterButton>
                </FilterContainer>
                <Board>
                    <ColumnBox>
                        <Column>
                            <ColumnTitle>Pending</ColumnTitle>
                            <IssueList>
                                {pendingTasks.map((task, index) => (
                                    <DraggableTask key={task._id} task={task} index={index} moveTask={moveTask} />
                                ))}
                            </IssueList>
                        </Column>
                        <Column>
                            <ColumnTitle>In Progress</ColumnTitle>
                            <IssueList>
                                {progressTasks.map((task, index) => (
                                    <DraggableTask key={task._id} task={task} index={index} moveTask={moveTask} />
                                ))}
                            </IssueList>
                        </Column>
                        <Column>
                            <ColumnTitle>Completed</ColumnTitle>
                            <IssueList>
                                {completedTasks.map((task, index) => (
                                    <DraggableTask key={task._id} task={task} index={index} moveTask={moveTask} />
                                ))}
                            </IssueList>
                        </Column>
                    </ColumnBox>
                </Board>
            </div>
        </DndProvider>
    );
};

const DraggableTask:React.FC<DraggableTaskProps> = ({ task, index, moveTask }) => {
    const [, ref] = useDrag({
        type: ItemTypes.TASK,
        item: { taskId: task._id, sourceStatus: task.status },
    });

    const [, drop] = useDrop({
        accept: ItemTypes.TASK,
        hover: (draggedItem:any) => {
            if (draggedItem.taskId !== task._id) {
                moveTask(draggedItem.taskId, draggedItem.sourceStatus, task.status);
                draggedItem.sourceStatus = task.status;
            }
        },
    });

    return (
        <div ref={(node) => ref(drop(node))}>
            <Task
                taskId={task._id}
                key={task._id}
                priority={task.priority}
                collaborators={task.collaborators}
                name={task.name}
                description={task.description}
                dueDate={task.dueDate}
                creatorEmail={task.creatorEmail}
                status='Pending'
            />
        </div>
    );
};

export default AgileBoard;
