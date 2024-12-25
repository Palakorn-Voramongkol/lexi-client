// src/components/EventLogger.js

// Importing necessary libraries and utilities
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';
import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../../../components/BaseComponent/mergeSpec'; // Utility functions to merge subscription and publication specifications
import { useMediator } from '../../../contexts/MediatorContext'; // Hook to access mediator via Context
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

/**
 * EventLogger Functional Component
 * 
 * Manages and displays logged events.
 * Listens to 'start', 'stop', 'registeredComponentSpec', 'unregisteredComponentSpec', 'log', and 'windowSizeChange' events from the mediator.
 * 
 * Displays a DataGrid with columns: Timestamp, Component, Channel, Event, Origin.
 * The DataGrid shows the latest timestamp on top and includes pagination.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.name - The unique name of the EventLogger component.
 * @param {string} props.code - A short code representing the EventLogger component.
 * @param {string} props.description - A brief description of the EventLogger component.
 * @param {Object} [props.extendedSubscriptionSpec={}] - Extended subscription specifications for additional events.
 * @param {Object} [props.extendedPublishSpec={}] - Extended publication specifications for additional events.
 * @param {number} [props.maxHeight=500] - Maximum height for the DataGrid in pixels.
 * @returns {JSX.Element} The rendered EventLogger component.
 */
const EventLogger = ({
    name,
    code,
    description,
    extendedSubscriptionSpec = {},
    extendedPublishSpec = {},
    maxHeight = 500,
}) => {
    const mediator = useMediator(); // Access mediator via Context

    // Define subscription specifications.
    const subscriptionSpec = {
        subscriptions: [
            {
                channel: "system", // Channel name for system-level events
                events: [
                    {
                        name: "start", // Event name indicating the start of the application
                        description: "Handles the application start event to initialize the UI.",
                        dataFormat: {
                            "timestamp": "string (ISO 8601 format)" // Expected data format for the event
                        }
                    },
                    {
                        name: "stop", // Event name indicating the stop of the application
                        description: "Handles the application stop event to perform cleanup.",
                        dataFormat: {
                            "timestamp": "string (ISO 8601 format)" // Expected data format for the event
                        }
                    },
                    {
                        name: "registeredComponentSpec", // Event name for system-level registration
                        description: "Handles the publication of the new registered component specification and displays it.",
                        dataFormat: {
                            timeStamp: "string (ISO 8601 format)",
                            componentName: "string",
                            componentSpec: "object",
                        }
                    },
                    {
                        name: "unregisteredComponentSpec", // Event name for system-level unregistration
                        description: "Handles the removal of a component specification and updates the registry view.",
                        dataFormat: {
                            timeStamp: "string (ISO 8601 format)",
                            componentName: "string",
                        }
                    },
                    {
                        name: "log", // Event name for system-level logging
                        description: "Handles the system logging request.",
                        dataFormat: {
                            "timestamp": "string (ISO 8601 format)", // Timestamp of the log event
                            "component": "string", // Component emitting the log
                            "event": "string" // Content of the log message
                        }
                    }
                ]
            },
            {
                channel: "ui", // Channel name for UI-level events
                events: [
                    {
                        name: "windowSizeChange", // Event name indicating a window size change
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

    // Define publication specifications.
    const publicationSpec = {
        publications: [
            // EventLogger does not publish any events by default
        ]
    };

    // Merge the subscription and publication specifications with any extended specs.
    const mergedSubscriptionSpec = mergeSubscriptionSpecs(subscriptionSpec, extendedSubscriptionSpec);
    const mergedPublicationSpec = mergePublicationSpecs(publicationSpec, extendedPublishSpec);

    // State management
    const [events, setEvents] = useState([]); // Stores the event logs
    const [page, setPage] = useState(1); // Current page number (1-based index)
    const [pageSize, setPageSize] = useState(25); // Number of rows per page
    const [totalLogs, setTotalLogs] = useState(0); // Total number of logs

    /**
     * Transforms raw logs into a flat structure suitable for the DataGrid.
     *
     * @param {Array} rawLogs - The raw logs fetched from the mediator.
     * @returns {Array} Transformed logs.
     */
    const transformLogs = (rawLogs) => {
        return rawLogs.map((item) => {
            const { type, timestamp, data } = item;
            const formattedTimestamp = dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');

            if (type === 'register') {
                const subscriptions = data.componentSpec.subscriptionSpec.subscriptions || [];
                const publications = data.componentSpec.publicationSpec.publications || [];

                const subscriptionEvents = subscriptions.flatMap((subscription) => {
                    const { channel, events: subEvents } = subscription;
                    return subEvents.map((event) => ({
                        id: uuidv4(), // Ensure unique ID
                        timestamp: formattedTimestamp,
                        component: data.componentName || 'N/A',
                        channel: channel || 'N/A',
                        event: event.name || 'N/A',
                        origin: 'subscription spec', // Set origin
                    }));
                });

                const publicationEvents = publications.flatMap((publication) => {
                    const { channel, event } = publication;
                    return [
                        {
                            id: uuidv4(),
                            timestamp: formattedTimestamp,
                            component: data.componentName || 'N/A',
                            channel: channel || 'N/A',
                            event: event || 'N/A',
                            origin: 'publication spec', // Set origin
                        }
                    ];
                });

                return [...subscriptionEvents, ...publicationEvents];
            } else if (type === 'unregister') {
                // For un-registration, there might not be subscription details
                return [
                    {
                        id: uuidv4(),
                        timestamp: formattedTimestamp,
                        component: data.componentName || 'N/A',
                        channel: 'all',
                        event: 'Unregistered Component',
                        origin: 'system', // Set origin
                    }
                ];
            } else if (type === 'log') {
                return {
                    id: uuidv4(),
                    timestamp: formattedTimestamp,
                    component: data.component || 'N/A',
                    channel: 'system',
                    event: data.event || 'N/A',
                    origin: 'system', // Set origin
                };
            }

            return null; // Return null for unknown types
        }).filter(event => event !== null);
    };

    /**
     * Fetches logs based on current pagination settings.
     * This method interfaces with the mediator to retrieve logs.
     */
    const fetchLogs = () => {
        try {
            const types = ['register', 'unregister', 'log']; // Define the types you're interested in
            const { logs, total } = mediator.getLogsByTypes(types, page, pageSize); // Fetch logs from mediator

            const transformedLogs = transformLogs(logs);
            setEvents(transformedLogs);
            setTotalLogs(total > 100 ? 100 : total); // Adjust total logs if necessary
        } catch (error) {
            console.error("Error fetching logs:", error);
        }
    };

    /**
     * Adds a new event to the state.
     * Ensures that the events array does not exceed 100 entries.
     * 
     * @param {Object} newEvent - The new event to add.
     */
    const addEvent = (newEvent) => {
        setEvents((prevEvents) => {
            const updatedEvents = [newEvent, ...prevEvents]; // Prepend to have latest first
            if (updatedEvents.length > 100) { // Limit to 100 events
                return updatedEvents.slice(0, 100);
            }
            return updatedEvents;
        });
    };

    /**
     * Handler functions for various events.
     * These functions follow a consistent naming convention.
     */

    /**
     * Handler for the 'system:start' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    const handleSystemStart = (data) => {
        console.log(`EventLogger (${data.accountName}) - Event 'start' occurred on 'system' with data:`, data.data);
        // Additional logic for handling the start event can be added here
    };

    /**
     * Handler for the 'system:stop' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    const handleSystemStop = (data) => {
        console.log(`EventLogger (${data.accountName}) - Event 'stop' occurred on 'system' with data:`, data.data);
        // Additional logic for handling the stop event can be added here
    };

    /**
     * Handler for 'system:registeredComponentSpec' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemRegisteredComponentSpec(data) {
        addEvent({
            id: uuidv4(),
            timestamp: dayjs(data.timestamp).format('YYYY-MM-DD HH:mm:ss'),
            componentName: data.componentName,
            componentCode: data.componentCode || 'N/A',
            channel: data.channel,
            event: data.event,
            origin: 'registration', // Indicates the origin of the event
        });
    }

    /**
     * Handler for 'system:unregisteredComponentSpec' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemUnregisteredComponentSpec(data) {
        addEvent({
            id: uuidv4(),
            timestamp: dayjs(data.timeStamp).format('YYYY-MM-DD HH:mm:ss'),
            componentName: data.componentName,
            componentCode: data.componentCode || 'N/A',
            channel: data.channel,
            event: data.event,
            origin: 'registration', // Indicates the origin of the event
        });
    }

    /**
     * Handler for the 'system:log' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    const handleSystemLog = (data) => {
        console.log(`EventLogger (${name}) - System Log: [${data.timestamp}] [${data.component}] ${data.event}`);
        addEvent({
            timestamp: data.timestamp,
            component: data.component,
            channel: 'system',
            event: data.event,
            origin: 'system', // Indicates the origin of the event
        });
    };

    /**
     * Handler for the 'ui:windowSizeChange' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    const handleWindowSizeChange = (data) => {
        console.log(`EventLogger (${data.accountName}) - Event 'windowSizeChange' occurred on 'ui' with data:`, data.data);
        // Additional logic for handling window size changes can be added here
    };

    /**
     * Centralized mapping of "channel:event" to handler functions.
     * This ensures that each event is handled by its respective function.
     */
    const eventHandlers = {
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'system:registeredComponentSpec': handleSystemRegisteredComponentSpec,
        'system:unregisteredComponentSpec': handleSystemUnregisteredComponentSpec,
        'system:log': handleSystemLog,
        'ui:windowSizeChange': handleWindowSizeChange,
    };

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
        console.log(`EventsLogger: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2));
        if (typeof eventHandlers[handlerKey] === 'function') {
            eventHandlers[handlerKey]({ componentName, componentCode, channel, event, data, timestamp });
        } else {
            console.warn(`No handler implemented for event '${event}' on channel '${channel}' in EventsLogger.`);
        }
    };

    /**
     * Register the component with the mediator upon mounting and unregister upon unmounting.
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
                console.log(`EventLogger (${name}) initialized.`);
                fetchLogs(); // Fetch initial logs if necessary
            },
            destroy: () => {
                console.log(`EventLogger (${name}) destroyed.`);
                // Additional cleanup logic if needed
            },
        });

        // Cleanup function to unregister the component
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
                    console.log(`EventLogger (${name}) initialized.`);
                },
                destroy: () => {
                    console.log(`EventLogger (${name}) destroyed.`);
                },
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

    /**
     * Prepares the rows for the DataGrid based on the events in state.
     * 
     * @returns {Array} Array of row objects.
     */
    const getRows = () => {
        return events.map((event) => ({
            id: event.id, // Unique ID for each row
            timestamp: event.timestamp,
            component: event.component,
            channel: event.channel,
            event: event.event,
            origin: event.origin || 'N/A',
        }));
    };

    /**
     * Defines the columns for the DataGrid.
     * 
     * @returns {Array} Array of column definitions.
     */
    const getColumns = () => [
        {
            field: 'timestamp',
            headerName: 'Timestamp',
            width: 250,
            sortable: true,
        },
        {
            field: 'component',
            headerName: 'Component',
            width: 250,
            sortable: true,
        },
        {
            field: 'channel',
            headerName: 'Channel',
            width: 150,
            sortable: true,
        },
        {
            field: 'event',
            headerName: 'Event',
            width: 300,
            sortable: false,
        },
        {
            field: 'origin',
            headerName: 'Origin',
            width: 150,
            sortable: true,
            renderCell: (params) => {
                const value = params.value;
                let backgroundColor = 'white';

                if (value === 'subscription spec') {
                    backgroundColor = 'lightblue';
                } else if (value === 'publication spec') {
                    backgroundColor = 'lightgreen';
                } else if (value === 'system') {
                    backgroundColor = '#FF7F50'; // Coral color for system origin
                }

                const color = 'black'; // Text color
                return (
                    <div
                        style={{
                            backgroundColor,
                            color,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: '10px',
                            paddingRight: '10px',
                            boxSizing: 'border-box',
                        }}
                    >
                        {value}
                    </div>
                );
            },
        },
    ];

    /**
     * Handles page changes in the DataGrid.
     * 
     * @param {number} newPage - The new page number (0-based index).
     */
    const handlePageChange = (newPage) => {
        setPage(newPage + 1); // DataGrid uses 0-based index
        fetchLogs();
    };

    /**
     * Handles page size changes in the DataGrid.
     * 
     * @param {number} newPageSize - The new number of rows per page.
     */
    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setPage(1); // Reset to first page when page size changes
        fetchLogs();
    };

    /**
     * Render the EventLogger component.
     * Displays a DataGrid with columns: Timestamp, Component, Channel, Event, Origin.
     * The DataGrid shows the latest timestamp on top and includes pagination.
     * 
     * @returns {JSX.Element} The rendered component.
     */
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                width: '100%',
                height: '100%',
            }}
        >
            <Typography variant="h6" gutterBottom>
                Events Logger
            </Typography>
            <Box
                sx={{
                    flexGrow: 1,
                    width: '100%',
                    minHeight: 0,
                    maxHeight: `${maxHeight}px`,
                }}
            >
                <DataGrid
                    rows={getRows()}
                    columns={getColumns()}
                    pagination
                    page={page - 1} // DataGrid uses 0-based index
                    pageSize={pageSize}
                    rowsPerPageOptions={[5, 10, 20, 50, 100]}
                    rowCount={totalLogs}
                    paginationMode="server" // Enable server-side pagination handling
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    disableSelectionOnClick
                    rowHeight={25}
                    sx={{
                        flexGrow: 1,
                        flexBasis: 0,
                        '& .MuiDataGrid-cell': {
                            fontSize: '0.875rem',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f5f5f5',
                            fontSize: '0.875rem',
                        },
                        '& .MuiDataGrid-virtualScroller': {
                            overflowY: 'scroll !important', // Always show vertical scrollbar
                        },
                        height: '100%',
                    }}
                    sortingOrder={['desc', 'asc']}
                    initialState={{
                        sorting: {
                            sortModel: [{ field: 'timestamp', sort: 'desc' }],
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

/**
 * Defines PropTypes for the EventLogger functional component.
 * Ensures that the component receives the correct types of props.
 * This enhances type safety and aids in catching bugs during development.
 */
EventLogger.propTypes = {
    name: PropTypes.string.isRequired,                  // The unique name of the EventLogger instance
    code: PropTypes.string.isRequired,                  // The unique code identifier for the EventLogger
    description: PropTypes.string.isRequired,           // A brief description of the EventLogger
    extendedPublishSpec: PropTypes.object,              // Extended publish specifications for additional events
    extendedSubscriptionSpec: PropTypes.object,         // Extended subscription specifications for additional events
    maxHeight: PropTypes.number,                        // Maximum height for the DataGrid
};

/**
 * Export the EventLogger functional component for use in other parts of the application.
 */
export default React.memo(EventLogger);
