import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Boring from './components/FirstImpression/Boring.jsx'
import BrainRot from './components/SecondImpression/BrainRot.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <Boring />
      },
      {
        path: 'chat',
        element: <BrainRot />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
 
)
