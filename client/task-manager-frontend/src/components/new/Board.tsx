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

interface ColumnData {
    name: string;
    items: Task[];
}

interface ColumnsState {
    [key: string]: ColumnData;
}

const ColumnList: React.FC<{ context: string, taskList: Task[], droppableId: string }> = ({ context, taskList, droppableId }) => (
    <Column>
        <ColumnTitle>{context}</ColumnTitle>
        <Droppable droppableId={droppableId}>
            {(provided) => (
                <IssueList ref={provided.innerRef} {...provided.droppableProps}>
                    {taskList.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                >
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
                                </div>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </IssueList>
            )}
        </Droppable>
    </Column>
);

const AgileBoard: React.FC = () => {
    const { isSignedIn, user, isLoaded } = useUser();
    const [columns, setColumns] = useState<ColumnsState>({
        pending: { name: "Pending", items: [] },
        progress: { name: "In Progress", items: [] },
        completed: { name: "Completed", items: [] }
    });
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const [pendingResponse, inProgressResponse, completedResponse] = await Promise.all([
                fetch(`${API_SERVER}/api/tasks?status=Pending`),
                fetch(`${API_SERVER}/api/tasks?status=In Progress`),
                fetch(`${API_SERVER}/api/tasks?status=Completed`)
            ]);

            if (!pendingResponse.ok || !inProgressResponse.ok || !completedResponse.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const [dataPending, dataInProgress, dataCompleted] = await Promise.all([
                pendingResponse.json(),
                inProgressResponse.json(),
                completedResponse.json()
            ]);

            setColumns({
                pending: { name: "Pending", items: dataPending },
                progress: { name: "In Progress", items: dataInProgress },
                completed: { name: "Completed", items: dataCompleted }
            });
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

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const { source, destination } = result;

        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceColumn = columns[source.droppableId];
        const destinationColumn = columns[destination.droppableId];
        const [movedTask] = sourceColumn.items.splice(source.index, 1);

        destinationColumn.items.splice(destination.index, 0, movedTask);

        setColumns({
            ...columns,
            [source.droppableId]: sourceColumn,
            [destination.droppableId]: destinationColumn
        });
    };

    return (
        <Board>
            <FilterButton onClick={() => navigate('/dashboard/create-task')}>Add a Task</FilterButton>
            <ColumnBox>
                <DragDropContext onDragEnd={handleDragEnd}>
                    {Object.entries(columns).map(([columnId, column]) => (
                        <ColumnList key={columnId} context={column.name} taskList={column.items} droppableId={columnId} />
                    ))}
                </DragDropContext>
            </ColumnBox>
        </Board>
    );
};

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

 const Task: React.FC<TaskProps> = ({ index, taskId, priority, name, description, dueDate, creatorEmail, status, collaborators }) => {
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
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            navigate('/dashboard');
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    return (
        <IssueItem type={priority} overdue={overdue && status !== 'Completed'}>
            <DueTime>{message}</DueTime>
            <Creator>{creatorEmail}</Creator>
            <ActionButtons>
                {(collaborators.includes(currentUserEmail as string) || currentUserEmail === creatorEmail) && (
                    <StyledLink to={`edit/${taskId}`}><Button src={editIcon} /></StyledLink>
                )}
                <Button src={deleteIcon} onClick={() => deleteTask(taskId)} />
            </ActionButtons>
            <TaskName to={`${taskId}`}>{name}</TaskName>
            <Description>{description}</Description>
        </IssueItem>
    );
};

export default AgileBoard;