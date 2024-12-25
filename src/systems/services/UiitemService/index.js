// src/components/UiitemService.js

import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../../components/BaseComponent/mergeSpec' // Utility functions for merging specs
import { useMediator } from '../../contexts/MediatorContext' // Hook to access mediator via Context
import apiClient from '../apiClient'

const UiitemService = ({ name, code, description, extendedSubscriptionSpec = {}, extendedPublishSpec = {} }) => {
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
                        description: 'Handles the application start event to initialize UI item management.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                        },
                    },
                    {
                        name: 'stop', // Event name indicating the stop of the application
                        description: 'Handles the application stop event to perform cleanup in UI item management.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                        },
                    },
                ],
            },
            {
                channel: 'uiitem', // Channel name for UI item-related events
                events: [
                    {
                        name: 'createUiitemRequested', // Event name indicating a UI item creation request
                        description: 'Handles requests to create a new UI item.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            code: 'string', // Code of the UI item to be created
                            name: 'string', // Name of the UI item to be created
                            description: 'string', // Description of the UI item to be created
                        },
                    },
                    {
                        name: 'updateUiitemRequested', // Event name indicating a UI item update request
                        description: 'Handles requests to update an existing UI item.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            id: 'integer', // ID of the UI item to be updated
                            code: 'string', // (Optional) New code for the UI item
                            name: 'string', // (Optional) New name for the UI item
                            description: 'string', // (Optional) New description for the UI item
                        },
                    },
                    {
                        name: 'deleteUiitemRequested', // Event name indicating a UI item deletion request
                        description: 'Handles requests to delete an existing UI item.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            id: 'integer', // ID of the UI item to be deleted
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
                channel: 'uiitem', // Channel name for UI item-related publications
                event: 'createUiitemSucceeded', // Event name indicating successful UI item creation
                description: 'Emits an event signaling that a UI item has been successfully created.',
                condition: 'UI item creation API call succeeds.',
                dataFormat: {
                    id: 'integer', // ID of the newly created UI item
                    code: 'string', // Code of the UI item
                    name: 'string', // Name of the UI item
                    description: 'string', // Description of the UI item
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    id: 501,
                    code: 'BTN_SAVE',
                    name: 'Save Button',
                    description: 'Button to save the current form.',
                    timestamp: '2024-05-01T20:00:00Z',
                },
            },
            {
                channel: 'uiitem', // Channel name for UI item-related publications
                event: 'createUiitemFailed', // Event name indicating failed UI item creation
                description: "Emits an event signaling that a UI item's creation attempt has failed.",
                condition: 'UI item creation API call fails.',
                dataFormat: {
                    code: 'string', // Code attempted to be created
                    name: 'string', // Name attempted to be created
                    description: 'string', // Description attempted to be created
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    code: 'BTN_SAVE',
                    name: 'Save Button',
                    description: 'Button to save the current form.',
                    timestamp: '2024-05-01T20:05:00Z',
                    reason: 'UI item code already exists.',
                },
            },
            {
                channel: 'uiitem', // Channel name for UI item-related publications
                event: 'updateUiitemSucceeded', // Event name indicating successful UI item update
                description: 'Emits an event signaling that a UI item has been successfully updated.',
                condition: 'UI item update API call succeeds.',
                dataFormat: {
                    id: 'integer', // ID of the updated UI item
                    code: 'string', // Updated code
                    name: 'string', // Updated name
                    description: 'string', // Updated description
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    id: 501,
                    code: 'BTN_SAVE_UPDATED',
                    name: 'Save Button Updated',
                    description: 'Updated button to save the current form.',
                    timestamp: '2024-05-01T20:10:00Z',
                },
            },
            {
                channel: 'uiitem', // Channel name for UI item-related publications
                event: 'updateUiitemFailed', // Event name indicating failed UI item update
                description: "Emits an event signaling that a UI item's update attempt has failed.",
                condition: 'UI item update API call fails.',
                dataFormat: {
                    id: 'integer', // ID of the UI item attempted to be updated
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    id: 501,
                    timestamp: '2024-05-01T20:15:00Z',
                    reason: 'UI item not found.',
                },
            },
            {
                channel: 'uiitem', // Channel name for UI item-related publications
                event: 'deleteUiitemSucceeded', // Event name indicating successful UI item deletion
                description: 'Emits an event signaling that a UI item has been successfully deleted.',
                condition: 'UI item deletion API call succeeds.',
                dataFormat: {
                    id: 'integer', // ID of the deleted UI item
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    id: 501,
                    timestamp: '2024-05-01T20:20:00Z',
                },
            },
            {
                channel: 'uiitem', // Channel name for UI item-related publications
                event: 'deleteUiitemFailed', // Event name indicating failed UI item deletion
                description: "Emits an event signaling that a UI item's deletion attempt has failed.",
                condition: 'UI item deletion API call fails.',
                dataFormat: {
                    id: 'integer', // ID of the UI item attempted to be deleted
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    id: 501,
                    timestamp: '2024-05-01T20:25:00Z',
                    reason: 'UI item not found.',
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
     * Handler for 'system:start' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStart(data) {
        console.log(`UiitemService (${data.componentName}) received 'system:start' event with data:`, data.data)
        // Implement additional logic for handling the start event if needed
    }

    /**
     * Handler for 'system:stop' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`UiitemService (${data.componentName}) received 'system:stop' event with data:`, data.data)
        // Implement additional logic for handling the stop event if needed
    }

    /**
     * Handler for 'ui:windowSizeChange' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleWindowSizeChange(data) {
        console.log(`UiitemService (${data.componentName}) received 'ui:windowSizeChange' event with data:`, data.data)
        // Implement additional logic for handling window size changes if needed
    }

    /**
     * Creates a new UI item by interacting with the backend API.
     *
     * @param {string} code - The code of the UI item.
     * @param {string} name - The name of the UI item.
     * @param {string} description - The description of the UI item.
     * @returns {Promise<Object>} - Resolves with UI item data on success.
     * @throws {Error} - Throws an error if UI item creation fails.
     */
    const createUiitem = async (code, name, description) => {
        try {
            const response = await apiClient.post('/Uiitem', {
                code,
                name,
                description,
            })

            // Handle both 200 and 201 responses
            if (response.status === 200 || response.status === 201) {
                const { id, code: returnedCode, name: returnedName, description: returnedDescription } = response.data

                return {
                    id,
                    code: returnedCode,
                    name: returnedName,
                    description: returnedDescription,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'UI item creation failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Updates an existing UI item by interacting with the backend API.
     *
     * @param {number} id - The ID of the UI item to update.
     * @param {string} [code] - The new code of the UI item.
     * @param {string} [name] - The new name of the UI item.
     * @param {string} [description] - The new description of the UI item.
     * @returns {Promise<Object>} - Resolves with updated UI item data on success.
     * @throws {Error} - Throws an error if UI item update fails.
     */
    const updateUiitem = async (id, code, name, description) => {
        try {
            const payload = {}
            if (code) payload.code = code
            if (name) payload.name = name
            if (description) payload.description = description

            const response = await apiClient.put(`/Uiitem/${id}`, payload)

            if (response.status === 200 || response.status === 204) {
                if (response.status === 200) {
                    const {
                        id: updatedId,
                        code: updatedCode,
                        name: updatedName,
                        description: updatedDescription,
                    } = response.data

                    return {
                        id: updatedId,
                        code: updatedCode,
                        name: updatedName,
                        description: updatedDescription,
                        timestamp: new Date().toISOString(),
                    }
                } else {
                    // For 204 No Content, return the id and timestamp
                    return {
                        id,
                        timestamp: new Date().toISOString(),
                    }
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'UI item update failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Deletes an existing UI item by interacting with the backend API.
     *
     * @param {number} id - The ID of the UI item to delete.
     * @returns {Promise<Object>} - Resolves with deletion confirmation on success.
     * @throws {Error} - Throws an error if UI item deletion fails.
     */
    const deleteUiitem = async (id) => {
        try {
            const response = await apiClient.delete(`/Uiitem/${id}`)

            if (response.status === 200 || response.status === 204) {
                return {
                    id,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'UI item deletion failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Handler for 'uiitem:createUiitemRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleCreateUiitemRequested = async (data) => {
        console.log(`UiitemService: Received 'uiitem:createUiitemRequested' event with data:`, data.data)

        const { code, name, description, timestamp } = data.data

        try {
            const uiitemData = await createUiitem(code, name, description)

            // On successful creation, publish 'createUiitemSucceeded'
            mediator.publish(
                name,
                code,
                'uiitem',
                'createUiitemSucceeded',
                {
                    id: uiitemData.id,
                    code: uiitemData.code,
                    name: uiitemData.name,
                    description: uiitemData.description,
                    timestamp: uiitemData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'createUiitemFailed'
            mediator.publish(
                name,
                code,
                'uiitem',
                'createUiitemFailed',
                {
                    code,
                    name,
                    description,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'uiitem:updateUiitemRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleUpdateUiitemRequested = async (data) => {
        console.log(`UiitemService: Received 'uiitem:updateUiitemRequested' event with data:`, data.data)

        const { id, code, name, description, timestamp } = data.data

        try {
            const updatedUiitemData = await updateUiitem(id, code, name, description)

            // On successful update, publish 'updateUiitemSucceeded'
            mediator.publish(
                name,
                code,
                'uiitem',
                'updateUiitemSucceeded',
                {
                    id: updatedUiitemData.id,
                    code: updatedUiitemData.code,
                    name: updatedUiitemData.name,
                    description: updatedUiitemData.description,
                    timestamp: updatedUiitemData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'updateUiitemFailed'
            mediator.publish(
                name,
                code,
                'uiitem',
                'updateUiitemFailed',
                {
                    id: id,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'uiitem:deleteUiitemRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleDeleteUiitemRequested = async (data) => {
        console.log(`UiitemService: Received 'uiitem:deleteUiitemRequested' event with data:`, data.data)

        const { id, timestamp } = data.data

        try {
            const deleteResponse = await deleteUiitem(id)

            // On successful deletion, publish 'deleteUiitemSucceeded'
            mediator.publish(
                name,
                code,
                'uiitem',
                'deleteUiitemSucceeded',
                {
                    id: deleteResponse.id,
                    timestamp: deleteResponse.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'deleteUiitemFailed'
            mediator.publish(
                name,
                code,
                'uiitem',
                'deleteUiitemFailed',
                {
                    id: id,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Define custom event handlers specific to UiitemService.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const customHandlers = {
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'ui:windowSizeChange': handleWindowSizeChange,
        'uiitem:createUiitemRequested': handleCreateUiitemRequested,
        'uiitem:updateUiitemRequested': handleUpdateUiitemRequested,
        'uiitem:deleteUiitemRequested': handleDeleteUiitemRequested,
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
                        `Handler for event '${eventName}' on channel '${channel}' is not implemented in UiitemService.`
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
            console.log(`UiitemService: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2))
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
                console.warn(`No handler implemented for event '${event}' on channel '${channel}' in UiitemService.`)
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
                console.log(`UiitemService (${name}) initialized.`)
                // Additional initialization logic if needed
            },
            destroy: () => {
                console.log(`UiitemService (${name}) destroyed.`)
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
                    console.log(`UiitemService (${name}) initialized.`)
                },
                destroy: () => {
                    console.log(`UiitemService (${name}) destroyed.`)
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
UiitemService.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the UiitemService instance
    code: PropTypes.string.isRequired, // The unique code identifier for the UiitemService
    description: PropTypes.string.isRequired, // A brief description of the UiitemService
    extendedPublishSpec: PropTypes.object, // Extended publish specifications for additional events
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications for additional events
}

/**
 * Wraps the UiitemService component with React.memo to prevent unnecessary re-renders.
 * This optimization enhances performance, especially when the component receives stable props.
 */
export default React.memo(UiitemService)
