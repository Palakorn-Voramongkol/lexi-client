// src/components/AccountIcon.js

import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { IconButton, Tooltip } from '@mui/material' // Material-UI components for layout and styling
import AccountCircleIcon from '@mui/icons-material/AccountCircle' // Icon representing user account

import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../BaseComponent/mergeSpec' // Utility functions for merging specs
import { useMediator } from '../../contexts/MediatorContext' // Hook to access mediator via Context

/**
 * AccountIcon Functional Component
 *
 * Displays an account icon with tooltip and handles user interactions.
 * Integrates with a mediator for event-driven communication, subscribing to system events
 * and potentially publishing user-related events.
 *
 * @param {Object} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered AccountIcon component.
 */
const AccountIcon = ({
    name,
    code,
    description,
    onClick = () => {}, // Default to an empty function if not provided
    color,
    extendedSubscriptionSpec = {},
    extendedPublishSpec = {},
}) => {
    const mediator = useMediator() // Access mediator via Context

    /**
     * Define subscription specifications.
     */
    const subscriptionSpec = {
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
                channel: 'ui', // Channel name for UI-level events
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
        ],
    }

    /**
     * Define publication specifications.
     */
    const publicationSpec = {
        publications: [
            {
                channel: 'user', // Channel name for user-related publications
                event: 'accountUpdate', // Event name indicating an account update
                description: 'Publishes account update events when user interacts with the account icon.',
                condition: 'User clicks the account icon',
                dataFormat: {
                    userId: 'integer', // ID of the user performing the action
                    action: 'string', // Action performed by the user (e.g., 'view', 'edit')
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the action
                },
                exampleData: {
                    userId: 1234,
                    action: 'view',
                    timestamp: '2024-05-01T14:30:00Z',
                },
            },
        ],
    }

    /**
     * Merge the subscription and publication specifications with any extended specs.
     */
    const mergedSubscriptionSpec = mergeSubscriptionSpecs(subscriptionSpec, extendedSubscriptionSpec)
    const mergedPublicationSpec = mergePublicationSpecs(publicationSpec, extendedPublishSpec)

    /**
     * Define custom event handlers specific to AccountIcon.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const customHandlers = {
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'ui:windowSizeChange': handleWindowSizeChange, // Newly added handler
    }

    /**
     * Handler for 'system:start' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStart(data) {
        console.log(`AccountIcon (${data.componentName}) received 'system:start' event with data:`, data.data)
        // Implement additional logic for handling the start event if needed
    }

    /**
     * Handler for 'system:stop' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`AccountIcon (${data.componentName}) received 'system:stop' event with data:`, data.data)
        // Implement additional logic for handling the stop event if needed
    }

    /**
     * Handler for 'ui:windowSizeChange' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleWindowSizeChange(data) {
        console.log(`AccountIcon (${data.componentName}) received 'ui:windowSizeChange' event with data:`, data.data)
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
        const eventHandlers = {}

        // Dynamically assign handlers based on mergedSubscriptionSpec
        mergedSubscriptionSpec.subscriptions.forEach(({ channel, events }) => {
            events.forEach(({ name: eventName }) => {
                const handlerKey = `${channel}:${eventName}`
                if (typeof customHandlers[handlerKey] === 'function') {
                    eventHandlers[handlerKey] = customHandlers[handlerKey]
                } else {
                    console.warn(
                        `Handler for event '${eventName}' on channel '${channel}' is not implemented in AccountIcon.`
                    )
                }
            })
        })

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
            const handlerKey = `${channel}:${event}`
            console.log(`AccountIcon: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2))
            if (typeof eventHandlers[handlerKey] === 'function') {
                eventHandlers[handlerKey]({
                    componentName,
                    componentCode,
                    channel,
                    event,
                    data,
                    timestamp,
                })
            } else {
                console.warn(`No handler implemented for event '${event}' on channel '${channel}' in AccountIcon.`)
            }
        }

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
                console.log(`AccountIcon (${name}) initialized.`)
                // Additional initialization logic if needed
            },
            destroy: () => {
                console.log(`AccountIcon (${name}) destroyed.`)
                // Additional cleanup logic if needed
            },
        })

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
                    console.log(`AccountIcon (${name}) initialized.`)
                },
                destroy: () => {
                    console.log(`AccountIcon (${name}) destroyed.`)
                },
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Empty dependency array ensures this runs once on mount and cleans up on unmount

    /**
     * Example function to publish an account update event.
     * This can be triggered based on specific actions within the component.
     */
    const triggerAccountUpdate = (action) => {
        const timestamp = new Date().toISOString()
        const userId = 1234 // Example user ID, should be dynamic based on authenticated user

        const eventData = {
            userId,
            action, // e.g., 'view', 'edit'
            timestamp,
        }

        mediator.publish(name, code, 'user', 'accountUpdate', eventData, Date.now())
    }

    /**
     * Handles the click event on the account icon.
     * Publishes an 'accountUpdate' event and invokes the passed-in onClick handler.
     */
    const handleAccountClick = () => {
        triggerAccountUpdate('view') // Example action
        onClick() // Invoke the parent component's click handler
    }

    /**
     * Render the AccountIcon component.
     * The component includes a tooltip and an icon button that can trigger actions when clicked.
     */
    return (
        <Tooltip title="Account" placement="bottom">
            <IconButton
                onClick={handleAccountClick}
                aria-label="Account"
                sx={(theme) => ({
                    color: color || theme.palette.menu.iconColor, // Use the color prop or fallback to theme's icon color
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover, // Use theme's action hover color for better consistency
                    },
                })}
            >
                <AccountCircleIcon
                    sx={(theme) => ({
                        color: color || theme.palette.menu.iconColor, // Use the color prop or fallback to theme's icon color
                    })}
                />
            </IconButton>
        </Tooltip>
    )
}

/**
 * Define PropTypes for type checking.
 * Ensures that the component receives the correct types of props.
 */
AccountIcon.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the AccountIcon instance
    code: PropTypes.string.isRequired, // The unique code identifier for the AccountIcon
    description: PropTypes.string.isRequired, // A brief description of the AccountIcon
    onClick: PropTypes.func, // Function to handle click events
    color: PropTypes.string, // Color of the AccountCircleIcon
    extendedPublishSpec: PropTypes.object, // Extended publish specifications for additional events
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications for additional events
}

/**
 * Wraps the AccountIcon component with React.memo to prevent unnecessary re-renders.
 * This optimization enhances performance, especially when the component receives stable props.
 */
export default React.memo(AccountIcon)
