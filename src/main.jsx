import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { BookingsProvider } from './context/BookingsContext.jsx'
import { CourtsProvider } from './context/CourtsContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CourtsProvider>
        <BookingsProvider>
          <App />
        </BookingsProvider>
      </CourtsProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
