import React, { useEffect, useState } from 'react';
import editIcon from '../../assets/edit_note_24dp.svg';
import deleteIcon from '../../assets/delete_24dp.svg';
import { useUser } from '@clerk/clerk-react';
import { API_SERVER } from '../../config/api';
import { useNavigate } from 'react-router-dom';
// import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
import { DragDropContext,Draggable,Droppable } from '@hello-pangea/dnd';
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
import axios from 'axios';

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

    const onDragEnd = async (result:any, columns:any, setColumns:any) => {
        if (!result.destination) return;
        const { source, destination } = result;
      
        if (source.droppableId !== destination.droppableId) {
          const sourceColumn = columns[source.droppableId];
          const destColumn = columns[destination.droppableId];
          const sourceItems = [...sourceColumn.items];
          const destItems = [...destColumn.items];
          const [removed] = sourceItems.splice(source.index, 1);
          destItems.splice(destination.index, 0, removed);
          setColumns({
            ...columns,
            [source.droppableId]: {
              ...sourceColumn,
              items: sourceItems
            },
            [destination.droppableId]: {
              ...destColumn,
              items: destItems
            }
          });
          console.log(removed,destColumn,{...removed,status:destColumn.name});
          try {
            await axios.put(API_SERVER+`/api/tasks/${removed._id}`, {...removed,status:destColumn.name});
            navigate('/dashboard/tasks'); 
          } catch (error) {
            console.error('Error updating task:', error);
          }
        } else {
          const column = columns[source.droppableId];
          const copiedItems = [...column.items];
          const [removed] = copiedItems.splice(source.index, 1);
          copiedItems.splice(destination.index, 0, removed);
          setColumns({
            ...columns,
            [source.droppableId]: {
              ...column,
              items: copiedItems
            }
          });
        }
      };
    

    return (
        <>
        {
            isLoading?<>
            </>
            :<>
            <Board>
            <FilterButton onClick={() => navigate('/dashboard/create-task')}>Add a Task</FilterButton>
            <ColumnBox>
                <DragDropContext onDragEnd={(result)=>onDragEnd(result, columns, setColumns)}>
                    {Object.entries(columns).map(([columnId, column]) => {
                        return(
                        <Column key={columnId}>
                            <ColumnTitle>{column.name}</ColumnTitle>
                            <Droppable droppableId={columnId}>
                                {(provided) => {
                                    return(
                                    <IssueList ref={provided.innerRef} {...provided.droppableProps}>
                                        {column.items.map((task, index) => (
                                            <Draggable key={task._id} draggableId={task._id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <IssueItem type={task.priority} >
                                                            <DueTime>{calculateTimeLeft(task.dueDate).message}</DueTime>
                                                            <Creator>{task.creatorEmail}</Creator>
                                                            <ActionButtons>
                                                                {(task.collaborators.includes(currentUserEmail as string) || currentUserEmail === task.creatorEmail) && (
                                                                    <StyledLink to={`edit/${task._id}`}><Button src={editIcon} /></StyledLink>
                                                                )}
                                                                <Button src={deleteIcon} onClick={() => deleteTask(task._id)} />
                                                            </ActionButtons>
                                                            <TaskName to={`${task._id}`}>{task.name}</TaskName>
                                                            <Description>{task.description}</Description>
                                                        </IssueItem>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </IssueList>
                                )}}
                            </Droppable>
                        </Column>
                        )
                    })}
                </DragDropContext>
            </ColumnBox>
        </Board>
            </>
        }
        </>
        
    );
};

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


export default AgileBoard;