// src/components/HomeContent.js

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, Button } from '@mui/material'; // Added Button for demonstration
import { useMediator } from '../../contexts/MediatorContext'; // Hook to access mediator via Context
import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../../components/BaseComponent/mergeSpec'; // Utility functions to merge specs
import { useTheme } from '@mui/material/styles'; // Hook to access MUI theme

/**
 * HomeContent Functional Component
 * 
 * Displays the home page content and integrates with the mediator for event-driven communication.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.name - The unique name of the HomeContent instance.
 * @param {string} props.code - The unique code identifier for the HomeContent.
 * @param {string} props.description - A brief description of the HomeContent.
 * @param {Object} [props.extendedSubscriptionSpec={}] - Extended subscription specifications for additional events.
 * @param {Object} [props.extendedPublishSpec={}] - Extended publication specifications for additional events.
 * @returns {JSX.Element} The rendered HomeContent component.
 */
const HomeContent = ({
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

    /**
     * Define initial subscription specifications.
     * HomeContent subscribes to 'system:start', 'system:stop', and 'ui:windowSizeChange' events.
     */
    const initialSubscriptionSpec = {
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
                    }
                ]
            },
            {
                channel: "ui", // Channel name for UI-related events
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

    /**
     * Define publication specifications.
     * Currently, HomeContent does not publish any events, but the structure is in place
     * for future event publications.
     */
    const publicationSpec = {
        publications: [
            // Example: Uncomment and define events if HomeContent needs to publish any.
            // {
            //     channel: "home",
            //     event: "init",
            //     description: "Publishes an init event when HomeContent initializes.",
            //     condition: "When HomeContent mounts.",
            //     dataFormat: {
            //         timestamp: "string (ISO 8601 format)",
            //     },
            //     exampleData: {
            //         timestamp: "2024-05-01T12:00:00Z",
            //     },
            // },
        ],
    };

    /**
     * Merge the subscription and publication specifications with any extended specs.
     */
    const mergedSubscriptionSpec = mergeSubscriptionSpecs(initialSubscriptionSpec, extendedSubscriptionSpec);
    const mergedPublicationSpec = mergePublicationSpecs(publicationSpec, extendedPublishSpec);

    /**
     * Define custom event handlers specific to HomeContent.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const customHandlers = {
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
        console.log(`HomeContent (${name}) received 'system:start' event with data:`, data);
        // Implement additional logic for handling the start event if needed
    }

    /**
     * Handler for 'system:stop' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`HomeContent (${name}) received 'system:stop' event with data:`, data);
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
        const { windowSize } = data.data;
        const { width } = windowSize;

        console.log(`HomeContent (${data.accountName}) received 'ui:windowSizeChange' event with width: ${width}px`);

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
    const handleEvent = ({ channel, event, data }) => {
        const handlerKey = `${channel}:${event}`;
        console.log(`HomeContent: Received event '${handlerKey}' with data:`, data);
        if (typeof customHandlers[handlerKey] === 'function') {
            customHandlers[handlerKey](data);
        } else {
            console.warn(`HomeContent: No handler implemented for event '${event}' on channel '${channel}'.`);
        }
    };

    /**
     * Registers event handlers with the mediator upon component mount.
     * Also fetches initial data or performs any initialization logic.
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
                console.log(`HomeContent (${name}) initialized.`);
                // Publish an initialization event if needed
                // Example: mediator.publish(name, code, 'home', 'init', { timestamp: new Date().toISOString() }, Date.now());
            },
            destroy: () => {
                console.log(`HomeContent (${name}) destroyed.`);
                // Perform any necessary cleanup here
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
                handleEvent, // Ensure to pass the same handleEvent for unregistration
                getComponentFullSpec: () => ({
                    name,
                    code,
                    description,
                    subscriptionSpec: mergedSubscriptionSpec,
                    publicationSpec: mergedPublicationSpec,
                }),
                initialize: () => {
                    console.log(`HomeContent (${name}) initialized.`);
                },
                destroy: () => {
                    console.log(`HomeContent (${name}) destroyed.`);
                },
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

    /**
     * Example function to publish an event.
     * This can be triggered based on specific actions within the component.
     * Currently unused but structured for future use.
     */
    const triggerWelcome = () => {
        mediator.publish(name, code, 'home', 'welcome', { message: 'Hello from HomeContent!' }, Date.now());
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
                Home
            </Typography>
            <Typography variant="body1" align="center" sx={{ maxWidth: 600 }}>
                Welcome to the Home page! This is the central hub of your application where you can access various features and navigate through different sections.
            </Typography>
            {/* Example button to trigger an event */}
            {/* Uncomment the Button below if you implement the 'home:welcome' handler */}
            {/* 
            <Button
                variant="contained"
                color="primary"
                onClick={triggerWelcome}
                sx={{ marginTop: 4 }}
            >
                Trigger Welcome Event
            </Button> 
            */}
        </Box>
    );
};

/**
 * Define PropTypes for type checking.
 */
HomeContent.propTypes = {
    name: PropTypes.string.isRequired,                  // The unique name of the HomeContent instance
    code: PropTypes.string.isRequired,                  // The unique code identifier for the HomeContent
    description: PropTypes.string.isRequired,           // A brief description of the HomeContent
    extendedPublishSpec: PropTypes.object,              // Extended publication specifications for additional events
    extendedSubscriptionSpec: PropTypes.object,         // Extended subscription specifications for additional events
};

export default React.memo(HomeContent);
