import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import editIcon from '../../assets/edit_note_24dp.svg';
import delteIcon from '../../assets/delete_24dp.svg';
import { API_SERVER } from '../../config/api';
import { useUser } from '@clerk/clerk-react';
import { Draggable } from 'react-beautiful-dnd';

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
    );
};
