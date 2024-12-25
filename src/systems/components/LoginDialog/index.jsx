// src/contents/LoginDialog.js

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    Button,
    Typography,
    Link,
    Box,
    InputAdornment,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../../components/BaseComponent/mergeSpec'; // Utility functions for merging specs
import { useMediator } from '../../contexts/MediatorContext'; // Hook to access mediator via Context
import { useTheme } from '@mui/material/styles'; // Hook to access MUI theme

/**
 * LoginDialog Functional Component
 * 
 * Provides a login dialog for user authentication.
 * Handles user input for email and password, performs validation, and manages login actions.
 * 
 * Integrates with a mediator for event-driven communication, subscribing to system events
 * and publishing user-related events.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.name - The unique name of the LoginDialog component.
 * @param {string} props.code - A short code representing the LoginDialog component.
 * @param {string} props.description - A brief description of the LoginDialog component.
 * @param {Object} [props.extendedSubscriptionSpec={}] - Extended subscription specifications for additional events.
 * @param {Object} [props.extendedPublishSpec={}] - Extended publication specifications for additional events.
 * @param {boolean} props.open - Controls whether the dialog is open.
 * @param {Function} props.onClose - Function to close the dialog.
 * @param {Function} props.onLogin - Function to handle successful login.
 * @returns {JSX.Element} The rendered LoginDialog component.
 */
const LoginDialog = ({
    name,
    code,
    description,
    extendedSubscriptionSpec = {},
    extendedPublishSpec = {},
    open, // Controls whether the dialog is open
    onClose, // Function to close the dialog
    onLogin, // Function to handle successful login
}) => {
    const mediator = useMediator(); // Access mediator via Context
    const theme = useTheme(); // Access MUI theme for styling

    // State management for form inputs and validation
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isMobile, setIsMobile] = useState(false); // New state for responsiveness

    /**
     * Define subscription specifications.
     */
    const initialSubscriptionSpec = {
        subscriptions: [
            {
                channel: "system",
                events: [
                    {
                        name: "start",
                        description: "Handles the application start event to initialize the UI.",
                        dataFormat: {
                            "timestamp": "string (ISO 8601 format)"
                        }
                    },
                    {
                        name: "stop",
                        description: "Handles the application stop event to perform cleanup.",
                        dataFormat: {
                            "timestamp": "string (ISO 8601 format)"
                        }
                    }
                ]
            },
            {
                channel: "ui",
                events: [
                    {
                        name: "windowSizeChange",
                        description: "Handles the application window size change.",
                        dataFormat: {
                            windowSize: {
                                width: "integer",
                                height: "integer",
                            },
                        },
                    },
                ],
            },
        ]
    };

    /**
     * Define publication specifications.
     */
    const initialPublicationSpec = {
        publications: [
            {
                channel: "user",
                event: "login",
                description: "Handles user login events to update the UI accordingly.",
                condition: "User logs in successfully",
                dataFormat: {
                    "userId": "integer",
                    "username": "string",
                    "jwtToken": "string",
                    "jwtRefreshToken": "string",
                    "timestamp": "string (ISO 8601 format)"
                },
                exampleData: {
                    "userId": 1024,
                    "username": "john_doe",
                    "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "jwtRefreshToken": "dGhpc0lzUmVmcmVzaFRva2VuVmFsdWU=",
                    "timestamp": "2024-04-27T10:30:00Z"
                }
            },
            {
                channel: "user",
                event: "logout",
                description: "Handles user logout events to update the UI accordingly.",
                condition: "User logs out successfully",
                dataFormat: {
                    "userId": "integer",
                    "jwtToken": "string",
                    "jwtRefreshToken": "string",
                    "timestamp": "string (ISO 8601 format)"
                },
                exampleData: {
                    "userId": 1234,
                    "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "jwtRefreshToken": "VGhpcyBpcyBhIHNhbXBsZSByZWZyZXNoIHRva2Vu",
                    "timestamp": "2024-04-27T12:45:00Z"
                },
            }
        ]
    };

    /**
     * Merge the subscription and publication specifications with any extended specs.
     */
    const mergedSubscriptionSpec = mergeSubscriptionSpecs(initialSubscriptionSpec, extendedSubscriptionSpec);
    const mergedPublicationSpec = mergePublicationSpecs(initialPublicationSpec, extendedPublishSpec);

    /**
     * Define custom event handlers specific to LoginDialog.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const eventHandlers = {
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'ui:windowSizeChange': handleWindowSizeChange, // Newly added handler
    };

    /**
     * Handler for 'system:start' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStart(data) {
        console.log(`LoginDialog (${data.componentName}) received 'system:start' event with data:`, data.data);
        // Implement additional logic for handling the start event if needed
    }

    /**
     * Handler for 'system:stop' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`LoginDialog (${data.componentName}) received 'system:stop' event with data:`, data.data);
        // Implement additional logic for handling the stop event if needed
    }

    /**
     * Handler for 'ui:windowSizeChange' event.
     * Adjusts the dialog's layout based on the new window size.
     * 
     * @param {Object} data - The data associated with the event.
     * @param {Object} data.windowSize - The new window dimensions.
     * @param {number} data.windowSize.width - The new window width.
     * @param {number} data.windowSize.height - The new window height.
     */
    function handleWindowSizeChange(data) {
        const { windowSize } = data.data;
        const { width } = windowSize;

        console.log(`LoginDialog (${data.componentName}) received 'ui:windowSizeChange' event with width: ${width}px`);

        const breakpoint = 600; // Example breakpoint in pixels

        if (width < breakpoint && !isMobile) {
            setIsMobile(true); // Switch to mobile layout
        } else if (width >= breakpoint && isMobile) {
            setIsMobile(false); // Switch back to desktop layout
        }
    }

    /**
     * Handle incoming events from the mediator.
     * Determines the correct handler based on channel and event name.
     * 
     * @param {Object} params - Parameters passed by the mediator.
     * @param {string} params.channel - The channel of the event.
     * @param {string} params.event - The name of the event.
     * @param {Object} params.data - The data associated with the event.
     */
    const handleEvent = ({ componentName, componentCode, channel, event, data, timestamp }) => {
        const handlerKey = `${channel}:${event}`;
        console.log(`LoginDialog: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2));
        if (typeof eventHandlers[handlerKey] === 'function') {
            eventHandlers[handlerKey]({ componentName, componentCode, channel, event, data, timestamp });
        } else {
            console.warn(`No handler implemented for event '${event}' on channel '${channel}' in LoginDialog.`);
        }
    };

    /**
     * Register the component with the mediator upon mounting and unregister upon unmounting.
     */
    useEffect(() => {
        mediator.register({
            name,
            code,
            description,
            getSubscriptionSpec: () => mergedSubscriptionSpec,
            getPublicationSpec: () => mergedPublicationSpec,
            handleEvent,
            getComponentFullSpec: () => ({
                name,
                code,
                description,
                subscriptionSpec: mergedSubscriptionSpec,
                publicationSpec: mergedPublicationSpec,
            }),
            initialize: () => {
                console.log(`LoginDialog (${name}) initialized.`);
                // Additional initialization logic if needed
            },
            destroy: () => {
                console.log(`LoginDialog (${name}) destroyed.`);
                // Additional cleanup logic if needed
            },
        });

        // Cleanup function to unregister the component on unmount
        return () => {
            mediator.unregister({
                name,
                code,
                description,
                getSubscriptionSpec: () => mergedSubscriptionSpec,
                getPublicationSpec: () => mergedPublicationSpec,
                handleEvent,
                getComponentFullSpec: () => ({
                    name,
                    code,
                    description,
                    subscriptionSpec: mergedSubscriptionSpec,
                    publicationSpec: mergedPublicationSpec,
                }),
                initialize: () => {
                    console.log(`LoginDialog (${name}) initialized.`);
                },
                destroy: () => {
                    console.log(`LoginDialog (${name}) destroyed.`);
                },
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

    /**
     * Validates the email format using a regular expression.
     * 
     * @param {string} value - The email string to validate.
     * @returns {boolean} True if the email is valid, false otherwise.
     */
    const validateEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email validation regex
        return emailRegex.test(value);
    };

    /**
     * Handles changes to the email input field.
     * Performs real-time validation and updates the component state accordingly.
     * 
     * @param {Object} e - The event object from the input field.
     */
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);

        // Real-time email validation
        if (!value) {
            setEmailError('Email is required.');
            setIsEmailValid(false);
        } else if (!validateEmail(value)) {
            setEmailError('Please enter a valid email address.');
            setIsEmailValid(false);
        } else {
            setEmailError('');
            setIsEmailValid(true);
        }
    };

    /**
     * Handles changes to the password input field.
     * Performs real-time validation and updates the component state accordingly.
     * 
     * @param {Object} e - The event object from the input field.
     */
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);

        // Real-time password validation
        if (!value) {
            setPasswordError('Password is required.');
            setIsPasswordValid(false);
        } else if (value.length < 8) {
            setPasswordError('Password must be at least 8 characters long.');
            setIsPasswordValid(false);
        } else {
            setPasswordError('');
            setIsPasswordValid(true);
        }
    };

    /**
     * Handles the login action when the user clicks the "Login" button.
     * Validates the inputs and triggers the onLogin prop function if valid.
     */
    const handleLogin = () => {
        let isValid = true;

        // Validate email input
        if (!email || !isEmailValid) {
            setEmailError('Please enter a valid email address.');
            isValid = false;
        }

        // Validate password input
        if (!password || !isPasswordValid) {
            setPasswordError('Password must be at least 8 characters long.');
            isValid = false;
        }

        if (isValid) {
            // Optionally, perform authentication logic here (e.g., API call)
            // For demonstration, we'll simulate a successful login and publish an event

            // Example payload for the login event
            const loginData = {
                userId: 1024, // Example user ID
                username: email.split('@')[0], // Extract username from email
                jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // Example token
                jwtRefreshToken: 'dGhpc0lzUmVmcmVzaFRva2VuVmFsdWU=', // Example refresh token
                timestamp: new Date().toISOString(), // Current timestamp
            };

            // Publish the 'login' event
            mediator.publish(name, code, "user", "login", loginData, Date.now());

            // Trigger the onLogin prop function to update the UI accordingly
            onLogin();

            // Close the dialog
            onClose();
        }
    };

    /**
     * Handles the "Forgot Password?" link click.
     * Redirects the user to the password reset process.
     * Currently, it displays an alert as a placeholder.
     */
    const handleForgotPassword = (e) => {
        e.preventDefault(); // Prevent default link behavior
        alert('Redirect to password reset'); // Placeholder for forgot password logic
        // In a real application, you would redirect to the password reset page or open a reset dialog
    };

    /**
     * Handles the cancel action when the user clicks the "Cancel" button.
     * Closes the login dialog without performing any actions.
     */
    const handleCancel = () => {
        onClose(); // Close the dialog
    };

    /**
     * useEffect Hook to reset form fields when the dialog is opened.
     * This ensures that previous inputs are cleared when the dialog is reopened.
     */
    useEffect(() => {
        if (open) {
            // Reset all form fields and validation states
            setEmail('');
            setPassword('');
            setEmailError('');
            setPasswordError('');
            setIsEmailValid(false);
            setIsPasswordValid(false);
            setIsMobile(false); // Reset responsiveness state
        }
    }, [open]); // Runs whenever the 'open' prop changes

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={isMobile ? 'xs' : 'sm'} // Adjust dialog size based on window size
            fullWidth
            aria-labelledby="login-dialog-title"
            aria-describedby="login-dialog-description"
        >
            <DialogTitle id="login-dialog-title">
                <Typography
                    variant={isMobile ? "h6" : "h5"} // Adjust typography based on window size
                    align="center"
                    sx={{
                        fontWeight: 'bold',
                        color: theme.palette.menu.menuText, // Use theme's menu text color
                    }}
                    component="div" // Prevents rendering as <h5>
                >
                    Welcome Back!
                </Typography>
            </DialogTitle>
            <DialogContent id="login-dialog-description">
                <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                margin="normal"
                                value={email}
                                onChange={handleEmailChange}
                                error={!!emailError}
                                helperText={emailError}
                                required
                                variant="outlined"
                                InputProps={{
                                    endAdornment: isEmailValid && (
                                        <InputAdornment position="end">
                                            <CheckCircleIcon sx={{ color: 'green' }} /> {/* Icon indicating valid input */}
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        backgroundColor: theme.palette.background.paper, // Use theme's paper background color
                                        borderRadius: '4px', // Rounded corners
                                        '& .MuiOutlinedInput-input': { // Target the input element within the outlined input
                                            color: theme.palette.text.primary, // Use theme's primary text color
                                        },
                                        '& .MuiOutlinedInput-root': { // Ensure the label and other elements also respect the color
                                            '& fieldset': {
                                                borderColor: theme.palette.primary.main, // Use theme's primary main color for the border
                                            },
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.dark, // Use theme's primary dark color on hover
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: theme.palette.primary.main, // Maintain primary color when focused
                                            },
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Password"
                                type="password"
                                fullWidth
                                margin="normal"
                                value={password}
                                onChange={handlePasswordChange}
                                error={!!passwordError}
                                helperText={passwordError}
                                required
                                variant="outlined"
                                InputProps={{
                                    endAdornment: isPasswordValid && (
                                        <InputAdornment position="end">
                                            <CheckCircleIcon sx={{ color: 'green' }} /> {/* Icon indicating valid input */}
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        backgroundColor: theme.palette.background.paper, // Use theme's paper background color
                                        borderRadius: '4px', // Rounded corners
                                        '& .MuiOutlinedInput-input': { // Target the input element within the outlined input
                                            color: theme.palette.text.primary, // Use theme's primary text color
                                        },
                                        '& .MuiOutlinedInput-root': { // Ensure the label and other elements also respect the color
                                            '& fieldset': {
                                                borderColor: theme.palette.primary.main, // Use theme's primary main color for the border
                                            },
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.dark, // Use theme's primary dark color on hover
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: theme.palette.primary.main, // Maintain primary color when focused
                                            },
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary" // Use theme's primary color
                                fullWidth
                                onClick={handleLogin}
                                sx={{
                                    marginTop: '16px',
                                    padding: '12px',
                                    borderRadius: '4px',
                                    backgroundColor: theme.palette.primary.main, // Use theme's primary main color
                                    color: theme.palette.primary.contrastText, // Use theme's primary contrast text color
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.dark, // Use theme's primary dark color on hover
                                    },
                                }}
                                aria-label="Login"
                            >
                                Login
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                color="secondary" // Use theme's secondary color
                                fullWidth
                                onClick={handleCancel}
                                sx={{
                                    marginTop: '8px',
                                    padding: '12px',
                                    borderRadius: '4px',
                                    borderColor: theme.palette.secondary.main, // Use theme's secondary main color for border
                                    color: theme.palette.secondary.main, // Use theme's secondary main color for text
                                    '&:hover': {
                                        borderColor: theme.palette.secondary.dark, // Use theme's secondary dark color on hover
                                        backgroundColor: theme.palette.action.hover, // Use theme's action hover color
                                    },
                                }}
                                aria-label="Cancel"
                            >
                                Cancel
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography align="center" sx={{ marginTop: '8px' }}>
                                <Link
                                    href="#"
                                    onClick={handleForgotPassword}
                                    underline="hover"
                                    sx={{
                                        color: theme.palette.primary.main, // Use theme's primary main color
                                        fontWeight: 'bold',
                                        '&:hover': {
                                            color: theme.palette.primary.dark, // Use theme's primary dark color on hover
                                        },
                                    }}
                                    aria-label="Forgot Password"
                                >
                                    Forgot Password?
                                </Link>
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
        </Dialog>
    )
};

/**
 * Defines PropTypes for the LoginDialog functional component.
 * Ensures that the component receives the correct types of props.
 * This enhances type safety and aids in catching bugs during development.
 */
LoginDialog.propTypes = {
    name: PropTypes.string.isRequired,                  // The unique name of the LoginDialog instance
    code: PropTypes.string.isRequired,                  // The unique code identifier for the LoginDialog
    description: PropTypes.string.isRequired,           // A brief description of the LoginDialog
    extendedPublishSpec: PropTypes.object,              // Extended publish specifications for additional events
    extendedSubscriptionSpec: PropTypes.object,         // Extended subscription specifications for additional events

    open: PropTypes.bool.isRequired,                     // Controls whether the dialog is open
    onClose: PropTypes.func.isRequired,                  // Function to close the dialog
    onLogin: PropTypes.func.isRequired,                  // Function to handle successful login
};

export default React.memo(LoginDialog);
