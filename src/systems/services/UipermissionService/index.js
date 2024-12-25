// src/components/UipermissionService.js

import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../../components/BaseComponent/mergeSpec' // Utility functions for merging specs
import { useMediator } from '../../contexts/MediatorContext' // Hook to access mediator via Context
import apiClient from '../apiClient'

const UipermissionService = ({ name, code, description, extendedSubscriptionSpec = {}, extendedPublishSpec = {} }) => {
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
                        description: 'Handles the application start event to initialize UI permission management.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                        },
                    },
                    {
                        name: 'stop', // Event name indicating the stop of the application
                        description:
                            'Handles the application stop event to perform cleanup in UI permission management.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                        },
                    },
                ],
            },
            {
                channel: 'uipermission', // Channel name for UI permission-related events
                events: [
                    {
                        name: 'createUipermissionRequested', // Event name indicating a UI permission creation request
                        description: 'Handles requests to create a new UI permission.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            code: 'string', // Code of the UI permission to be created
                            componentName: 'string', // Component name associated with the UI permission
                            accessLevel: 'integer', // Access level of the UI permission
                        },
                    },
                    {
                        name: 'updateUipermissionRequested', // Event name indicating a UI permission update request
                        description: 'Handles requests to update an existing UI permission.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            id: 'integer', // ID of the UI permission to be updated
                            code: 'string', // (Optional) New code for the UI permission
                            accessLevel: 'integer', // (Optional) New access level for the UI permission
                            permissionId: 'integer', // (Optional) Permission ID associated with the UI permission
                        },
                    },
                    {
                        name: 'deleteUipermissionRequested', // Event name indicating a UI permission deletion request
                        description: 'Handles requests to delete an existing UI permission.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            id: 'integer', // ID of the UI permission to be deleted
                        },
                    },
                    {
                        name: 'addUiitemToUipermissionRequested', // Event name indicating adding a UI item to a UI permission
                        description: 'Handles requests to add a UI item to a specific UI permission.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            uiitemId: 'integer', // ID of the UI item to add
                            uipermissionId: 'integer', // ID of the UI permission
                        },
                    },
                    {
                        name: 'removeUiitemFromUipermissionRequested', // Event name indicating removing a UI item from a UI permission
                        description: 'Handles requests to remove a UI item from a specific UI permission.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            uiitemId: 'integer', // ID of the UI item to remove
                            uipermissionId: 'integer', // ID of the UI permission
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
                channel: 'uipermission', // Channel name for UI permission-related publications
                event: 'createUipermissionSucceeded', // Event name indicating successful UI permission creation
                description: 'Emits an event signaling that a UI permission has been successfully created.',
                condition: 'UI permission creation API call succeeds.',
                dataFormat: {
                    id: 'integer', // ID of the newly created UI permission
                    code: 'string', // Code of the UI permission
                    accessLevel: 'integer', // Access level of the UI permission
                    permissionName: 'string', // Permission name derived from the access level or other logic
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    id: 601,
                    code: 'PERM_EDIT',
                    accessLevel: 2,
                    permissionName: 'Edit Permission',
                    timestamp: '2024-05-01T21:00:00Z',
                },
            },
            {
                channel: 'uipermission', // Channel name for UI permission-related publications
                event: 'createUipermissionFailed', // Event name indicating failed UI permission creation
                description: "Emits an event signaling that a UI permission's creation attempt has failed.",
                condition: 'UI permission creation API call fails.',
                dataFormat: {
                    code: 'string', // Code attempted to be created
                    componentName: 'string', // Component name attempted to be created
                    accessLevel: 'integer', // Access level attempted to be created
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    code: 'PERM_EDIT',
                    componentName: 'EditComponent',
                    accessLevel: 2,
                    timestamp: '2024-05-01T21:05:00Z',
                    reason: 'UI permission code already exists.',
                },
            },
            {
                channel: 'uipermission', // Channel name for UI permission-related publications
                event: 'updateUipermissionSucceeded', // Event name indicating successful UI permission update
                description: 'Emits an event signaling that a UI permission has been successfully updated.',
                condition: 'UI permission update API call succeeds.',
                dataFormat: {
                    id: 'integer', // ID of the updated UI permission
                    code: 'string', // Updated code
                    accessLevel: 'integer', // Updated access level
                    permissionName: 'string', // Updated permission name
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    id: 601,
                    code: 'PERM_EDIT_UPDATED',
                    accessLevel: 3,
                    permissionName: 'Advanced Edit Permission',
                    timestamp: '2024-05-01T21:10:00Z',
                },
            },
            {
                channel: 'uipermission', // Channel name for UI permission-related publications
                event: 'updateUipermissionFailed', // Event name indicating failed UI permission update
                description: "Emits an event signaling that a UI permission's update attempt has failed.",
                condition: 'UI permission update API call fails.',
                dataFormat: {
                    id: 'integer', // ID of the UI permission attempted to be updated
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    id: 601,
                    timestamp: '2024-05-01T21:15:00Z',
                    reason: 'UI permission not found.',
                },
            },
            {
                channel: 'uipermission', // Channel name for UI permission-related publications
                event: 'deleteUipermissionSucceeded', // Event name indicating successful UI permission deletion
                description: 'Emits an event signaling that a UI permission has been successfully deleted.',
                condition: 'UI permission deletion API call succeeds.',
                dataFormat: {
                    id: 'integer', // ID of the deleted UI permission
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    id: 601,
                    timestamp: '2024-05-01T21:20:00Z',
                },
            },
            {
                channel: 'uipermission', // Channel name for UI permission-related publications
                event: 'deleteUipermissionFailed', // Event name indicating failed UI permission deletion
                description: "Emits an event signaling that a UI permission's deletion attempt has failed.",
                condition: 'UI permission deletion API call fails.',
                dataFormat: {
                    id: 'integer', // ID of the UI permission attempted to be deleted
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    id: 601,
                    timestamp: '2024-05-01T21:25:00Z',
                    reason: 'UI permission not found.',
                },
            },
            {
                channel: 'uipermission', // Channel name for UI permission-related publications
                event: 'addUiitemToUipermissionSucceeded', // Event name indicating successful addition of a UI item to a UI permission
                description: 'Emits an event signaling that a UI item has been successfully added to a UI permission.',
                condition: 'Add UI item to UI permission API call succeeds.',
                dataFormat: {
                    uiitemId: 'integer', // ID of the UI item added
                    uipermissionId: 'integer', // ID of the UI permission
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    uiitemId: 701,
                    uipermissionId: 601,
                    timestamp: '2024-05-01T21:30:00Z',
                },
            },
            {
                channel: 'uipermission', // Channel name for UI permission-related publications
                event: 'addUiitemToUipermissionFailed', // Event name indicating failed addition of a UI item to a UI permission
                description: 'Emits an event signaling that adding a UI item to a UI permission has failed.',
                condition: 'Add UI item to UI permission API call fails.',
                dataFormat: {
                    uiitemId: 'integer', // ID of the UI item attempted to add
                    uipermissionId: 'integer', // ID of the UI permission
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    uiitemId: 701,
                    uipermissionId: 601,
                    timestamp: '2024-05-01T21:35:00Z',
                    reason: 'UI item already associated with the UI permission.',
                },
            },
            {
                channel: 'uipermission', // Channel name for UI permission-related publications
                event: 'removeUiitemFromUipermissionSucceeded', // Event name indicating successful removal of a UI item from a UI permission
                description:
                    'Emits an event signaling that a UI item has been successfully removed from a UI permission.',
                condition: 'Remove UI item from UI permission API call succeeds.',
                dataFormat: {
                    uiitemId: 'integer', // ID of the UI item removed
                    uipermissionId: 'integer', // ID of the UI permission
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    uiitemId: 701,
                    uipermissionId: 601,
                    timestamp: '2024-05-01T21:40:00Z',
                },
            },
            {
                channel: 'uipermission', // Channel name for UI permission-related publications
                event: 'removeUiitemFromUipermissionFailed', // Event name indicating failed removal of a UI item from a UI permission
                description: 'Emits an event signaling that removing a UI item from a UI permission has failed.',
                condition: 'Remove UI item from UI permission API call fails.',
                dataFormat: {
                    uiitemId: 'integer', // ID of the UI item attempted to remove
                    uipermissionId: 'integer', // ID of the UI permission
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    uiitemId: 701,
                    uipermissionId: 601,
                    timestamp: '2024-05-01T21:45:00Z',
                    reason: 'UI item not associated with the UI permission.',
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
        console.log(`UipermissionService (${data.componentName}) received 'system:start' event with data:`, data.data)
        // Implement additional logic for handling the start event if needed
    }

    /**
     * Handler for 'system:stop' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`UipermissionService (${data.componentName}) received 'system:stop' event with data:`, data.data)
        // Implement additional logic for handling the stop event if needed
    }

    /**
     * Handler for 'ui:windowSizeChange' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleWindowSizeChange(data) {
        console.log(
            `UipermissionService (${data.componentName}) received 'ui:windowSizeChange' event with data:`,
            data.data
        )
        // Implement additional logic for handling window size changes if needed
    }

    /**
     * Creates a new UI permission by interacting with the backend API.
     *
     * @param {string} code - The code of the UI permission.
     * @param {string} componentName - The component name associated with the UI permission.
     * @param {number} accessLevel - The access level of the UI permission.
     * @returns {Promise<Object>} - Resolves with UI permission data on success.
     * @throws {Error} - Throws an error if UI permission creation fails.
     */
    const createUipermission = async (code, componentName, accessLevel) => {
        try {
            const response = await apiClient.post('/Uipermission', {
                code,
                componentName,
                accessLevel,
            })

            // Handle both 200 and 201 responses
            if (response.status === 200 || response.status === 201) {
                const { id, code: returnedCode, accessLevel: returnedAccessLevel, permissionName } = response.data

                return {
                    id,
                    code: returnedCode,
                    accessLevel: returnedAccessLevel,
                    permissionName,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'UI permission creation failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Updates an existing UI permission by interacting with the backend API.
     *
     * @param {number} id - The ID of the UI permission to update.
     * @param {string} [code] - The new code of the UI permission.
     * @param {number} [accessLevel] - The new access level of the UI permission.
     * @param {number} [permissionId] - The new permission ID associated with the UI permission.
     * @returns {Promise<Object>} - Resolves with updated UI permission data on success.
     * @throws {Error} - Throws an error if UI permission update fails.
     */
    const updateUipermission = async (id, code, accessLevel, permissionId) => {
        try {
            const payload = {}
            if (code) payload.code = code
            if (accessLevel) payload.accessLevel = accessLevel
            if (permissionId !== undefined) payload.permissionId = permissionId

            const response = await apiClient.put(`/Uipermission/${id}`, payload)

            if (response.status === 200 || response.status === 204) {
                if (response.status === 200) {
                    const {
                        id: updatedId,
                        code: updatedCode,
                        accessLevel: updatedAccessLevel,
                        permissionName: updatedPermissionName,
                    } = response.data

                    return {
                        id: updatedId,
                        code: updatedCode,
                        accessLevel: updatedAccessLevel,
                        permissionName: updatedPermissionName,
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
            const errorMessage = error.response?.data?.message || 'UI permission update failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Deletes an existing UI permission by interacting with the backend API.
     *
     * @param {number} id - The ID of the UI permission to delete.
     * @returns {Promise<Object>} - Resolves with deletion confirmation on success.
     * @throws {Error} - Throws an error if UI permission deletion fails.
     */
    const deleteUipermission = async (id) => {
        try {
            const response = await apiClient.delete(`/Uipermission/${id}`)

            if (response.status === 200 || response.status === 204) {
                return {
                    id,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'UI permission deletion failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Adds a UI item to a specific UI permission by interacting with the backend API.
     *
     * @param {number} uiitemId - The ID of the UI item to add.
     * @param {number} uipermissionId - The ID of the UI permission.
     * @returns {Promise<Object>} - Resolves with addition confirmation on success.
     * @throws {Error} - Throws an error if adding UI item to UI permission fails.
     */
    const addUiitemToUipermission = async (uiitemId, uipermissionId) => {
        try {
            const response = await apiClient.post('/Uipermission/AddUiitem', {
                uiitemId,
                uipermissionId,
            })

            if (response.status === 200) {
                return {
                    uiitemId,
                    uipermissionId,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Adding UI item to UI permission failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Removes a UI item from a specific UI permission by interacting with the backend API.
     *
     * @param {number} uiitemId - The ID of the UI item to remove.
     * @param {number} uipermissionId - The ID of the UI permission.
     * @returns {Promise<Object>} - Resolves with removal confirmation on success.
     * @throws {Error} - Throws an error if removing UI item from UI permission fails.
     */
    const removeUiitemFromUipermission = async (uiitemId, uipermissionId) => {
        try {
            const response = await apiClient.delete('/Uipermission/RemoveUiitem', {
                data: {
                    uiitemId,
                    uipermissionId,
                },
            })

            if (response.status === 200) {
                return {
                    uiitemId,
                    uipermissionId,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Removing UI item from UI permission failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Handler for 'uipermission:createUipermissionRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleCreateUipermissionRequested = async (data) => {
        console.log(
            `UipermissionService: Received 'uipermission:createUipermissionRequested' event with data:`,
            data.data
        )

        const { code, componentName, accessLevel, timestamp } = data.data

        try {
            const uipermissionData = await createUipermission(code, componentName, accessLevel)

            // On successful creation, publish 'createUipermissionSucceeded'
            mediator.publish(
                name,
                code,
                'uipermission',
                'createUipermissionSucceeded',
                {
                    id: uipermissionData.id,
                    code: uipermissionData.code,
                    accessLevel: uipermissionData.accessLevel,
                    permissionName: uipermissionData.permissionName,
                    timestamp: uipermissionData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'createUipermissionFailed'
            mediator.publish(
                name,
                code,
                'uipermission',
                'createUipermissionFailed',
                {
                    code,
                    componentName,
                    accessLevel,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'uipermission:updateUipermissionRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleUpdateUipermissionRequested = async (data) => {
        console.log(
            `UipermissionService: Received 'uipermission:updateUipermissionRequested' event with data:`,
            data.data
        )

        const { id, code, accessLevel, permissionId, timestamp } = data.data

        try {
            const updatedUipermissionData = await updateUipermission(id, code, accessLevel, permissionId)

            // On successful update, publish 'updateUipermissionSucceeded'
            mediator.publish(
                name,
                code,
                'uipermission',
                'updateUipermissionSucceeded',
                {
                    id: updatedUipermissionData.id,
                    code: updatedUipermissionData.code,
                    accessLevel: updatedUipermissionData.accessLevel,
                    permissionName: updatedUipermissionData.permissionName,
                    timestamp: updatedUipermissionData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'updateUipermissionFailed'
            mediator.publish(
                name,
                code,
                'uipermission',
                'updateUipermissionFailed',
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
     * Handler for 'uipermission:deleteUipermissionRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleDeleteUipermissionRequested = async (data) => {
        console.log(
            `UipermissionService: Received 'uipermission:deleteUipermissionRequested' event with data:`,
            data.data
        )

        const { id, timestamp } = data.data

        try {
            const deleteResponse = await deleteUipermission(id)

            // On successful deletion, publish 'deleteUipermissionSucceeded'
            mediator.publish(
                name,
                code,
                'uipermission',
                'deleteUipermissionSucceeded',
                {
                    id: deleteResponse.id,
                    timestamp: deleteResponse.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'deleteUipermissionFailed'
            mediator.publish(
                name,
                code,
                'uipermission',
                'deleteUipermissionFailed',
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
     * Handler for 'uipermission:addUiitemToUipermissionRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleAddUiitemToUipermissionRequested = async (data) => {
        console.log(
            `UipermissionService: Received 'uipermission:addUiitemToUipermissionRequested' event with data:`,
            data.data
        )

        const { uiitemId, uipermissionId, timestamp } = data.data

        try {
            const addUiitemData = await addUiitemToUipermission(uiitemId, uipermissionId)

            // On successful addition, publish 'addUiitemToUipermissionSucceeded'
            mediator.publish(
                name,
                code,
                'uipermission',
                'addUiitemToUipermissionSucceeded',
                {
                    uiitemId: addUiitemData.uiitemId,
                    uipermissionId: addUiitemData.uipermissionId,
                    timestamp: addUiitemData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'addUiitemToUipermissionFailed'
            mediator.publish(
                name,
                code,
                'uipermission',
                'addUiitemToUipermissionFailed',
                {
                    uiitemId: uiitemId,
                    uipermissionId: uipermissionId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'uipermission:removeUiitemFromUipermissionRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleRemoveUiitemFromUipermissionRequested = async (data) => {
        console.log(
            `UipermissionService: Received 'uipermission:removeUiitemFromUipermissionRequested' event with data:`,
            data.data
        )

        const { uiitemId, uipermissionId, timestamp } = data.data

        try {
            const removeUiitemData = await removeUiitemFromUipermission(uiitemId, uipermissionId)

            // On successful removal, publish 'removeUiitemFromUipermissionSucceeded'
            mediator.publish(
                name,
                code,
                'uipermission',
                'removeUiitemFromUipermissionSucceeded',
                {
                    uiitemId: removeUiitemData.uiitemId,
                    uipermissionId: removeUiitemData.uipermissionId,
                    timestamp: removeUiitemData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'removeUiitemFromUipermissionFailed'
            mediator.publish(
                name,
                code,
                'uipermission',
                'removeUiitemFromUipermissionFailed',
                {
                    uiitemId: uiitemId,
                    uipermissionId: uipermissionId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Define custom event handlers specific to UipermissionService.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const customHandlers = {
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'ui:windowSizeChange': handleWindowSizeChange,
        'uipermission:createUipermissionRequested': handleCreateUipermissionRequested,
        'uipermission:updateUipermissionRequested': handleUpdateUipermissionRequested,
        'uipermission:deleteUipermissionRequested': handleDeleteUipermissionRequested,
        'uipermission:addUiitemToUipermissionRequested': handleAddUiitemToUipermissionRequested,
        'uipermission:removeUiitemFromUipermissionRequested': handleRemoveUiitemFromUipermissionRequested,
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
                        `Handler for event '${eventName}' on channel '${channel}' is not implemented in UipermissionService.`
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
            console.log(`UipermissionService: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2))
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
                console.warn(
                    `No handler implemented for event '${event}' on channel '${channel}' in UipermissionService.`
                )
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
                console.log(`UipermissionService (${name}) initialized.`)
                // Additional initialization logic if needed
            },
            destroy: () => {
                console.log(`UipermissionService (${name}) destroyed.`)
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
                    console.log(`UipermissionService (${name}) initialized.`)
                },
                destroy: () => {
                    console.log(`UipermissionService (${name}) destroyed.`)
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
UipermissionService.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the UipermissionService instance
    code: PropTypes.string.isRequired, // The unique code identifier for the UipermissionService
    description: PropTypes.string.isRequired, // A brief description of the UipermissionService
    extendedPublishSpec: PropTypes.object, // Extended publish specifications for additional events
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications for additional events
}

/**
 * Wraps the UipermissionService component with React.memo to prevent unnecessary re-renders.
 * This optimization enhances performance, especially when the component receives stable props.
 */
export default React.memo(UipermissionService)
