import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './App.css'
import { BreadcrumbProvider } from './layout/LayoutBreadcrumb.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BreadcrumbProvider>
        <App />
    </BreadcrumbProvider>
  </React.StrictMode>,
)
