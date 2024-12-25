// src/components/AuthenService.js

import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../../components/BaseComponent/mergeSpec' // Utility functions for merging specs
import { useMediator } from '../../contexts/MediatorContext' // Hook to access mediator via Context
import apiClient from '../apiClient'

const AuthenService = ({ name, code, description, extendedSubscriptionSpec = {}, extendedPublishSpec = {} }) => {
    const mediator = useMediator() // Access mediator via Context


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
                    }
                ]
            },
            {
                channel: 'authen', // Channel name for authentication-related events
                events: [
                    {
                        name: 'loginRequested', // Event name indicating a login attempt by the user
                        description: 'Handles user login requests by initiating authentication processes.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            username: 'string', // Username provided by the user
                        },
                    },
                    {
                        name: 'logoutRequested', // Event name indicating a logout attempt by the user
                        description: 'Handles user logout requests by terminating active sessions.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            userId: 'integer', // ID of the user attempting to logout
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
                channel: 'authen', // Channel name for authentication-related publications
                event: 'loginSucceeded', // Event name indicating a successful login
                description: 'Emits an event signaling that a user has successfully logged in.',
                condition: 'User provides valid credentials and authentication succeeds.',
                dataFormat: {
                    userId: 'integer', // ID of the user who logged in
                    username: 'string', // Username of the logged-in user
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the login event
                },
                exampleData: {
                    userId: 1234,
                    username: 'john_doe',
                    timestamp: '2024-05-01T14:30:00Z',
                },
            },
            {
                channel: 'authen', // Channel name for authentication-related publications
                event: 'loginFailed', // Event name indicating a failed login attempt
                description: "Emits an event signaling that a user's login attempt has failed.",
                condition: 'User provides invalid credentials or authentication fails.',
                dataFormat: {
                    userId: 'integer', // ID of the user attempting to login (if available)
                    username: 'string', // Username provided during the login attempt
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the failed login attempt
                    reason: 'string', // Reason for the login failure (e.g., "Invalid password")
                },
                exampleData: {
                    userId: 1234,
                    username: 'john_doe',
                    timestamp: '2024-05-01T14:35:00Z',
                    reason: 'Invalid password',
                },
            },
            {
                channel: 'authen', // Channel name for authentication-related publications
                event: 'logoutSucceeded', // Event name indicating a successful logout
                description: 'Emits an event signaling that a user has successfully logged out.',
                condition: 'User successfully terminates their session.',
                dataFormat: {
                    userId: 'integer', // ID of the user who logged out
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the logout event
                },
                exampleData: {
                    userId: 1234,
                    timestamp: '2024-05-01T15:00:00Z',
                },
            },
            {
                channel: 'authen', // Channel name for authentication-related publications
                event: 'logoutFailed', // Event name indicating a failed logout attempt
                description: "Emits an event signaling that a user's logout attempt has failed.",
                condition: 'An error occurs while attempting to terminate the user session.',
                dataFormat: {
                    userId: 'integer', // ID of the user attempting to logout (if available)
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the failed logout attempt
                    reason: 'string', // Reason for the logout failure (e.g., "Session not found")
                },
                exampleData: {
                    userId: 1234,
                    timestamp: '2024-05-01T15:05:00Z',
                    reason: 'Session not found',
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
     * Define custom event handlers specific to AuthenService.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const customHandlers = {
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'ui:windowSizeChange': handleWindowSizeChange,
        'authen:loginRequested': handleLoginRequested, // Added handler
        'authen:logoutRequested': handleLogoutRequested, // Added handler
    }

    /**
     * Handler for 'system:start' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStart(data) {
        console.log(`AuthenService (${data.componentName}) received 'system:start' event with data:`, data.data)
        // Implement additional logic for handling the start event if needed
    }

    /**
     * Handler for 'system:stop' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`AuthenService (${data.componentName}) received 'system:stop' event with data:`, data.data)
        // Implement additional logic for handling the stop event if needed
    }

    /**
     * Handler for 'ui:windowSizeChange' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleWindowSizeChange(data) {
        console.log(`AuthenService (${data.componentName}) received 'ui:windowSizeChange' event with data:`, data.data)
        // Implement additional logic for handling window size changes if needed
    }

    /**
     * Authenticates a user with the provided username and password.
     *
     * @param {string} username - The user's username.
     * @param {string} password - The user's password.
     * @returns {Promise<Object>} - Resolves with user data and token on success.
     * @throws {Error} - Throws an error if authentication fails.
     */
    const authenticateUser = async (username, password) => {
        try {
            const response = await apiClient.post('/auth/login', {
                username,
                password,
            })

            const { userId, username: returnedUsername, token, timestamp } = response.data

            // Store the token securely (consider using httpOnly cookies for enhanced security)
            localStorage.setItem('authToken', token)

            return { userId, username: returnedUsername, token, timestamp }
        } catch (error) {
            // Extract error message from response if available
            const errorMessage = error.response?.data?.message || 'Authentication failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Handler for 'authen:loginRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleLoginRequested(data) {
        console.log(`AuthenService: Received 'authen:loginRequested' event with data:`, data.data)

        const { userName, password, timestamp } = data.data

        // Implement your login logic here.
        // For example, initiate authentication API calls.

        // Example:
        authenticateUser(userName, password)
            .then((userData) => {
                // On successful authentication, publish 'loginSucceeded'
                mediator.publish(
                    name,
                    code,
                    'authen',
                    'loginSucceeded',
                    {
                        userId: userData.id,
                        username: userData.username,
                        timestamp: new Date().toISOString(),
                    },
                    Date.now()
                )
            })
            .catch((error) => {
                // On authentication failure, publish 'loginFailed'
                mediator.publish(
                    name,
                    code,
                    'authen',
                    'loginFailed',
                    {
                        username: userName,
                        timestamp: new Date().toISOString(),
                        reason: error.message,
                    },
                    Date.now()
                )
            })
    }

    /**
     * Logs out a user by invalidating their token.
     *
     * @param {number} userId - The ID of the user to logout.
     * @param {string} token - The user's authentication token.
     * @returns {Promise<Object>} - Resolves with a success message on successful logout.
     * @throws {Error} - Throws an error if logout fails.
     */
    const logoutUser = async (userId, token) => {
        try {
            const response = await apiClient.post('/auth/logout', {
                userId,
                token,
            })

            // Remove the token from storage
            localStorage.removeItem('authToken')

            return response.data // { message: 'Logout successful.', timestamp: '...' }
        } catch (error) {
            // Extract error message from response if available
            const errorMessage = error.response?.data?.message || 'Logout failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Handler for 'authen:logoutRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleLogoutRequested(data) {
        console.log(`AuthenService: Received 'authen:logoutRequested' event with data:`, data.data)

        const { userId, timestamp } = data.data

        // Implement your logout logic here.
        // For example, terminate user sessions.

        // Example:
        logoutUser(userId)
            .then(() => {
                // On successful logout, publish 'logoutSucceeded'
                mediator.publish(
                    name,
                    code,
                    'authen',
                    'logoutSucceeded',
                    {
                        userId: userId,
                        timestamp: new Date().toISOString(),
                    },
                    Date.now()
                )
            })
            .catch((error) => {
                // On logout failure, publish 'logoutFailed'
                mediator.publish(
                    name,
                    code,
                    'authen',
                    'logoutFailed',
                    {
                        userId: userId,
                        timestamp: new Date().toISOString(),
                        reason: error.message,
                    },
                    Date.now()
                )
            })
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
                        `Handler for event '${eventName}' on channel '${channel}' is not implemented in AuthenService.`
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
            console.log(`AuthenService: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2))
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
                console.warn(`No handler implemented for event '${event}' on channel '${channel}' in AuthenService.`)
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
                console.log(`AuthenService (${name}) initialized.`)
                // Additional initialization logic if needed
            },
            destroy: () => {
                console.log(`AuthenService (${name}) destroyed.`)
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
                    console.log(`AuthenService (${name}) initialized.`)
                },
                destroy: () => {
                    console.log(`AuthenService (${name}) destroyed.`)
                },
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Empty dependency array ensures this runs once on mount and cleans up on unmount
}

/**
 * Define PropTypes for type checking.
 * Ensures that the component receives the correct types of props.
 */
AuthenService.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the AuthenService instance
    code: PropTypes.string.isRequired, // The unique code identifier for the AuthenService
    description: PropTypes.string.isRequired, // A brief description of the AuthenService
    extendedPublishSpec: PropTypes.object, // Extended publish specifications for additional events
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications for additional events
}

/**
 * Wraps the AuthenService component with React.memo to prevent unnecessary re-renders.
 * This optimization enhances performance, especially when the component receives stable props.
 */
export default React.memo(AuthenService)
