import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
 
import RootLayout from './layouts/root-layout'
import DashboardLayout from './layouts/dashboard-layout'

import IndexPage from './routes'
import SignInPage from './routes/sign-in'
import DashboardPage from './routes/dashboard'
import CreateTask from './components/CreateTask'
import TaskDetail from './components/TaskDetail'
import EditTask from './components/EditTask'


const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <IndexPage /> },
      { path: "/sign-in/*", element: <SignInPage /> },
      {
        element: <DashboardLayout />,
        path: "dashboard",
        children: [
          { path: "/dashboard/tasks", element: <DashboardPage/> },
          { path: "/dashboard/tasks/:taskId", element: <TaskDetail /> },
          { path: "/dashboard/tasks/edit/:taskId", element: <EditTask /> },
          {path: "/dashboard/create-task", element: <CreateTask />}
        ]
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)