import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        // Update state to render fallback UI on the next render
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can log the error to an error reporting service here
        console.error('ErrorBoundary caught an error', error, errorInfo);
    }

    handleGoHome = () => {
        // Navigate to the homepage
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Render a professional fallback UI
            return (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="100vh"
                    bgcolor="#f9f9f9"
                    padding={2}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            padding: { xs: '1.5rem', sm: '2rem' },
                            textAlign: 'center',
                            maxWidth: '400px',
                            width: '100%',
                        }}
                    >
                        <Stack spacing={2} alignItems="center">
                            <Typography variant="h2" color="error">
                                Oops!
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                Something went wrong. We apologize for the inconvenience.
                            </Typography>
                            <SentimentVeryDissatisfiedIcon
                                sx={{ fontSize: '25rem', color: '#f44336' }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={this.handleGoHome}
                                sx={{ marginTop: '1rem' }}
                            >
                                Go to Homepage
                            </Button>
                        </Stack>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
