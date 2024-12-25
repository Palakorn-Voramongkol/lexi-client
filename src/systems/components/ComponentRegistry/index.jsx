// src/components/ComponentRegistry.js

// Import necessary libraries and utilities
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../BaseComponent/mergeSpec'; // Utility functions for merging specs
import { useMediator } from '../../contexts/MediatorContext'; // Hook to access mediator via Context

/**
 * ComponentRegistry Functional Component
 * 
 * Manages and displays Pub/Sub statuses.
 * Listens to system events like 'start', 'stop', 'registeredComponentSpec', 'unregisteredComponentSpec', and 'windowSizeChange' from the mediator.
 * 
 * Displays a DataGrid with columns: Timestamp, ComponentName, ComponentCode, Channel, Event, Origin.
 * The DataGrid shows the latest timestamp on top and includes pagination.
 * 
 * @param {Object} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered ComponentRegistry component.
 */
const ComponentRegistry = ({
    name,
    code,
    description,
    extendedSubscriptionSpec = {},
    extendedPublishSpec = {},
    maxHeight = 500,
}) => {
    const mediator = useMediator(); // Access mediator via Context

    /**
     * Define subscription specifications.
     */
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

    /**
     * Define publication specifications.
     */
    const publicationSpec = {
        publications: [
            // ComponentRegistry does not publish any events by default
        ],
    };

    /**
     * Merge the subscription and publication specifications with any extended specs.
     */
    const mergedSubscriptionSpec = mergeSubscriptionSpecs(subscriptionSpec, extendedSubscriptionSpec);
    const mergedPublicationSpec = mergePublicationSpecs(publicationSpec, extendedPublishSpec);

    /**
     * Define custom event handlers specific to ComponentRegistry.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const customHandlers = {
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'system:registeredComponentSpec': handleSystemRegisteredComponentSpec,
        'system:unregisteredComponentSpec': handleSystemUnregisteredComponentSpec,
        'ui:windowSizeChange': handleWindowSizeChange, // Newly added handler
    };

    /**
     * Handler for 'system:start' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStart(data) {
        console.log(`ComponentRegistry (${data.componentName}) received 'system:start' event with data:`, data.data);
        // Implement additional logic for handling the start event if needed
    }

    /**
     * Handler for 'system:stop' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`ComponentRegistry (${data.componentName}) received 'system:stop' event with data:`, data.data);
        // Implement additional logic for handling the stop event if needed
    }

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
     * Handler for 'ui:windowSizeChange' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleWindowSizeChange(data) {
        console.log(`ComponentRegistry (${data.componentName}) received 'ui:windowSizeChange' event with data:`, data.data);
        // Implement additional logic for handling window size changes if needed
    }

    /**
     * Register and manage mediator functionalities using useEffect.
     */
    useEffect(() => {
        /**
         * Combined event handlers object.
         * Maps event identifiers to their corresponding handler functions.
         */
        const eventHandlers = {};

        mergedSubscriptionSpec.subscriptions.forEach(({ channel, events }) => {
            events.forEach(({ name: eventName }) => {
                const handlerKey = `${channel}:${eventName}`; // e.g., 'system:start'
                if (typeof customHandlers[handlerKey] === 'function') {
                    eventHandlers[handlerKey] = customHandlers[handlerKey];
                } else {
                    console.warn(`Handler for event '${eventName}' on channel '${channel}' is not implemented in ComponentRegistry.`);
                }
            });
        });

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
            console.log(`ComponentRegistry: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2));
            if (typeof eventHandlers[handlerKey] === 'function') {
                eventHandlers[handlerKey]({ componentName, componentCode, channel, event, data, timestamp });
            } else {
                console.warn(`No handler implemented for event '${event}' on channel '${channel}' in ComponentRegistry.`);
            }
        };

        // Register the component with the mediator
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
                console.log(`ComponentRegistry (${name}) initialized.`);
                // Additional initialization logic if needed
                fetchLogs(); // Fetch initial logs if necessary
            },
            destroy: () => {
                console.log(`ComponentRegistry (${name}) destroyed.`);
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
                    console.log(`ComponentRegistry (${name}) initialized.`);
                },
                destroy: () => {
                    console.log(`ComponentRegistry (${name}) destroyed.`);
                },
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

    // Define state variables
    const [events, setEvents] = useState([]); // Stores the event logs
    const [page, setPage] = useState(1); // Current page number (1-based index)
    const [pageSize, setPageSize] = useState(25); // Number of rows per page
    const [totalLogs, setTotalLogs] = useState(0); // Total number of logs matching the filter

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
     * Fetches logs based on current pagination settings.
     */
    const fetchLogs = () => {
        const types = ['register', 'unregister']; // Define the types you're interested in
        const { logs, total } = mediator.getLogsByTypes(types, page, pageSize); // Fetch logs from mediator

        // Transform rawLogs into a flat structure suitable for DataGrid
        const transformedLogs = logs.map((item) => {
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
                        componentName: data.componentName || 'N/A',
                        componentCode: data.componentSpec.code || 'N/A',
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
                            componentName: data.componentName || 'N/A',
                            componentCode: data.componentSpec.code || 'N/A',
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
                        componentName: data.componentName || 'N/A',
                        componentCode: data.componentCode || 'N/A',
                        channel: 'all',
                        event: 'Unregistered Component',
                        origin: 'system', // Set origin
                    }
                ];
            }

            return []; // Return empty array for unknown types
        }).flat();

        setEvents(transformedLogs);
        setTotalLogs(total);
    };

    /**
     * useEffect Hook to fetch logs when the component mounts and when page or pageSize changes.
     */
    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    /**
     * Defines the columns for the DataGrid.
     * 
     * @returns {Array} Array of column definitions.
     */
    const getColumns = () => [
        {
            field: 'timestamp',
            headerName: 'Timestamp',
            width: 180,
            sortable: true,
        },
        {
            field: 'componentName',
            headerName: 'Component Name',
            width: 300,
            sortable: true,
        },
        {
            field: 'componentCode',
            headerName: 'Component Code',
            width: 150,
            sortable: true,
        },
        {
            field: 'channel',
            headerName: 'Channel',
            width: 120,
            sortable: true,
        },
        {
            field: 'event',
            headerName: 'Event',
            width: 250,
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
    };

    /**
     * Handles page size changes in the DataGrid.
     * 
     * @param {number} newPageSize - The new number of rows per page.
     */
    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setPage(1); // Reset to first page when page size changes
    };

    /**
     * Render the ComponentRegistry component.
     * Displays a DataGrid with columns: Timestamp, ComponentName, ComponentCode, Channel, Event, Origin.
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
                Components Registry
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
                    rows={events}
                    columns={getColumns()}
                    pagination
                    page={page - 1} // DataGrid uses 0-based index
                    pageSize={pageSize}
                    rowsPerPageOptions={[25, 50, 100]}
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
 * Defines PropTypes for the ComponentRegistry functional component.
 * Ensures that the component receives the correct types of props.
 * This enhances type safety and aids in catching bugs during development.
 */
ComponentRegistry.propTypes = {
    name: PropTypes.string.isRequired,                  // The unique name of the ComponentRegistry instance
    code: PropTypes.string.isRequired,                  // The unique code identifier for the ComponentRegistry
    description: PropTypes.string.isRequired,           // A brief description of the ComponentRegistry
    extendedPublishSpec: PropTypes.object,              // Extended publish specifications for additional events
    extendedSubscriptionSpec: PropTypes.object,         // Extended subscription specifications for additional events
    maxHeight: PropTypes.number,                        // Maximum height for the DataGrid
};

export default React.memo(ComponentRegistry);
