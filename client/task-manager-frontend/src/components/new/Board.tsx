import React, { useEffect, useState } from 'react';
import editIcon from '../../assets/edit_note_24dp.svg';
import deleteIcon from '../../assets/delete_24dp.svg';
import { useUser } from '@clerk/clerk-react';
import { API_SERVER } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
import {
    Board,
    Column,
    ColumnBox,
    ColumnTitle,
    IssueList,
    FilterButton,
    IssueItem,
    StyledLink,
    DueTime,
    Creator,
    ActionButtons,
    TaskName,
    Description,
    Button
} from './StyledComponents';

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

const ColumnList: React.FC<{ context: string, taskList: Task[], droppableId: string }> = ({ context, taskList, droppableId }) => {
    return (
        <Column>
            <ColumnTitle>{context}</ColumnTitle>
            <Droppable droppableId={droppableId}>
                {(provided) => (
                    <IssueList ref={provided.innerRef} {...provided.droppableProps}>
                        {taskList.map((task, index) => (
                            <Task
                                key={task._id}
                                index={index}
                                taskId={task._id}
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
                )}
            </Droppable>
        </Column>
    );
};

const AgileBoard: React.FC = () => {
    const { isSignedIn, user, isLoaded } = useUser();
    const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
    const [progressTasks, setProgressTasks] = useState<Task[]>([]);
    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const pendingUrl = `${API_SERVER}/api/tasks?status=${encodeURIComponent('Pending')}`;
            const inProgressUrl = `${API_SERVER}/api/tasks?status=${encodeURIComponent('In Progress')}`;
            const completedUrl = `${API_SERVER}/api/tasks?status=${encodeURIComponent('Completed')}`;

            const [responsePending, responseInProgress, responseCompleted] = await Promise.all([
                fetch(pendingUrl),
                fetch(inProgressUrl),
                fetch(completedUrl)
            ]);

            if (!responsePending.ok || !responseInProgress.ok || !responseCompleted.ok) {
                throw new Error(`HTTP error!`);
            }

            const dataPending = await responsePending.json();
            const dataInProgress = await responseInProgress.json();
            const dataCompleted = await responseCompleted.json();

            setPendingTasks(dataPending);
            setProgressTasks(dataInProgress);
            setCompletedTasks(dataCompleted);
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

    return (
        <Board>
            <FilterButton onClick={() => navigate('/dashboard/create-task')}>Add a Task</FilterButton>
            <ColumnBox>
                <DragDropContext onDragEnd={() => { }}>
                    <ColumnList context="Pending" taskList={pendingTasks} droppableId="pending" />
                    <ColumnList context="In Progress" taskList={progressTasks} droppableId="progress" />
                    <ColumnList context="Completed" taskList={completedTasks} droppableId="completed" />
                </DragDropContext>
            </ColumnBox>
        </Board>
    );
};

export default AgileBoard;

interface TaskProps {
    index: number;
    taskId: string;
    priority: 'Low' | 'Medium' | 'High';
    name: string;
    description: string;
    dueDate: string;
    creatorEmail: string;
    status: string;
    collaborators: string[];
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

export const Task: React.FC<TaskProps> = ({ index, taskId, priority, name, description, dueDate, creatorEmail, status, collaborators }) => {
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
            const response = await fetch(`${API_SERVER}/api/tasks/${taskId}`, {
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
        <Draggable key={taskId} draggableId={taskId} index={index}>
            {(provided) => (
                <IssueItem
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    type={priority}
                    overdue={overdue && status !== 'Completed'}>
                    <DueTime>{message}</DueTime>
                    <Creator>{creatorEmail}</Creator>
                    <ActionButtons>
                        {collaborators.includes(currentUserEmail as string) && (
                            <StyledLink to={`edit/${taskId}`}><Button src={editIcon} /></StyledLink>
                        )}
                        {currentUserEmail === creatorEmail && (
                            <StyledLink to={`edit/${taskId}`}><Button src={editIcon} /></StyledLink>
                        )}
                        <Button src={deleteIcon} onClick={() => deleteTask(taskId)} />
                    </ActionButtons>
                    <TaskName to={`${taskId}`}>{name}</TaskName>
                    <Description>{description}</Description>
                </IssueItem>
            )}
        </Draggable>
    );
};
