// src/components/ComponentPubSubStatus.js

// Import necessary libraries and utilities
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import { useMediator } from '../../contexts/MediatorContext'; // Hook to access mediator via Context
import { mergeSubscriptionSpecs, mergePublicationSpecs } from "../BaseComponent/mergeSpec"; // Utility functions to merge subscription and publication specifications
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs


/**
 * ComponentPubSubStatus Functional Component
 * 
 * Manages and displays Pub/Sub statuses.
 * Listens to system events like 'start', 'stop', 'updatedPubSubStatus', and 'windowSizeChange' from the mediator.
 * 
 * Displays a DataGrid with columns: Type, Channel, Event, Details.
 * The DataGrid shows the latest events on top and includes pagination.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.name - The unique name of the ComponentPubSubStatus instance.
 * @param {string} props.code - The unique code identifier for the ComponentPubSubStatus.
 * @param {string} props.description - A brief description of the ComponentPubSubStatus.
 * @param {Object} [props.extendedSubscriptionSpec={}] - Extended subscription specifications for additional events.
 * @param {Object} [props.extendedPublishSpec={}] - Extended publication specifications for additional events.
 * @param {number} [props.maxHeight=500] - Maximum height for the DataGrid in pixels.
 * @returns {JSX.Element} The rendered component.
 */
const ComponentPubSubStatus = ({
    name,
    code,
    description,
    extendedSubscriptionSpec = {},
    extendedPublishSpec = {},
    maxHeight = 500,
}) => {
    const mediatorContext = useMediator(); // Access mediator functionalities from context

    // Define initial subscription specifications
    const initialSubscriptionSpec = {
        subscriptions: [
            {
                channel: "system", // Channel name for system-level events
                events: [
                    {
                        name: "start", // Event name indicating the start of the application
                        description: "Handles application start events.",
                        dataFormat: {
                            "timestamp": "string (ISO 8601 format)",
                        },
                    },
                    {
                        name: "stop", // Event name indicating the stop of the application
                        description: "Handles application stop events.",
                        dataFormat: {
                            "timestamp": "string (ISO 8601 format)",
                        },
                    },
                    {
                        name: "updatedPubSubStatus", // Event name for updating Pub/Sub status
                        description: "Receives updates about the current Pub/Sub status.",
                        dataFormat: {
                            timeStamp: "string",
                            pubSubStatus: "object",
                        },
                    },
                ],
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
        ],
    };

    // Define publication specifications (empty by default)
    const publicationSpec = {
        publications: [
            // ComponentPubSubStatus does not publish any events by default
        ],
    };

    // Merge extended specs
    const mergedSubscriptionSpec = mergeSubscriptionSpecs(initialSubscriptionSpec, extendedSubscriptionSpec);
    const mergedPublicationSpec = mergePublicationSpecs(publicationSpec, extendedPublishSpec);

    // State management
    const [pubSubStatusLogs, setPubSubStatusLogs] = useState([]); // Array to hold transformed Pub/Sub status logs
    const [page, setPage] = useState(1);               // Current page number (1-based index)
    const [pageSize, setPageSize] = useState(25);      // Number of rows per page
    const [totalLogs, setTotalLogs] = useState(0);     // Total number of logs

    /**
     * Transforms the Pub/Sub status data into a flat structure suitable for the DataGrid.
     *
     * @param {Object} data - The Pub/Sub status data.
     * @returns {Array} Transformed logs.
     */
    const transformPubSubStatus = (data) => {
        const { subscriptions, publications } = data;
        const transformed = [];

        // Process Subscriptions
        if (subscriptions && Array.isArray(subscriptions)) {
            subscriptions.forEach((sub) => {
                const { channel, event, subscribers } = sub;
                transformed.push({
                    id: uuidv4(),
                    type: "Subscription",
                    channel: channel || "N/A",
                    event: event || "N/A",
                    details: `Subscribers: ${subscribers.join(", ")}`,
                });
            });
        }

        // Process Publications
        if (publications && Array.isArray(publications)) {
            publications.forEach((pub) => {
                const { channel, event, contributor } = pub;
                transformed.push({
                    id: uuidv4(),
                    type: "Publication",
                    channel: channel || "N/A",
                    event: event || "N/A",
                    details: `Publishers: ${contributor}`,
                });
            });
        }

        return transformed;
    };

    /**
     * Fetches the Pub/Sub status from the mediator and updates the state.
     */
    const fetchPubSubStatus = () => {
        try {
            const data = mediatorContext.getPubSubStatus(); // Fetch data from mediator
            const transformedLogs = transformPubSubStatus(data);
            setPubSubStatusLogs(transformedLogs);
            setTotalLogs(transformedLogs.length);
            setPage(1); // Reset to first page on data fetch
        } catch (error) {
            console.error("Error fetching Pub/Sub status:", error);
        }
    };

    /**
     * Event handler for the 'system:start' event.
     * 
     * @param {Object} data - The data associated with the event.
     * @param {string} data.timestamp - The timestamp when the event was triggered.
     */
    const handleSystemStart = (data) => {
        console.log(`[ComponentPubSubStatus - ${data.componentName} - ${data.accountCode}] Event 'start' occurred on 'system' with data:`, data.data);
        // Additional logic for handling the start event can be added here
    };

    /**
     * Event handler for the 'system:stop' event.
     * 
     * @param {Object} data - The data associated with the event.
     * @param {string} data.timestamp - The timestamp when the event was triggered.
     */
    const handleSystemStop = (data) => {
        console.log(`[ComponentPubSubStatus - ${data.componentName} - ${data.componentCode}] Event 'stop' occurred on 'system' with data:`, data.data);
        // Additional logic for handling the stop event can be added here
    };

    /**
     * Handles the 'updatedPubSubStatus' event.
     * Updates the state with the latest Pub/Sub status.
     *
     * @param {Object} data - The event data containing the updated Pub/Sub status.
     */
    const handleUpdatedPubSubStatus = (data) => {
        console.log(`[ComponentPubSubStatus - ${data.componentName} - ${data.componentCode}] Received updated Pub/Sub status.`, data.data);
        const transformedLogs = transformPubSubStatus(data.pubSubStatus);
        setPubSubStatusLogs(transformedLogs);
        setTotalLogs(transformedLogs.length);
        setPage(1); // Reset to first page on update
    };

    /**
     * Event handler for the 'ui:windowSizeChange' event.
     * 
     * @param {Object} data - The data associated with the event.
     * @param {Object} data.windowSize - The new window size.
     * @param {number} data.windowSize.width - The new width of the window.
     * @param {number} data.windowSize.height - The new height of the window.
     */
    const handleWindowSizeChange = (data) => {
        console.log(`[ComponentPubSubStatus - ${data.componentName} - ${data.componentCode}] Event 'windowSizeChange' occurred on 'ui' with data:`, data.data);
        // Additional logic for handling window size changes can be added here
    };

    /**
     * Event handler for page changes.
     *
     * @param {number} newPage - The new page number (0-based index).
     */
    const handlePageChange = (newPage) => {
        // DataGrid's page prop is 0-based; adjust to 1-based
        const adjustedPage = newPage + 1;
        setPage(adjustedPage);
        // No server-side fetch needed since data is fetched entirely
    };

    /**
     * Event handler for page size changes.
     *
     * @param {number} newPageSize - The new number of rows per page.
     */
    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setPage(1); // Reset to first page on page size change
        // No server-side fetch needed since data is fetched entirely
    };

    /**
     * useEffect Hook to fetch logs when the component mounts and when page or pageSize changes.
     */
    useEffect(() => {
        fetchPubSubStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    const getRowHeight = (params) => {
        const details = params.model.details || '';
        const columnWidth = 250; // Must match the 'details' column width
        const fontSize = 14; // Example font size in pixels
        const averageCharWidth = 3; // Approximate average character width in pixels
        const charactersPerLine = Math.floor(columnWidth / averageCharWidth);
        const numberOfLines = Math.ceil(details.length / charactersPerLine);
        const baseHeight = 25; // Default row height in pixels
        const lineHeight = 20; // Approximate height per line in pixels

        return baseHeight + (numberOfLines > 1 ? (lineHeight * (numberOfLines - 1)) : 0);
    };


    /**
     * Defines the columns for the DataGrid.
     * 
     * @returns {Array} Array of column definitions.
     */
    const getColumns = () => {
        return [
            {
                field: 'type',
                headerName: 'Type',
                width: 150,
                sortable: true,
                renderCell: (params) => {
                    const value = params.value;
                    let backgroundColor = 'white';

                    if (value === 'Subscription') {
                        backgroundColor = 'lightblue';
                    } else if (value === 'Publication') {
                        backgroundColor = 'lightgreen';
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
                }
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
                width: 200,
                sortable: true,
            },
            {
                field: 'details',
                headerName: 'Details',
                width: 250, // Numeric width in pixels
                sortable: false,
                flex: 1, // Flexible width for responsiveness
                renderCell: (params) => {
                    return (
                        <Box
                            sx={{
                                whiteSpace: 'normal', // Allows text to wrap
                                wordBreak: 'break-word', // Breaks long words to prevent overflow
                                padding: '8px', // Adds padding for better readability
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center', // Conditional alignment
                                height: '100%', // Ensures the Box takes full cell height
                            }}
                        >
                            <Typography variant="body2">
                                {params.value}
                            </Typography>
                            {/* 
                                TODO: Add additional elements like a "View Details" button or an icon.
                                Example:
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    onClick={() => handleDetailsClick(params.row)}
                                >
                                    View
                                </Button>
                            */}
                        </Box>
                    );
                },
            },
        ];
    };

    /**
     * Prepares the rows for the DataGrid based on the events in state.
     * 
     * @returns {Array} Array of row objects.
     */
    const getRows = () => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return pubSubStatusLogs.slice(start, end);
    };

    /**
     * Registers event handlers with the mediator upon component mount.
     * Also fetches the initial Pub/Sub status.
     * Cleans up event handlers upon component unmount.
     */
    useEffect(() => {
        /**
         * Mapping of "channel:event" to handler functions.
         * This ensures that each event is handled by its respective function.
         */
        const eventHandlers = {
            "system:start": handleSystemStart,
            "system:stop": handleSystemStop,
            "system:updatedPubSubStatus": handleUpdatedPubSubStatus,
            "ui:windowSizeChange": handleWindowSizeChange,
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
            console.log(`ComponentPubSubStatus: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2));
            if (typeof eventHandlers[handlerKey] === 'function') {
                eventHandlers[handlerKey]({ componentName, componentCode, channel, event, data, timestamp });
            } else {
                console.warn(`No handler implemented for event '${event}' on channel '${channel}' in ComponentPubSubStatus.`);
            }
        };

        // Register the component with the mediator
        mediatorContext.register({
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
                console.log(`${name} initialized.`);
                // Fetch initial Pub/Sub status
                fetchPubSubStatus();
            },
            destroy: () => {
                console.log(`${name} destroyed.`);
                // Any additional cleanup can be done here
            },
        });

        // Cleanup function to unregister the component
        return () => {
            mediatorContext.unregister({
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
                    console.log(`${name} initialized.`);
                },
                destroy: () => {
                    console.log(`${name} destroyed.`);
                },
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                width: "100%",
                height: "100%",
            }}
        >
            <Typography variant="h6" gutterBottom>
                Pub/Sub Status
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
                    rowsPerPageOptions={[10, 25, 50]}
                    rowCount={totalLogs}
                    paginationMode="server" // Use client-side pagination since data is fetched entirely
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    disableSelectionOnClick
                    getRowHeight={getRowHeight}
                    sx={{
                        flexGrow: 1,
                        flexBasis: 0,
                        '& .MuiDataGrid-cell': {
                            alignItems: 'flex-start', // Aligns content to the top for better readability
                            justifyContent: 'flex-start',
                            fontSize: "0.875rem",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: "#f5f5f5",
                            fontSize: "0.875rem",
                        },
                        "& .MuiDataGrid-virtualScroller": {
                            overflowY: "scroll", // Always show vertical scrollbar
                        },
                        "& .MuiDataGrid-footerContainer": {
                            backgroundColor: "#f5f5f5",
                        },
                        height: "100%",
                    }}
                    sortingOrder={['desc', 'asc']}
                    initialState={{
                        sorting: {
                            sortModel: [{ field: 'event', sort: 'asc' }],
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

/**
 * Defines PropTypes for the ComponentPubSubStatus functional component.
 * Ensures that the component receives the correct types of props.
 * This enhances type safety and aids in catching bugs during development.
 */
ComponentPubSubStatus.propTypes = {
    name: PropTypes.string.isRequired,                      // The unique name of the ComponentPubSubStatus instance
    code: PropTypes.string.isRequired,                      // The unique code identifier for the ComponentPubSubStatus
    description: PropTypes.string.isRequired,               // A brief description of the ComponentPubSubStatus
    extendedPublishSpec: PropTypes.object,                  // Extended publish specifications for additional events
    extendedSubscriptionSpec: PropTypes.object,             // Extended subscription specifications for additional events
    maxHeight: PropTypes.number,                            // Maximum height for the DataGrid
};

/**
 * Export the ComponentPubSubStatus functional component for use in other parts of the application.
 */
export default React.memo(ComponentPubSubStatus);
