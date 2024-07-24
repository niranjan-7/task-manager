import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as yup from 'yup';
import { addMonths, isAfter, isToday, isValid } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import closeIcon from '../assets/close_24dp.svg';

interface TaskFormProps {
  initialTask?: Task;
  onSubmit: (task: Task) => void;
  submitButtonText: string;
  creatorEmail: string;
}

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

const validationSchema = yup.object().shape({
  name: yup.string().max(30, 'Name must be at most 30 characters').required('Name is required'),
  description: yup.string().max(60, 'Description must be at most 60 characters'),
  dueDate: yup
    .date()
    .transform(parseDateString)
    .test('is-today-or-later', 'Due Date must be today or later', (value: any) => isTodayOrLater(value))
    .max(addMonths(new Date(), 6), 'Due Date cannot be more than 6 months in the future')
    .required('Due Date is required'),
  priority: yup.string().oneOf(['Low', 'Medium', 'High'], 'Invalid Priority').required('Priority is required'),
  status: yup.string().oneOf(['Pending', 'In Progress', 'Completed'], 'Invalid Status').required('Status is required'),
  collaborators: yup.array().of(yup.string().email('Invalid Email Format').required('Email is required')),
  viewers: yup.array().of(yup.string().email('Invalid Email Format').required('Email is required')),
});

function parseDateString(value: any, originalValue: any) {
  console.log(value);
  const parsedDate = originalValue ? new Date(originalValue) : null;
  return isValid(parsedDate) ? parsedDate : new Date('invalid');
}

function isTodayOrLater(date: Date) {
  return isAfter(date, new Date()) || isToday(date);
}

const TaskForm: React.FC<TaskFormProps> = ({ initialTask, onSubmit, submitButtonText, creatorEmail }) => {
  const [name, setName] = useState(initialTask?.name || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [dueDate, setDueDate] = useState(initialTask?.dueDate.split('T')[0] || '');
  const [priority, setPriority] = useState(initialTask?.priority || 'Low');
  const [status, setStatus] = useState(initialTask?.status || 'Pending');
  const [collaborators, setCollaborators] = useState<string[]>(initialTask?.collaborators || []);
  const [viewers, setViewers] = useState<string[]>(initialTask?.viewers || []);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [newViewer, setNewViewer] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (initialTask) {
      setName(initialTask.name);
      setDescription(initialTask.description);
      setDueDate(initialTask.dueDate.split('T')[0]);
      setPriority(initialTask.priority);
      setStatus(initialTask.status);
      setCollaborators(initialTask.collaborators || []);
      setViewers(initialTask.viewers || []);
    }
  }, [initialTask]);

  const handleAddCollaborator = () => {
    if (newCollaborator.trim() === '' || newCollaborator === creatorEmail) return;
    if (collaborators.includes(newCollaborator)) return;
    setCollaborators((prev) => [...prev, newCollaborator.trim()]);
    setViewers((prev) => prev.filter((viewer) => viewer !== newCollaborator.trim()));
    setNewCollaborator('');
  };

  const handleRemoveCollaborator = (index: number) => {
    const updatedCollaborators = [...collaborators];
    updatedCollaborators.splice(index, 1);
    setCollaborators(updatedCollaborators);
  };

  const handleAddViewer = () => {
    if (newViewer.trim() === '' || newViewer === creatorEmail || collaborators.includes(newViewer)) return;
    if (viewers.includes(newViewer)) return;
    setViewers((prev) => [...prev, newViewer.trim()]);
    setNewViewer('');
  };

  const handleRemoveViewer = (index: number) => {
    const updatedViewers = [...viewers];
    updatedViewers.splice(index, 1);
    setViewers(updatedViewers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await validationSchema.validate(
        {
          name,
          description,
          dueDate,
          priority,
          status,
          collaborators, 
          viewers,
        },
        { abortEarly: false }
      );

      const task: Task = {
        name,
        description,
        dueDate,
        priority,
        status,
        collaborators,
        viewers,
        creatorEmail,
      };

      onSubmit(task);

      setName('');
      setDescription('');
      setDueDate('');
      setPriority('Low');
      setStatus('Pending');
      setCollaborators([]);
      setViewers([]);
      setNewCollaborator('');
      setNewViewer('');
      setErrors({});
      navigate('/dashboard/tasks');
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: { [key: string]: string } = {};
        err.inner.forEach((e: any) => {
          if (!validationErrors[e.path]) {
            validationErrors[e.path] = e.message;
          }
        });
        setErrors(validationErrors);
      }
    }
  };

  return (
    <>
      <EmptyDiv></EmptyDiv>
      <FormContainer>
        <FormTitle>{submitButtonText} Task</FormTitle>
        <Form onSubmit={handleSubmit}>
          <FormGrid>
            <LeftColumn>
              <FormGroup>
                <Label>Name</Label>
                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
              </FormGroup>
              <FormGroup>
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
              </FormGroup>
              <FormGroup>
                <Label>Due Date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                {errors.dueDate && <ErrorMessage>{errors.dueDate}</ErrorMessage>}
              </FormGroup>
            </LeftColumn>
            <RightColumn>
              <FormGroup>
                <Label>Priority</Label>
                <StyledSelect value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </StyledSelect>
                {errors.priority && <ErrorMessage>{errors.priority}</ErrorMessage>}
              </FormGroup>
              <FormGroup>
                <Label>Status</Label>
                <StyledSelect value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </StyledSelect>
                {errors.status && <ErrorMessage>{errors.status}</ErrorMessage>}
              </FormGroup>
              <FormGroup>
                <Label>Collaborators</Label>
                <ChipContainer>
                  {collaborators.map((collaborator, index) => (
                    <Chip key={index}>
                      {collaborator}
                      <ChipClose onClick={() => handleRemoveCollaborator(index)}><img src={closeIcon} height='15px' /></ChipClose>
                    </Chip>
                  ))}
                </ChipContainer>
                <Input
                  type="text"
                  value={newCollaborator}
                  onChange={(e) => setNewCollaborator(e.target.value)}
                  placeholder="Enter email"
                />
                <Button
                  type="button"
                  onClick={handleAddCollaborator}
                  disabled={
                    newCollaborator === creatorEmail ||
                    collaborators.includes(newCollaborator)
                  }
                >
                  Add Collaborator
                </Button>
                
                {errors.collaborators && <ErrorMessage>{errors.collaborators}</ErrorMessage>}
              </FormGroup>
              <FormGroup>
                <Label>Viewers</Label>
                <ChipContainer>
                  {viewers.map((viewer, index) => (
                    <Chip key={index}>
                      {viewer}
                      <ChipClose onClick={() => handleRemoveViewer(index)}><img src={closeIcon} height='15px'/></ChipClose>
                    </Chip>
                  ))}
                </ChipContainer>
                {(submitButtonText === 'Create'||user?.primaryEmailAddress?.emailAddress == creatorEmail) && (
                  <>
                    <Input
                      type="text"
                      value={newViewer}
                      onChange={(e) => setNewViewer(e.target.value)}
                      placeholder="Enter email"
                    />
                    <Button
                      type="button"
                      onClick={handleAddViewer}
                      disabled={
                        newViewer === creatorEmail ||
                        viewers.includes(newViewer) ||
                        collaborators.includes(newViewer)
                      }
                    >
                      Add Viewer
                    </Button>
                  </>
                )}
                {submitButtonText === 'Update' &&
                  user?.primaryEmailAddress?.emailAddress !== creatorEmail &&
                  !collaborators.includes(user?.primaryEmailAddress?.emailAddress as string) && (
                    <Button type="button" onClick={handleAddViewer}>
                      Add yourself as a Viewer
                    </Button>
                  )}
                {errors.viewers && <ErrorMessage>{errors.viewers}</ErrorMessage>}
              </FormGroup>
            </RightColumn>
          </FormGrid>
          <Button type="submit">{submitButtonText}</Button>
        </Form>
      </FormContainer>
    </>
  );
};

const EmptyDiv = styled.div`
  min-height: 3rem;
`;

const FormContainer = styled.div`
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
  border: 2px solid #007bff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const Label = styled.label`
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
`;

const StyledSelect = styled.select`
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
  appearance: none;
  background: white;

  &:focus {
    outline: none;
    border-color: #007bff;
  }

  option {
    color: #333;
    background: #fff;
    display: block;
    white-space: nowrap;
    min-height: 20px;
    padding: 5px;
  }
`;

const Button = styled.button<{disabled?:boolean}>`
  padding: 10px;
  background-color: ${(props: { disabled?: boolean }) => (props.disabled ? '#ccc' : '#007bff')};
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: ${(props: { disabled?: boolean }) => (props.disabled ? 'not-allowed' : 'pointer')};
  flex: 0.5;

  &:hover {
    background-color: ${(props: { disabled?: boolean }) => (props.disabled ? '#ccc' : '#0056b3')};
  }
`;



const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const Chip = styled.div`
  background-color: #f0f0f0;
  color: #333;
  padding: 5px 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
`;

const ChipClose = styled.span`
  margin-left: 5px;
  cursor: pointer;
`;

const ErrorMessage = styled.span`
  color: red;
  font-size: 12px;
`;

export default TaskForm;
