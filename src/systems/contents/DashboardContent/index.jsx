// src/components/DashboardContent.js

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Typography,
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    Divider,
    Paper,
} from '@mui/material'; // Added necessary Material-UI components
import { useMediator } from '../../contexts/MediatorContext'; // Hook to access mediator via Context
import {
    mergeSubscriptionSpecs,
    mergePublicationSpecs,
} from '../../components/BaseComponent/mergeSpec'; // Utility functions to merge specs
import { useTheme } from '@mui/material/styles'; // Hook to access MUI theme

/**
 * DashboardContent Functional Component
 * 
 * Displays the dashboard page content and integrates with the mediator for event-driven communication.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.name - The unique name of the DashboardContent instance.
 * @param {string} props.code - The unique code identifier for the DashboardContent.
 * @param {string} props.description - A brief description of the DashboardContent.
 * @param {Object} [props.extendedSubscriptionSpec={}] - Extended subscription specifications for additional events.
 * @param {Object} [props.extendedPublishSpec={}] - Extended publication specifications for additional events.
 * @returns {JSX.Element} The rendered DashboardContent component.
 */
const DashboardContent = ({
    name,
    code,
    description,
    extendedSubscriptionSpec = {},
    extendedPublishSpec = {},
}) => {
    const mediator = useMediator(); // Access mediator via Context
    const theme = useTheme(); // Access MUI theme for styling

    // State to manage responsive layout
    const [isMobile, setIsMobile] = useState(false);

    // State to manage dashboard widgets
    const [widgets, setWidgets] = useState([]);

    /**
     * Define initial subscription specifications.
     * DashboardContent subscribes to 'dashboard:refresh', 'dashboard:updateProductList', and 'dashboard:widgetRemoved' events.
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
                channel: 'dashboard', // Channel name for dashboard-related events
                events: [
                    {
                        name: 'refresh', // Event name indicating the dashboard should refresh data
                        description: 'Handles events to refresh dashboard data.',
                        dataFormat: {
                            refreshType: 'string', // e.g., 'full' or 'partial'
                            timestamp: 'string (ISO 8601 format)',
                        },
                    },
                    {
                        name: 'updateProductList', // Event name indicating the dashboard data has been updated
                        description: 'Handles events when dashboard for product list data is updated.',
                        dataFormat: {
                            updatedFields: 'array of strings', // Fields that were updated
                            timestamp: 'string (ISO 8601 format)',
                        },
                    },
                    {
                        name: 'widgetRemoved', // Event name indicating a widget was removed
                        description: 'Handles events when a dashboard widget is removed.',
                        dataFormat: {
                            widgetId: 'string',
                            removedBy: 'string',
                            timestamp: 'string (ISO 8601 format)',
                        },
                    },
                ],
            },
        ],
    };

    /**
     * Define publication specifications.
     * DashboardContent publishes an event when a new dashboard widget is added.
     */
    const publicationSpec = {
        publications: [
            {
                channel: 'dashboard', // Channel name for dashboard-related events
                event: 'widgetAdded', // Event name indicating a new widget was added
                description: 'Publishes an event when a new dashboard widget is added.',
                condition: 'When a new widget is successfully added to the dashboard.',
                dataFormat: {
                    widgetId: 'string',
                    widgetName: 'string',
                    addedBy: 'string',
                    timestamp: 'string (ISO 8601 format)',
                },
                exampleData: {
                    widgetId: 'widget-001',
                    widgetName: 'Sales Chart',
                    addedBy: 'dashboardAdmin',
                    timestamp: '2024-05-01T12:00:00Z',
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
     * Define custom event handlers specific to DashboardContent.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const eventHandlers = {
        'dashboard:refresh': handleDashboardRefresh,
        'dashboard:updateProductList': handleDashboardUpdateProductList,
        'dashboard:widgetRemoved': handleWidgetRemoved,
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'ui:windowSizeChange': handleWindowSizeChange,
    };

    /**
     * Handler for 'dashboard:refresh' event.
     * Refreshes the dashboard data based on the refresh type.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleDashboardRefresh(data) {
        console.log(`DashboardContent (${data.accountName}) received 'dashboard:refresh' event with data:`, data.data);
        const { refreshType } = data.data;
        if (refreshType === 'full') {
            // Implement full refresh logic
            console.log('Performing full dashboard refresh...');
            // Example: Fetch all dashboard data
        } else if (refreshType === 'partial') {
            // Implement partial refresh logic
            console.log('Performing partial dashboard refresh...');
            // Example: Update specific sections of the dashboard
        } else {
            console.warn(`Unknown refreshType: ${refreshType}`);
        }
    }

    /**
     * Handler for 'dashboard:updateProductList' event.
     * Updates specific fields in the dashboard's product list.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleDashboardUpdateProductList(data) {
        console.log(`DashboardContent (${data.accountName}) received 'dashboard:updateProductList' event with data:`, data.data);
        const { updatedFields } = data.data;
        // Implement logic to update specific fields in the product list
        // Example: Update UI components that display product statistics
        console.log(`Updating fields: ${updatedFields.join(', ')}`);
    }

    /**
     * Handler for 'dashboard:widgetRemoved' event.
     * Removes a widget from the local widgets list.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleWidgetRemoved(data) {
        console.log(`DashboardContent (${name}) received 'dashboard:widgetRemoved' event with data:`, data.data);
        const { widgetId } = data.data;
        setWidgets((prevWidgets) => prevWidgets.filter((widget) => widget.widgetId !== widgetId));
        console.log(`Widget with ID ${widgetId} has been removed.`);
    }

    /**
     * Handler for 'system:start' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStart(data) {
        console.log(`DashboardContent (${data.accountName}) received 'system:start' event with data:`, data.data);
        // Implement additional logic for handling the start event if needed
        // For example, initialize certain settings or fetch initial data
    }

    /**
     * Handler for 'system:stop' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`DashboardContent (${data.accountName}) received 'system:stop' event with data:`, data.data);
        // Implement additional logic for handling the stop event if needed
        // For example, perform cleanup or save state
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
        const { windowSize } = data.data;
        const { width } = windowSize;

        console.log(`DashboardContent (${data.accountName}) received 'ui:windowSizeChange' event with width: ${width}px`);

        const breakpoint = 600; // Example breakpoint in pixels

        if (width < breakpoint && !isMobile) {
            setIsMobile(true); // Switch to mobile layout
            console.log('Switched to mobile layout.');
        } else if (width >= breakpoint && isMobile) {
            setIsMobile(false); // Switch back to desktop layout
            console.log('Switched to desktop layout.');
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
        console.log(`DashboardContent: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2));
        if (typeof eventHandlers[handlerKey] === 'function') {
            eventHandlers[handlerKey]({ componentName, componentCode, channel, event, data, timestamp });
        } else {
            console.warn(`No handler implemented for event '${event}' on channel '${channel}' in DashboardContent.`);
        }
    };

    /**
     * Registers event handlers with the mediator upon component mount.
     * Also performs any initialization logic, such as fetching initial data.
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
                console.log(`DashboardContent (${name}) initialized.`);
                // Perform any additional initialization logic here
                // Example: Fetch initial dashboard data or subscribe to additional events
                // Example: Fetch initial widgets
                const initialWidgets = [
                    {
                        widgetId: 'widget-001',
                        widgetName: 'Sales Chart',
                        addedBy: 'dashboardAdmin',
                        timestamp: new Date().toISOString(),
                    },
                    {
                        widgetId: 'widget-002',
                        widgetName: 'User Engagement',
                        addedBy: 'dashboardAdmin',
                        timestamp: new Date().toISOString(),
                    },
                ];
                setWidgets(initialWidgets);
                console.log('Initial widgets loaded:', initialWidgets);
            },
            destroy: () => {
                console.log(`DashboardContent (${name}) destroyed.`);
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
                    console.log(`DashboardContent (${name}) initialized.`);
                },
                destroy: () => {
                    console.log(`DashboardContent (${name}) destroyed.`);
                },
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

    /**
     * Example function to publish a 'widgetAdded' event.
     * This can be triggered based on specific actions within the component.
     */
    const triggerWidgetAddition = () => {
        const newWidget = {
            widgetId: 'widget-003',
            widgetName: 'Revenue Growth',
            addedBy: 'dashboardAdmin',
            timestamp: new Date().toISOString(),
        };
        mediator.publish(name, code, 'dashboard', 'widgetAdded', newWidget, Date.now());
        console.log(`DashboardContent (${name}) published 'widgetAdded' event with data:`, newWidget);
        // Optionally, add the widget locally as well
        setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
    };

    /**
     * Example function to remove a widget.
     * This can be triggered based on specific actions within the component.
     */
    const removeWidget = (widgetId) => {
        const removalData = {
            widgetId,
            removedBy: code, // Assuming 'code' represents the user or component identifier
            timestamp: new Date().toISOString(),
        };
        mediator.publish(name, code, 'dashboard', 'widgetRemoved', removalData, Date.now());
        console.log(`DashboardContent (${name}) published 'widgetRemoved' event with data:`, removalData);
        // Optionally, remove the widget locally as well
        setWidgets((prevWidgets) => prevWidgets.filter((widget) => widget.widgetId !== widgetId));
    };

    /**
     * Determines the typography variant based on the current layout (mobile or desktop).
     * 
     * @returns {string} The typography variant.
     */
    const getTypographyVariant = () => (isMobile ? 'h6' : 'h4');

    return (
        <Box
            sx={{
                padding: isMobile ? 2 : 4, // Adjust padding based on layout
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '80vh', // Ensure the content takes up sufficient vertical space
                backgroundColor: theme.palette.background.default, // Use theme's default background color
            }}
        >
            <Typography variant={getTypographyVariant()} gutterBottom>
                Dashboard
            </Typography>
            <Typography variant="body1" align="center" sx={{ maxWidth: 800 }}>
                Welcome to the Dashboard! Here you can monitor key metrics, manage widgets, and get real-time insights into your application's performance.
            </Typography>
            {/* Example button to trigger a widget addition event */}
            <Button
                variant="contained"
                color="primary"
                onClick={triggerWidgetAddition}
                sx={{ marginTop: 2 }}
                aria-label="Add New Widget"
            >
                Add New Widget
            </Button>
            {/* Displaying the list of widgets */}
            <Box sx={{ mt: 4, width: '100%', maxWidth: 800 }}>
                <Typography variant="h6" gutterBottom>
                    Dashboard Widgets
                </Typography>
                <Paper elevation={3}>
                    <List>
                        {widgets.length === 0 ? (
                            <ListItem>
                                <ListItemText primary="No widgets available." />
                            </ListItem>
                        ) : (
                            widgets.map((widget) => (
                                <React.Fragment key={widget.widgetId}>
                                    <ListItem
                                        secondaryAction={
                                            <Button
                                                edge="end"
                                                color="error"
                                                onClick={() => removeWidget(widget.widgetId)}
                                                aria-label={`Remove ${widget.widgetName} Widget`}
                                            >
                                                Remove
                                            </Button>
                                        }
                                    >
                                        <ListItemText
                                            primary={widget.widgetName}
                                            secondary={`ID: ${widget.widgetId} | Added by: ${widget.addedBy} | Timestamp: ${new Date(
                                                widget.timestamp
                                            ).toLocaleString()}`}
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </React.Fragment>
                            ))
                        )}
                    </List>
                </Paper>
            </Box>
        </Box>
    );
};

/**
 * Define PropTypes for type checking.
 */
DashboardContent.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the DashboardContent instance
    code: PropTypes.string.isRequired, // The unique code identifier for the DashboardContent
    description: PropTypes.string.isRequired, // A brief description of the DashboardContent
    extendedPublishSpec: PropTypes.object, // Extended publication specifications for additional events
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications for additional events
};

export default React.memo(DashboardContent);
