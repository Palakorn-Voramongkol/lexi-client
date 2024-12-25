import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import MediatorProvider from './systems/mediators/MediatorProvider'

const root = ReactDOM.createRoot(document.getElementById('root'))
const queryClient = new QueryClient()

root.render(
    //<React.StrictMode>
    <QueryClientProvider client={queryClient}>
        <MediatorProvider
            name="Application Mediator"
            code="sys_appMediator"
            description="Handles application-wide pub/sub events."
            extendedPublishSpec={
                {
                    /* Additional publish specs */
                }
            }
            extendedSubscriptionSpec={
                {
                    /* Additional subscribe specs */
                }
            }
        >
            <App />
        </MediatorProvider>
    </QueryClientProvider>
    //</React.StrictMode>,
)

reportWebVitals()
