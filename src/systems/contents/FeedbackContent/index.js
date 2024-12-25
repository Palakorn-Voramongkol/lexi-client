// src/systems/contents/FeedbackPage.js

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Typography,
    Box,
    Tabs,
    Tab,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    Snackbar,
    Alert,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Paper,
    Divider,
    Tooltip,
    Rating,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useMediator } from '../../contexts/MediatorContext';
import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../../components/BaseComponent/mergeSpec'; // Utility functions to merge specs

/**
 * TabPanel Component
 * 
 * A helper component to render the content of each tab.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The content to display within the tab.
 * @param {number} props.value - The current active tab index.
 * @param {number} props.index - The index of the TabPanel.
 * @returns {JSX.Element} The rendered TabPanel component.
 */
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`feedback-tabpanel-${index}`}
            aria-labelledby={`feedback-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

/**
 * a11yProps Function
 * 
 * Generates accessibility properties for each Tab.
 * 
 * @param {number} index - The index of the tab.
 * @returns {Object} The accessibility properties.
 */
function a11yProps(index) {
    return {
        id: `feedback-tab-${index}`,
        'aria-controls': `feedback-tabpanel-${index}`,
    };
}

/**
 * FeedbackPage Functional Component
 * 
 * Provides a user interface for submitting and viewing feedback.
 * Integrates with the mediator for event-driven communication.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.name - The unique name of the FeedbackPage instance.
 * @param {string} props.code - The unique code identifier for the FeedbackPage.
 * @param {string} props.description - A brief description of the FeedbackPage.
 * @param {Object} [props.extendedSubscriptionSpec={}] - Extended subscription specifications for additional events.
 * @param {Object} [props.extendedPublishSpec={}] - Extended publication specifications for additional events.
 * @returns {JSX.Element} The rendered FeedbackPage component.
 */
const FeedbackPage = ({
    name,
    code,
    description,
    extendedSubscriptionSpec = {},
    extendedPublishSpec = {},
}) => {
    const mediator = useMediator(); // Access mediator via Context

    /**
     * Define initial subscription specifications.
     * FeedbackPage subscribes to relevant system and feedback events.
     */
    const initialSubscriptionSpec = {
        subscriptions: [
            {
                channel: 'system', // Channel name for system-level events
                events: [
                    {
                        name: 'start', // Event name indicating the start of the application
                        description: 'Handles the application start event to initialize the UI.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                        },
                    },
                    {
                        name: 'stop', // Event name indicating the stop of the application
                        description: 'Handles the application stop event to perform cleanup.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                        },
                    },
                ],
            },
            // Add other channels and events as needed
        ],
    };

    /**
     * Define publication specifications.
     * FeedbackPage publishes events when a user submits feedback.
     */
    const publicationSpec = {
        publications: [
            {
                channel: 'feedback', // Channel name for feedback-related events
                event: 'feedbackSubmitted', // Event name indicating feedback submission
                description: 'Publishes an event when the user submits new feedback.',
                condition: 'When the user successfully submits feedback.',
                dataFormat: {
                    userId: 'string',
                    feedback: 'object',
                    timestamp: 'string (ISO 8601 format)',
                },
                exampleData: {
                    userId: 'user-12345',
                    feedback: {
                        title: 'App Crash on Login',
                        description: 'The app crashes every time I try to log in.',
                        rating: 1,
                        category: 'Bug',
                    },
                    timestamp: '2024-05-01T14:00:00Z',
                },
            },
            // Add other publications as needed
        ],
    };

    /**
     * Merge the subscription and publication specifications with any extended specs.
     */
    const mergedSubscriptionSpec = mergeSubscriptionSpecs(
        initialSubscriptionSpec,
        extendedSubscriptionSpec
    );
    const mergedPublicationSpec = mergePublicationSpecs(
        publicationSpec,
        extendedPublishSpec
    );

    /**
     * Define custom event handlers specific to FeedbackPage.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const eventHandlers = {
        'feedback:feedbackResponse': handleFeedbackResponse,
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        // Add other event handlers as needed
    };

    /**
     * Handler for 'feedback:feedbackResponse' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleFeedbackResponse(data) {
        console.log(`FeedbackPage (${data.componentName}) received 'feedback:feedbackResponse' event with data:`, data.data);
        // Implement additional logic for handling feedback responses
        // For example, updating the feedback list or notifying the user
    }

    /**
     * Handler for 'system:start' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStart(data) {
        console.log(`FeedbackPage (${data.componentName}) received 'system:start' event with data:`, data.data);
        // Implement additional logic for handling the start event if needed
    }

    /**
     * Handler for 'system:stop' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`FeedbackPage (${data.componentName}) received 'system:stop' event with data:`, data.data);
        // Implement additional logic for handling the stop event if needed
    }

    /**
     * Registers event handlers with the mediator upon component mount.
     * Also performs any initialization logic, such as fetching existing feedback.
     * Cleans up event handlers upon component unmount.
     */
    useEffect(() => {
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
            console.log(`FeedbackPage: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2));
            if (typeof eventHandlers[handlerKey] === 'function') {
                eventHandlers[handlerKey]({ componentName, componentCode, channel, event, data, timestamp });
            } else {
                console.warn(`FeedbackPage: No handler implemented for event '${event}' on channel '${channel}'`);
            }
        };

        // Register the component with the mediator
        mediator.register({
            name,
            code,
            description,
            getSubscriptionSpec: () => mergedSubscriptionSpec,
            getPublicationSpec: () => mergedPublicationSpec,
            handleEvent, // Pass the handleEvent function to the mediator
            getComponentFullSpec: () => ({
                name,
                code,
                description,
                subscriptionSpec: mergedSubscriptionSpec,
                publicationSpec: mergedPublicationSpec,
            }),
            initialize: () => {
                console.log(`FeedbackPage (${name}) initialized.`);
                // Perform any additional initialization logic here
                // Example: Fetch existing feedback data
                // mediator.publish(name, code, 'feedback', 'fetchFeedback', { userId: code, timestamp: Date.now() });
            },
            destroy: () => {
                console.log(`FeedbackPage (${name}) destroyed.`);
                // Perform any necessary cleanup here
            },
        });

        // Cleanup function to unregister the component when it unmounts
        return () => {
            mediator.unregister({
                name,
                code,
                description,
                getSubscriptionSpec: () => mergedSubscriptionSpec,
                getPublicationSpec: () => mergedPublicationSpec,
                handleEvent, // Ensure to pass the same handleEvent for unregistration
                getComponentFullSpec: () => ({
                    name,
                    code,
                    description,
                    subscriptionSpec: mergedSubscriptionSpec,
                    publicationSpec: mergedPublicationSpec,
                }),
                initialize: () => {
                    console.log(`FeedbackPage (${name}) initialized.`);
                },
                destroy: () => {
                    console.log(`FeedbackPage (${name}) destroyed.`);
                },
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

    /**
     * State to manage the current active tab.
     */
    const [tabIndex, setTabIndex] = useState(0);

    /**
     * Event handler for tab changes.
     * 
     * @param {Object} event - The event object.
     * @param {number} newValue - The index of the selected tab.
     */
    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    /**
     * State to manage feedback submissions.
     */
    const [feedback, setFeedback] = useState({
        title: '',
        description: '',
        rating: 0,
        category: 'General',
    });

    /**
     * Handler for feedback form input changes.
     * 
     * @param {Object} event - The change event.
     */
    const handleFeedbackChange = (event) => {
        const { name, value, type } = event.target;
        setFeedback((prevFeedback) => ({
            ...prevFeedback,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    /**
     * Handler for submitting the feedback form.
     */
    const handleFeedbackSubmit = (event) => {
        event.preventDefault();
        // Validate feedback fields
        if (!feedback.title || !feedback.description) {
            setSnackbar({
                open: true,
                message: 'Please fill out all required fields.',
                severity: 'error',
            });
            return;
        }

        // Publish a 'feedbackSubmitted' event via mediator
        const feedbackData = {
            userId: code, // Assuming 'code' represents the user ID
            feedback: feedback,
            timestamp: new Date().toISOString(),
        };
        mediator.publish(
            name,
            code,
            'feedback',
            'feedbackSubmitted',
            feedbackData,
            Date.now()
        );
        console.log(`FeedbackPage (${name}) published 'feedbackSubmitted' event with data:`, feedbackData);

        // Reset feedback form
        setFeedback({
            title: '',
            description: '',
            rating: 0,
            category: 'General',
        });

        // Show success snackbar
        setSnackbar({
            open: true,
            message: 'Feedback submitted successfully!',
            severity: 'success',
        });
    };

    /**
     * State to manage the list of feedback.
     * This can be populated by subscribing to mediator events or fetching from an API.
     */
    const [feedbackList, setFeedbackList] = useState([
        // Example feedback entries
        {
            id: 1,
            userId: 'user-12345',
            title: 'App Crash on Login',
            description: 'The app crashes every time I try to log in.',
            rating: 1,
            category: 'Bug',
            timestamp: '2024-05-01T14:00:00Z',
        },
        {
            id: 2,
            userId: 'user-67890',
            title: 'Feature Request: Dark Mode',
            description: 'It would be great to have a dark mode option.',
            rating: 4,
            category: 'Suggestion',
            timestamp: '2024-05-02T09:30:00Z',
        },
    ]);

    /**
     * Handler to open the edit feedback dialog.
     * 
     * @param {Object} feedbackItem - The feedback item to edit.
     */
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentFeedback, setCurrentFeedback] = useState(null);

    const handleEditClick = (feedbackItem) => {
        setCurrentFeedback(feedbackItem);
        setEditDialogOpen(true);
    };

    /**
     * Handler to close the edit feedback dialog.
     */
    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setCurrentFeedback(null);
    };

    /**
     * Handler for editing feedback.
     */
    const handleEditFeedback = () => {
        // Implement the logic to update feedback in the backend or state
        // For demonstration, we'll update the local state
        setFeedbackList((prevList) =>
            prevList.map((item) =>
                item.id === currentFeedback.id ? currentFeedback : item
            )
        );

        setEditDialogOpen(false);
        setCurrentFeedback(null);

        // Show success snackbar
        setSnackbar({
            open: true,
            message: 'Feedback updated successfully!',
            severity: 'success',
        });
    };

    /**
     * Handler for deleting feedback.
     * 
     * @param {number} id - The ID of the feedback to delete.
     */
    const handleDeleteFeedback = (id) => {
        // Implement the logic to delete feedback from the backend or state
        // For demonstration, we'll update the local state
        setFeedbackList((prevList) => prevList.filter((item) => item.id !== id));

        // Show success snackbar
        setSnackbar({
            open: true,
            message: 'Feedback deleted successfully!',
            severity: 'success',
        });
    };

    /**
     * State to manage snackbar notifications.
     */
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success', // 'success' | 'error' | 'warning' | 'info'
    });

    /**
     * Handler to close the snackbar notification.
     * 
     * @param {Object} event - The event object.
     * @param {string} reason - The reason for closing the snackbar.
     */
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar((prev) => ({
            ...prev,
            open: false,
        }));
    };

    return (
        <Box sx={{ width: '100%', p: { xs: 2, md: 4 } }}>
            <Typography variant="h4" gutterBottom>
                Feedback
            </Typography>
            <Paper elevation={3} sx={{ mb: 4 }}>
                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    aria-label="feedback tabs"
                    variant="scrollable"
                    scrollButtons="auto"
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label="Submit Feedback" {...a11yProps(0)} />
                    <Tab label="View Feedback" {...a11yProps(1)} />
                </Tabs>
            </Paper>

            {/* Submit Feedback Tab */}
            <TabPanel value={tabIndex} index={0}>
                <Paper elevation={2} sx={{ p: 3, maxWidth: 600 }}>
                    <Typography variant="h6" gutterBottom>
                        Submit New Feedback
                    </Typography>
                    <Box component="form" onSubmit={handleFeedbackSubmit} sx={{ mt: 2 }}>
                        <TextField
                            label="Title"
                            name="title"
                            value={feedback.title}
                            onChange={handleFeedbackChange}
                            required
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={feedback.description}
                            onChange={handleFeedbackChange}
                            required
                            fullWidth
                            multiline
                            rows={4}
                            margin="normal"
                            variant="outlined"
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                            <Typography component="legend">Rating</Typography>
                            <Rating
                                name="rating"
                                value={feedback.rating}
                                onChange={(event, newValue) => {
                                    setFeedback((prev) => ({
                                        ...prev,
                                        rating: newValue,
                                    }));
                                }}
                                sx={{ ml: 2 }}
                            />
                        </Box>
                        <TextField
                            select
                            label="Category"
                            name="category"
                            value={feedback.category}
                            onChange={handleFeedbackChange}
                            SelectProps={{
                                native: true,
                            }}
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        >
                            <option value="General">General</option>
                            <option value="Bug">Bug</option>
                            <option value="Suggestion">Suggestion</option>
                            <option value="Compliment">Compliment</option>
                            {/* Add more categories as needed */}
                        </TextField>
                        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} fullWidth>
                            Submit Feedback
                        </Button>
                    </Box>
                </Paper>
            </TabPanel>

            {/* View Feedback Tab */}
            <TabPanel value={tabIndex} index={1}>
                <Paper elevation={2} sx={{ p: 3, maxWidth: 800 }}>
                    <Typography variant="h6" gutterBottom>
                        Submitted Feedback
                    </Typography>
                    <List>
                        {feedbackList.length === 0 && (
                            <Typography variant="body1">No feedback submitted yet.</Typography>
                        )}
                        {feedbackList.map((item) => (
                            <ListItem key={item.id} alignItems="flex-start" sx={{ mb: 2 }}>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="subtitle1" component="span">
                                                {item.title}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <>
                                            <Typography variant="body2" color="textPrimary">
                                                {item.description}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <Rating value={item.rating} readOnly size="small" />
                                                <Typography variant="caption" sx={{ ml: 1 }}>
                                                    {item.category}
                                                </Typography>
                                            </Box>
                                        </>
                                    }
                                />
                                <Box>
                                    <Tooltip title="Edit Feedback">
                                        <IconButton
                                            edge="end"
                                            aria-label="edit"
                                            onClick={() => handleEditClick(item)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Feedback">
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleDeleteFeedback(item.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </TabPanel>

            {/* Edit Feedback Dialog */}
            <Dialog open={editDialogOpen} onClose={handleEditDialogClose} fullWidth maxWidth="sm">
                <DialogTitle>Edit Feedback</DialogTitle>
                <DialogContent>
                    {currentFeedback && (
                        <Box component="form" sx={{ mt: 2 }}>
                            <TextField
                                label="Title"
                                name="title"
                                value={currentFeedback.title}
                                onChange={(e) =>
                                    setCurrentFeedback((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                    }))
                                }
                                required
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />
                            <TextField
                                label="Description"
                                name="description"
                                value={currentFeedback.description}
                                onChange={(e) =>
                                    setCurrentFeedback((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                required
                                fullWidth
                                multiline
                                rows={4}
                                margin="normal"
                                variant="outlined"
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                <Typography component="legend">Rating</Typography>
                                <Rating
                                    name="rating"
                                    value={currentFeedback.rating}
                                    onChange={(event, newValue) => {
                                        setCurrentFeedback((prev) => ({
                                            ...prev,
                                            rating: newValue,
                                        }));
                                    }}
                                    sx={{ ml: 2 }}
                                />
                            </Box>
                            <TextField
                                select
                                label="Category"
                                name="category"
                                value={currentFeedback.category}
                                onChange={(e) =>
                                    setCurrentFeedback((prev) => ({
                                        ...prev,
                                        category: e.target.value,
                                    }))
                                }
                                SelectProps={{
                                    native: true,
                                }}
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            >
                                <option value="General">General</option>
                                <option value="Bug">Bug</option>
                                <option value="Suggestion">Suggestion</option>
                                <option value="Compliment">Compliment</option>
                                {/* Add more categories as needed */}
                            </TextField>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleEditFeedback} variant="contained" color="primary">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

/**
 * Define PropTypes for type checking.
 * Ensures that the component receives the correct types of props.
 */
FeedbackPage.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the FeedbackPage instance
    code: PropTypes.string.isRequired, // The unique code identifier for the FeedbackPage
    description: PropTypes.string.isRequired, // A brief description of the FeedbackPage
    extendedPublishSpec: PropTypes.object, // Extended publication specifications for additional events
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications for additional events
};

/**
 * Wraps the FeedbackPage component with React.memo to prevent unnecessary re-renders.
 * This optimization enhances performance, especially when the component receives stable props.
 */
export default React.memo(FeedbackPage);
