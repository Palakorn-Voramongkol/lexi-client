import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import MainPage from './systems/pages/MainPage' // Ensure the correct path
import theme from './systems/theme'
import CssBaseline from '@mui/material/CssBaseline'
import ErrorBoundary from './systems/components/ErrorBoundary' // Optional: To catch rendering errors
import { licenseKey } from './devextreme-license'
import config from 'devextreme/core/config'
import './styles.css'
import 'devextreme/dist/css/dx.light.css'
// import '@fortawesome/fontawesome-free/css/all.min.css';
import './assets/fontawesome/css/fontawesome.css';
import './assets/fontawesome/css/brands.css';
import './assets/fontawesome/css/solid.css';


config({
    licenseKey,
})

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> 
            <ErrorBoundary>
                <MainPage
                    name="Application Main Page"
                    code="sys_mainPage"
                    pageTitle="Lexi2 v0.1"
                    description="The Lexi2 application main page"
                    extendedSubscriptionSpec={
                        {
                            /* Any additional subscriptions */
                        }
                    }
                    extendedPublishSpec={
                        {
                            /* Any additional publications */
                        }
                    }
                />
            </ErrorBoundary>
        </ThemeProvider>
    )
}

export default App
