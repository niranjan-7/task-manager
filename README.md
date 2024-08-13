# The Task Manager

## Question
https://unstop.com/p/mern-mania-hackathon-lucid-growth-1050121

## _Technologies Used_
- Mongo DB(Database)
- Node and Express
- React JS adn Typescript
- hello-pangea/dnd(Drag and Drop library)
- Clerk Authentication(Google authentication)
- Google Icons
- Google fonts
- styled components(CSS)
- Vercel(Frontend Deployment) 
- Render(Backend Deployment)
 

## Features

- Handle Tasks with multiple status , priority and other fields
- Access Validation for different roles for a Task
- Drag and Drop feature across different status 
- Notifications for every action to Viewers, Collaborators , Creator 
- Use Email address or Goggle Account to Login

## Backend Structure 

#### Task Service

```
  name: String, - Name of the Task
  description: String, - Description of the Task
  dueDate: UTC, - Due Date of the Task
  priority: 'Low' | 'Medium' | 'High', - Priority of the Task
  status: 'Pending' | 'In Progress' | 'Completed', - Status of the Task
  creatorEmail: String, - Creator Email
  collaborators?: String[], - Collaborators Emails
  viewers?: String[], - Viewers Emails
```

#### Notification Service

```
  message: String, - Message of the Notification
  taskId: String(ref - Task Table), 
  users:String[], - Users who need to be Notified
  updates?: [{
    field: String,
    oldValue: String,
    newValue: String
  }] - The field which is updated and its old value and new value of the Update
```

## Access Validation

Every user can view all the tasks

For each task , every user has three roles

- Viewer
- Collaborator
- Creator

If you are not related to the Task , you can just view it . But wont get notifications of the task.

#### Viewer

- Viewer gets updates through notifications related to the task

#### Collaborator

- Collaborator can edit the task , update the status of the task and other fields as well .

- he can’t delete the task

- can get notifications 

#### Creator

- can get notifications reg the task

- can edit 

- can delete

## Folder Structure
```md
project-root/
├── client/
│   ├── node_modules/
│   ├── task-manager-frontend/
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   │   ├── Board.tsx
│   │   │   │   ├── CreateTask.tsx
│   │   │   │   ├── EditTask.tsx
│   │   │   │   ├── Notifications.tsx
│   │   │   │   ├── Task.tsx
│   │   │   │   ├── TaskDetail.tsx
│   │   │   │   ├── TaskForm.tsx
│   │   │   │   └── TaskList.tsx
│   │   │   ├── config/
│   │   │   │   └── api.ts
│   │   │   ├── layouts/
│   │   │   │   ├── dashboard-layout.tsx
│   │   │   │   └── root-layout.tsx
│   │   │   ├── routes/
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   └── sign-in.tsx
│   │   │   ├── main.tsx
│   │   │   ├── .gitignore
│   │   │   ├── README.md
│   │   │   ├── index.html
│   │   │   ├── package-lock.json
│   │   │   ├── package.json
│   ├── server/
│   │   ├── config/
│   │   │   └── config.js
│   │   ├── controllers/
│   │   │   ├── notificationController.js
│   │   │   └── taskController.js
│   │   ├── models/
│   │   │   ├── Notification.js
│   │   │   └── Task.js
│   │   ├── routes/
│   │   │   ├── notificationRoutes.js
│   │   │   └── taskRoutes.js
│   │   ├── node_modules/
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── server.js
│   │   ├── .gitignore
│   │   └── README.md
└── .gitignore
```

## Installation

Clone the repo 

```sh
git clone https://github.com/niranjan-7/task-manager.git
```

Build the backend
```sh
cd server
npm install
```

Start the Backend
```sh
npm start
```

Open the frontend and install the dependencies
```sh
cd ../client/task-manager-frontend
npm install
```
Open the _api.ts_ file and add the port your backend is running. Otherwise it automatically uses the hosted backend

Start the frontend
```sh
npm run dev
```

# THANK YOU




