// src/components/NotificationIcon.js

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    IconButton,
    Tooltip,
    Badge,
    Popover,
    List,
    ListItem,
    ListItemText,
    Divider,
    Typography,
    Box,
    Button,
} from '@mui/material'; // Added necessary Material-UI components
import NotificationsIcon from '@mui/icons-material/Notifications'; // Notification bell icon
import { useMediator } from '../../contexts/MediatorContext'; // Hook to access mediator via Context
import { useTheme } from '@mui/material/styles'; // Hook to access MUI theme
import {
    mergeSubscriptionSpecs,
    mergePublicationSpecs,
} from '../BaseComponent/mergeSpec'; // Utility functions to merge specs

/**
 * NotificationIcon Functional Component
 * 
 * Displays a notification icon with a badge indicating the number of unread notifications.
 * Integrates with a mediator for event-driven communication, subscribing to notification events
 * and publishing user-related events when interacted with.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.name - The unique name of the NotificationIcon instance.
 * @param {string} props.code - The unique code identifier for the NotificationIcon.
 * @param {string} props.description - A brief description of the NotificationIcon.
 * @param {Object} [props.extendedSubscriptionSpec={}] - Extended subscription specifications for additional events.
 * @param {Object} [props.extendedPublishSpec={}] - Extended publication specifications for additional events.
 * @returns {JSX.Element} The rendered NotificationIcon component.
 */
const NotificationIcon = ({
    name,
    code,
    description,
    extendedSubscriptionSpec = {},
    extendedPublishSpec = {},
}) => {
    const mediator = useMediator(); // Access mediator via Context
    const theme = useTheme();

    // State to manage unread notifications count
    const [unreadCount, setUnreadCount] = useState(0);

    // State to manage the list of notifications
    const [notifications, setNotifications] = useState([]);

    // State to manage popover visibility
    const [anchorEl, setAnchorEl] = useState(null);

    /**
     * Define subscription specifications.
     * NotificationIcon subscribes to 'notification:new', 'notification:read', and 'notification:remove' events.
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
            {
                channel: 'ui', // Channel name for UI-related events
                events: [
                    {
                        name: 'windowSizeChange', // Event name indicating a window size change
                        description: 'Handles the application window size change.',
                        dataFormat: {
                            windowSize: {
                                width: 'integer',
                                height: 'integer',
                            },
                        },
                    },
                ],
            },
            {
                channel: 'notification', // Channel name for notification-related events
                events: [
                    {
                        name: 'new', // Event name indicating a new notification
                        description: 'Handles events when a new notification is received.',
                        dataFormat: {
                            notificationId: 'string',
                            message: 'string',
                            receivedBy: 'string', // e.g., user ID
                            timestamp: 'string (ISO 8601 format)',
                        },
                    },
                    {
                        name: 'read', // Event name indicating a notification has been read
                        description: 'Handles events when a notification is marked as read.',
                        dataFormat: {
                            notificationId: 'string',
                            readBy: 'string', // e.g., user ID
                            timestamp: 'string (ISO 8601 format)',
                        },
                    },
                    {
                        name: 'remove', // Event name indicating a notification has been removed
                        description: 'Handles events when a notification is removed.',
                        dataFormat: {
                            notificationId: 'string',
                            removedBy: 'string', // e.g., user ID
                            timestamp: 'string (ISO 8601 format)',
                        },
                    },
                ],
            },
        ],
    };

    /**
     * Define publication specifications.
     * NotificationIcon publishes an event when the user interacts with the notification icon.
     */
    const publicationSpec = {
        publications: [
            {
                channel: 'user', // Channel name for user-related publications
                event: 'notificationInteraction', // Event name indicating user interaction with notifications
                description: 'Publishes notification interaction events when user interacts with the notification icon.',
                condition: 'User clicks the notification icon',
                dataFormat: {
                    userId: 'integer', // ID of the user performing the action
                    action: 'string', // Action performed by the user (e.g., 'view', 'clearAll')
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the action
                },
                exampleData: {
                    userId: 5678,
                    action: 'view',
                    timestamp: '2024-05-01T14:30:00Z',
                },
            },
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
     * Define custom event handlers specific to NotificationIcon.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const eventHandlers = {
        'notification:new': handleNewNotification,
        'notification:read': handleNotificationRead,
        'notification:remove': handleNotificationRemove,
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'ui:windowSizeChange': handleWindowSizeChange,
    };

    /**
     * Handler for 'notification:new' event.
     * Adds the new notification to the list and increments the unread count.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleNewNotification(data) {
        console.log(`NotificationIcon (${data.accountName}) received 'notification:new' event with data:`, data.data);
        setNotifications((prevNotifications) => [data.data, ...prevNotifications]);
        setUnreadCount((prevCount) => prevCount + 1);
    }

    /**
     * Handler for 'notification:read' event.
     * Marks the specified notification as read and decrements the unread count.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleNotificationRead(data) {
        console.log(`NotificationIcon (${data.accountName}) received 'notification:read' event with data:`, data.data);
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification) =>
                notification.notificationId === data.notificationId
                    ? { ...notification, read: true }
                    : notification
            )
        );
        setUnreadCount((prevCount) => Math.max(prevCount - 1, 0));
    }

    /**
     * Handler for 'notification:remove' event.
     * Removes the specified notification from the list.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleNotificationRemove(data) {
        console.log(`NotificationIcon (${data.accountName}) received 'notification:remove' event with data:`, data.data);
        setNotifications((prevNotifications) =>
            prevNotifications.filter((notification) => notification.notificationId !== data.notificationId)
        );
        setUnreadCount((prevCount) => Math.max(prevCount - 1, 0));
    }

    /**
     * Handler for 'system:start' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStart(data) {
        console.log(`NotificationIcon (${data.componentName}) received 'system:start' event with data:`, data.data);
        // Implement additional logic for handling the start event if needed
    }

    /**
     * Handler for 'system:stop' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`NotificationIcon (${data.componentName}) received 'system:stop' event with data:`, data.data);
        // Implement additional logic for handling the stop event if needed
    }

    /**
     * Handler for 'ui:windowSizeChange' event.
     * Adjusts the component's layout based on the new window size.
     * 
     * @param {Object} data - The data associated with the event.
     * @param {Object} data.windowSize - The new window dimensions.
     * @param {number} data.windowSize.width - The new window width.
     * @param {number} data.windowSize.height - The new window height.
     */
    function handleWindowSizeChange(data) {
        console.log(`NotificationIcons (${data.componentName}) received 'ui:windowSizeChange' event with data:`, data.data);
        // Implement additional logic for handling window size changes if needed
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
        console.log(`NotificationIcon: Received event '${handlerKey}' with data:`, JSON.stringify({ componentName, componentCode, channel, event, data, timestamp }, null, 2));
        if (typeof eventHandlers[handlerKey] === 'function') {
            eventHandlers[handlerKey]({ componentName, componentCode, channel, event, data, timestamp });
        } else {
            console.warn(`No handler implemented for event '${event}' on channel '${channel}' in NotificationIcon.`);
        }
    };

    /**
     * Registers event handlers with the mediator upon component mount.
     * Also performs any initialization logic, such as fetching initial notifications.
     * Cleans up event handlers upon component unmount.
     */
    useEffect(() => {
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
                console.log(`NotificationIcon (${name}) initialized.`);
                // Perform any additional initialization logic here
                // Example: Fetch initial notifications from an API
                // Simulating with dummy data
                const initialNotifications = [
                    {
                        notificationId: 'noti-001',
                        message: 'Welcome to the application!',
                        receivedBy: 'user-5678',
                        timestamp: new Date().toISOString(),
                        read: false,
                    },
                ];
                setNotifications(initialNotifications);
                setUnreadCount(initialNotifications.length);
                console.log('Initial notifications loaded:', initialNotifications);
            },
            destroy: () => {
                console.log(`NotificationIcon (${name}) destroyed.`);
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
                    console.log(`NotificationIcon (${name}) initialized.`);
                },
                destroy: () => {
                    console.log(`NotificationIcon (${name}) destroyed.`);
                },
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

    /**
     * Example function to publish a 'notificationInteraction' event.
     * This can be triggered based on specific actions within the component.
     * 
     * @param {string} action - The action performed by the user (e.g., 'view', 'clearAll').
     */
    const triggerNotificationInteraction = (action) => {
        const timestamp = new Date().toISOString();
        const userId = 5678; // Example user ID, should be dynamic based on authenticated user

        const eventData = {
            userId,
            action, // e.g., 'view', 'clearAll'
            timestamp,
        };

        mediator.publish(name, code, 'user', 'notificationInteraction', eventData, Date.now());
        console.log(`NotificationIcon (${name}) published 'notificationInteraction' event with data:`, eventData);
    };

    /**
     * Handles the click event on the notification icon.
     * Opens the notifications popover and marks all notifications as read.
     */
    const handleIconClick = (event) => {
        setAnchorEl(event.currentTarget);
        if (unreadCount > 0) {
            // Optionally, mark all notifications as read
            notifications.forEach((notif) => {
                if (!notif.read) {
                    mediator.publish(name, code, 'notification', 'read', {
                        notificationId: notif.notificationId,
                        readBy: code, // Assuming 'code' represents the user or component identifier
                        timestamp: new Date().toISOString(),
                    }, Date.now());
                }
            });
            // Reset unread count
            setUnreadCount(0);
            console.log('All notifications marked as read.');
            // Publish interaction event
            triggerNotificationInteraction('view');
        }
    };

    /**
     * Handles closing the notifications popover.
     */
    const handleClose = () => {
        setAnchorEl(null);
    };

    /**
     * Determines whether the popover is open based on anchor element.
     */
    const open = Boolean(anchorEl);
    const id = open ? 'notification-popover' : undefined;

    /**
     * Render the NotificationIcon component.
     * The component includes a tooltip, a badge indicating unread notifications,
     * and a popover displaying the list of notifications.
     */
    return (
        <Box>
            <Tooltip title="Notifications" placement="bottom">
                <IconButton
                    onClick={handleIconClick}
                    aria-describedby={id}
                    aria-label="Notifications"
                    sx={{
                        color: theme.palette.menu.iconColor, // Use theme's icon color
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover, // Use theme's action hover color for better consistency
                        },
                    }}
                >
                    <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: { width: 300, maxHeight: 400 },
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6">Notifications</Typography>
                    <Divider sx={{ my: 1 }} />
                    <List>
                        {notifications.length === 0 ? (
                            <ListItem>
                                <ListItemText primary="No notifications." />
                            </ListItem>
                        ) : (
                            notifications.map((notif) => (
                                <React.Fragment key={notif.notificationId}>
                                    <ListItem
                                        alignItems="flex-start"
                                        secondaryAction={
                                            !notif.read && (
                                                <Button
                                                    size="small"
                                                    onClick={() =>
                                                        mediator.publish(name, code, 'notification', 'read', {
                                                            notificationId: notif.notificationId,
                                                            readBy: code, // Assuming 'code' represents the user or component identifier
                                                            timestamp: new Date().toISOString(),
                                                        }, Date.now())
                                                    }
                                                    aria-label={`Mark notification ${notif.notificationId} as read`}
                                                >
                                                    Mark as Read
                                                </Button>
                                            )
                                        }
                                    >
                                        <ListItemText
                                            primary={notif.message}
                                            secondary={`Received at: ${new Date(notif.timestamp).toLocaleString()}`}
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </React.Fragment>
                            ))
                        )}
                    </List>
                    {notifications.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => {
                                    // Example: Clear all notifications
                                    notifications.forEach((notif) => {
                                        mediator.publish(name, code, 'notification', 'remove', {
                                            notificationId: notif.notificationId,
                                            removedBy: code, // Assuming 'code' represents the user or component identifier
                                            timestamp: new Date().toISOString(),
                                        }, Date.now());
                                    });
                                    setNotifications([]);
                                    setUnreadCount(0);
                                    console.log('All notifications have been cleared.');
                                    // Publish interaction event
                                    triggerNotificationInteraction('clearAll');
                                    handleClose();
                                }}
                                aria-label="Clear All Notifications"
                            >
                                Clear All
                            </Button>
                        </Box>
                    )}
                </Box>
            </Popover>
        </Box>
    );
};

/**
 * Define PropTypes for type checking.
 * Ensures that the component receives the correct types of props.
 */
NotificationIcon.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the NotificationIcon instance
    code: PropTypes.string.isRequired, // The unique code identifier for the NotificationIcon
    description: PropTypes.string.isRequired, // A brief description of the NotificationIcon
    extendedPublishSpec: PropTypes.object, // Extended publication specifications for additional events
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications for additional events
};

/**
 * Wraps the NotificationIcon component with React.memo to prevent unnecessary re-renders.
 * This optimization enhances performance, especially when the component receives stable props.
 */
export default React.memo(NotificationIcon);
