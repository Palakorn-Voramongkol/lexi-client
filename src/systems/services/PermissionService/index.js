// src/components/PermissionService.js

import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../../components/BaseComponent/mergeSpec' // Utility functions for merging specs
import { useMediator } from '../../contexts/MediatorContext' // Hook to access mediator via Context
import apiClient from '../apiClient'

const PermissionService = ({ name, code, description, extendedSubscriptionSpec = {}, extendedPublishSpec = {} }) => {
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
                        description: 'Handles the application start event to initialize permission management.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                        },
                    },
                    {
                        name: 'stop', // Event name indicating the stop of the application
                        description: 'Handles the application stop event to perform cleanup in permission management.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                        },
                    },
                ],
            },
            {
                channel: 'permission', // Channel name for permission-related events
                events: [
                    {
                        name: 'createPermissionRequested', // Event name indicating a permission creation request
                        description: 'Handles requests to create a new permission.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            code: 'string', // Code of the permission to be created
                            name: 'string', // Name of the permission to be created
                            permissionType: 'string', // Type of the permission
                            description: 'string', // Description of the permission
                        },
                    },
                    {
                        name: 'updatePermissionRequested', // Event name indicating a permission update request
                        description: 'Handles requests to update an existing permission.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            permissionId: 'integer', // ID of the permission to be updated
                            code: 'string', // (Optional) New code for the permission
                            name: 'string', // (Optional) New name for the permission
                            permissionType: 'string', // (Optional) New type for the permission
                            description: 'string', // (Optional) New description for the permission
                        },
                    },
                    {
                        name: 'deletePermissionRequested', // Event name indicating a permission deletion request
                        description: 'Handles requests to delete an existing permission.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            permissionId: 'integer', // ID of the permission to be deleted
                        },
                    },
                    {
                        name: 'addUipermissionRequested', // Event name indicating adding a UI permission
                        description: 'Handles requests to add a UI permission to an existing permission.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            permissionId: 'integer', // ID of the permission
                            uipermissionId: 'integer', // UI permission ID to add
                        },
                    },
                    {
                        name: 'removeUipermissionRequested', // Event name indicating removing a UI permission
                        description: 'Handles requests to remove a UI permission from an existing permission.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            permissionId: 'integer', // ID of the permission
                            uipermissionId: 'integer', // UI permission ID to remove
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
                channel: 'permission', // Channel name for permission-related publications
                event: 'createPermissionSucceeded', // Event name indicating successful permission creation
                description: 'Emits an event signaling that a permission has been successfully created.',
                condition: 'Permission creation API call succeeds.',
                dataFormat: {
                    permissionId: 'integer', // ID of the newly created permission
                    code: 'string', // Code of the permission
                    name: 'string', // Name of the permission
                    permissionType: 'string', // Type of the permission
                    description: 'string', // Description of the permission
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    permissionId: 7890,
                    code: 'VIEW_REPORTS',
                    name: 'View Reports',
                    permissionType: 'Read',
                    description: 'Allows viewing of reports.',
                    timestamp: '2024-05-01T17:00:00Z',
                },
            },
            {
                channel: 'permission', // Channel name for permission-related publications
                event: 'createPermissionFailed', // Event name indicating failed permission creation
                description: "Emits an event signaling that a permission's creation attempt has failed.",
                condition: 'Permission creation API call fails.',
                dataFormat: {
                    code: 'string', // Code of the permission attempted to be created
                    name: 'string', // Name of the permission attempted to be created
                    permissionType: 'string', // Type of the permission attempted
                    description: 'string', // Description attempted
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    code: 'VIEW_REPORTS',
                    name: 'View Reports',
                    permissionType: 'Read',
                    description: 'Allows viewing of reports.',
                    timestamp: '2024-05-01T17:05:00Z',
                    reason: 'Permission name already exists.',
                },
            },
            {
                channel: 'permission', // Channel name for permission-related publications
                event: 'updatePermissionSucceeded', // Event name indicating successful permission update
                description: 'Emits an event signaling that a permission has been successfully updated.',
                condition: 'Permission update API call succeeds.',
                dataFormat: {
                    permissionId: 'integer', // ID of the updated permission
                    code: 'string', // Updated code
                    name: 'string', // Updated name
                    permissionType: 'string', // Updated type
                    description: 'string', // Updated description
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    permissionId: 7890,
                    code: 'GENERATE_REPORTS',
                    name: 'Generate Reports',
                    permissionType: 'Write',
                    description: 'Allows generating of reports.',
                    timestamp: '2024-05-01T17:10:00Z',
                },
            },
            {
                channel: 'permission', // Channel name for permission-related publications
                event: 'updatePermissionFailed', // Event name indicating failed permission update
                description: "Emits an event signaling that a permission's update attempt has failed.",
                condition: 'Permission update API call fails.',
                dataFormat: {
                    permissionId: 'integer', // ID of the permission attempted to be updated
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    permissionId: 7890,
                    timestamp: '2024-05-01T17:15:00Z',
                    reason: 'Permission not found.',
                },
            },
            {
                channel: 'permission', // Channel name for permission-related publications
                event: 'deletePermissionSucceeded', // Event name indicating successful permission deletion
                description: 'Emits an event signaling that a permission has been successfully deleted.',
                condition: 'Permission deletion API call succeeds.',
                dataFormat: {
                    permissionId: 'integer', // ID of the deleted permission
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    permissionId: 7890,
                    timestamp: '2024-05-01T17:20:00Z',
                },
            },
            {
                channel: 'permission', // Channel name for permission-related publications
                event: 'deletePermissionFailed', // Event name indicating failed permission deletion
                description: "Emits an event signaling that a permission's deletion attempt has failed.",
                condition: 'Permission deletion API call fails.',
                dataFormat: {
                    permissionId: 'integer', // ID of the permission attempted to be deleted
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    permissionId: 7890,
                    timestamp: '2024-05-01T17:25:00Z',
                    reason: 'Permission is assigned to active roles.',
                },
            },
            {
                channel: 'permission', // Channel name for permission-related publications
                event: 'addUipermissionSucceeded', // Event name indicating successful addition of a UI permission
                description: 'Emits an event signaling that a UI permission has been successfully added.',
                condition: 'Add UI permission API call succeeds.',
                dataFormat: {
                    permissionId: 'integer', // ID of the permission
                    uipermissionId: 'integer', // UI permission ID that was added
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    permissionId: 7890,
                    uipermissionId: 1234,
                    timestamp: '2024-05-01T17:30:00Z',
                },
            },
            {
                channel: 'permission', // Channel name for permission-related publications
                event: 'addUipermissionFailed', // Event name indicating failed addition of a UI permission
                description: 'Emits an event signaling that adding a UI permission has failed.',
                condition: 'Add UI permission API call fails.',
                dataFormat: {
                    permissionId: 'integer', // ID of the permission
                    uipermissionId: 'integer', // UI permission ID attempted to add
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    permissionId: 7890,
                    uipermissionId: 1234,
                    timestamp: '2024-05-01T17:35:00Z',
                    reason: 'UI permission already exists.',
                },
            },
            {
                channel: 'permission', // Channel name for permission-related publications
                event: 'removeUipermissionSucceeded', // Event name indicating successful removal of a UI permission
                description: 'Emits an event signaling that a UI permission has been successfully removed.',
                condition: 'Remove UI permission API call succeeds.',
                dataFormat: {
                    permissionId: 'integer', // ID of the permission
                    uipermissionId: 'integer', // UI permission ID that was removed
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    permissionId: 7890,
                    uipermissionId: 1234,
                    timestamp: '2024-05-01T17:40:00Z',
                },
            },
            {
                channel: 'permission', // Channel name for permission-related publications
                event: 'removeUipermissionFailed', // Event name indicating failed removal of a UI permission
                description: 'Emits an event signaling that removing a UI permission has failed.',
                condition: 'Remove UI permission API call fails.',
                dataFormat: {
                    permissionId: 'integer', // ID of the permission
                    uipermissionId: 'integer', // UI permission ID attempted to remove
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    permissionId: 7890,
                    uipermissionId: 1234,
                    timestamp: '2024-05-01T17:45:00Z',
                    reason: 'UI permission does not exist.',
                },
            },
        ],
    }

    /**
     * Handler for 'system:start' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStart(data) {
        console.log(`PermissionService (${data.componentName}) received 'system:start' event with data:`, data.data)
        // Implement additional logic for handling the start event if needed
    }

    /**
     * Handler for 'system:stop' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`PermissionService (${data.componentName}) received 'system:stop' event with data:`, data.data)
        // Implement additional logic for handling the stop event if needed
    }

    /**
     * Handler for 'ui:windowSizeChange' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleWindowSizeChange(data) {
        console.log(
            `PermissionService (${data.componentName}) received 'ui:windowSizeChange' event with data:`,
            data.data
        )
        // Implement additional logic for handling window size changes if needed
    }

    /**
     * Creates a new permission by interacting with the backend API.
     *
     * @param {string} code - The code of the permission.
     * @param {string} name - The name of the permission.
     * @param {string} permissionType - The type of the permission.
     * @param {string} description - The description of the permission.
     * @returns {Promise<Object>} - Resolves with permission data on success.
     * @throws {Error} - Throws an error if permission creation fails.
     */
    const createPermission = async (code, name, permissionType, description) => {
        try {
            const response = await apiClient.post('/Permission', {
                code,
                name,
                permissionType,
                description,
            })

            // Handle both 200 and 201 responses
            if (response.status === 200 || response.status === 201) {
                const {
                    id: permissionId,
                    code: returnedCode,
                    name: returnedName,
                    permissionType: returnedPermissionType,
                    description: returnedDescription,
                } = response.data

                return {
                    permissionId,
                    code: returnedCode,
                    name: returnedName,
                    permissionType: returnedPermissionType,
                    description: returnedDescription,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Permission creation failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Updates an existing permission by interacting with the backend API.
     *
     * @param {number} permissionId - The ID of the permission to update.
     * @param {string} [code] - The new code of the permission.
     * @param {string} [name] - The new name of the permission.
     * @param {string} [permissionType] - The new type of the permission.
     * @param {string} [description] - The new description of the permission.
     * @returns {Promise<Object>} - Resolves with updated permission data on success.
     * @throws {Error} - Throws an error if permission update fails.
     */
    const updatePermission = async (permissionId, code, name, permissionType, description) => {
        try {
            const payload = {}
            if (code) payload.code = code
            if (name) payload.name = name
            if (permissionType) payload.permissionType = permissionType
            if (description) payload.description = description

            const response = await apiClient.put(`/Permission/${permissionId}`, payload)

            if (response.status === 200 || response.status === 204) {
                if (response.status === 200) {
                    const {
                        id: updatedPermissionId,
                        code: updatedCode,
                        name: updatedName,
                        permissionType: updatedPermissionType,
                        description: updatedDescription,
                    } = response.data

                    return {
                        permissionId: updatedPermissionId,
                        code: updatedCode,
                        name: updatedName,
                        permissionType: updatedPermissionType,
                        description: updatedDescription,
                        timestamp: new Date().toISOString(),
                    }
                } else {
                    // For 204 No Content, return the permissionId and timestamp
                    return {
                        permissionId,
                        timestamp: new Date().toISOString(),
                    }
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Permission update failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Deletes an existing permission by interacting with the backend API.
     *
     * @param {number} permissionId - The ID of the permission to delete.
     * @returns {Promise<Object>} - Resolves with deletion confirmation on success.
     * @throws {Error} - Throws an error if permission deletion fails.
     */
    const deletePermission = async (permissionId) => {
        try {
            const response = await apiClient.delete(`/Permission/${permissionId}`)

            if (response.status === 200 || response.status === 204) {
                return {
                    permissionId,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Permission deletion failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Adds a UI permission to an existing permission by interacting with the backend API.
     *
     * @param {number} permissionId - The ID of the permission.
     * @param {number} uipermissionId - The UI permission ID to add.
     * @returns {Promise<Object>} - Resolves with addition confirmation on success.
     * @throws {Error} - Throws an error if adding UI permission fails.
     */
    const addUipermission = async (permissionId, uipermissionId) => {
        try {
            const response = await apiClient.post('/Permission/AddUipermission', {
                permissionId,
                uipermissionId,
            })

            if (response.status === 200) {
                return {
                    permissionId,
                    uipermissionId,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Adding UI permission failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Removes a UI permission from an existing permission by interacting with the backend API.
     *
     * @param {number} permissionId - The ID of the permission.
     * @param {number} uipermissionId - The UI permission ID to remove.
     * @returns {Promise<Object>} - Resolves with removal confirmation on success.
     * @throws {Error} - Throws an error if removing UI permission fails.
     */
    const removeUipermission = async (permissionId, uipermissionId) => {
        try {
            const response = await apiClient.delete('/Permission/RemoveUipermission', {
                data: {
                    permissionId,
                    uipermissionId,
                },
            })

            if (response.status === 200) {
                return {
                    permissionId,
                    uipermissionId,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Removing UI permission failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Handler for 'permission:createPermissionRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleCreatePermissionRequested = async (data) => {
        console.log(`PermissionService: Received 'permission:createPermissionRequested' event with data:`, data.data)

        const { code, name, permissionType, description, timestamp } = data.data

        try {
            const permissionData = await createPermission(code, name, permissionType, description)

            // On successful creation, publish 'createPermissionSucceeded'
            mediator.publish(
                name,
                code,
                'permission',
                'createPermissionSucceeded',
                {
                    permissionId: permissionData.permissionId,
                    code: permissionData.code,
                    name: permissionData.name,
                    permissionType: permissionData.permissionType,
                    description: permissionData.description,
                    timestamp: permissionData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'createPermissionFailed'
            mediator.publish(
                name,
                code,
                'permission',
                'createPermissionFailed',
                {
                    code,
                    name,
                    permissionType,
                    description,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'permission:updatePermissionRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleUpdatePermissionRequested = async (data) => {
        console.log(`PermissionService: Received 'permission:updatePermissionRequested' event with data:`, data.data)

        const { permissionId, code, name, permissionType, description, timestamp } = data.data

        try {
            const updatedPermissionData = await updatePermission(permissionId, code, name, permissionType, description)

            // On successful update, publish 'updatePermissionSucceeded'
            mediator.publish(
                name,
                code,
                'permission',
                'updatePermissionSucceeded',
                {
                    permissionId: updatedPermissionData.permissionId,
                    code: updatedPermissionData.code,
                    name: updatedPermissionData.name,
                    permissionType: updatedPermissionData.permissionType,
                    description: updatedPermissionData.description,
                    timestamp: updatedPermissionData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'updatePermissionFailed'
            mediator.publish(
                name,
                code,
                'permission',
                'updatePermissionFailed',
                {
                    permissionId: permissionId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'permission:deletePermissionRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleDeletePermissionRequested = async (data) => {
        console.log(`PermissionService: Received 'permission:deletePermissionRequested' event with data:`, data.data)

        const { permissionId, timestamp } = data.data

        try {
            const deleteResponse = await deletePermission(permissionId)

            // On successful deletion, publish 'deletePermissionSucceeded'
            mediator.publish(
                name,
                code,
                'permission',
                'deletePermissionSucceeded',
                {
                    permissionId: deleteResponse.permissionId,
                    timestamp: deleteResponse.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'deletePermissionFailed'
            mediator.publish(
                name,
                code,
                'permission',
                'deletePermissionFailed',
                {
                    permissionId: permissionId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'permission:addUipermissionRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleAddUipermissionRequested = async (data) => {
        console.log(`PermissionService: Received 'permission:addUipermissionRequested' event with data:`, data.data)

        const { permissionId, uipermissionId, timestamp } = data.data

        try {
            const addUipermissionData = await addUipermission(permissionId, uipermissionId)

            // On successful addition, publish 'addUipermissionSucceeded'
            mediator.publish(
                name,
                code,
                'permission',
                'addUipermissionSucceeded',
                {
                    permissionId: addUipermissionData.permissionId,
                    uipermissionId: addUipermissionData.uipermissionId,
                    timestamp: addUipermissionData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'addUipermissionFailed'
            mediator.publish(
                name,
                code,
                'permission',
                'addUipermissionFailed',
                {
                    permissionId: permissionId,
                    uipermissionId: uipermissionId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'permission:removeUipermissionRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleRemoveUipermissionRequested = async (data) => {
        console.log(`PermissionService: Received 'permission:removeUipermissionRequested' event with data:`, data.data)

        const { permissionId, uipermissionId, timestamp } = data.data

        try {
            const removeUipermissionResponse = await removeUipermission(permissionId, uipermissionId)

            // On successful removal, publish 'removeUipermissionSucceeded'
            mediator.publish(
                name,
                code,
                'permission',
                'removeUipermissionSucceeded',
                {
                    permissionId: removeUipermissionResponse.permissionId,
                    uipermissionId: removeUipermissionResponse.uipermissionId,
                    timestamp: removeUipermissionResponse.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'removeUipermissionFailed'
            mediator.publish(
                name,
                code,
                'permission',
                'removeUipermissionFailed',
                {
                    permissionId: permissionId,
                    uipermissionId: uipermissionId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Merge the subscription and publication specifications with any extended specs.
     */
    const mergedSubscriptionSpec = mergeSubscriptionSpecs(subscriptionSpec, extendedSubscriptionSpec)
    const mergedPublicationSpec = mergePublicationSpecs(publicationSpec, extendedPublishSpec)

    /**
     * Define custom event handlers specific to PermissionService.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const customHandlers = {
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'ui:windowSizeChange': handleWindowSizeChange,
        'permission:createPermissionRequested': handleCreatePermissionRequested,
        'permission:updatePermissionRequested': handleUpdatePermissionRequested,
        'permission:deletePermissionRequested': handleDeletePermissionRequested,
        'permission:addUipermissionRequested': handleAddUipermissionRequested,
        'permission:removeUipermissionRequested': handleRemoveUipermissionRequested,
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
                        `Handler for event '${eventName}' on channel '${channel}' is not implemented in PermissionService.`
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
            console.log(`PermissionService: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2))
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
                    `No handler implemented for event '${event}' on channel '${channel}' in PermissionService.`
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
                console.log(`PermissionService (${name}) initialized.`)
                // Additional initialization logic if needed
            },
            destroy: () => {
                console.log(`PermissionService (${name}) destroyed.`)
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
                    console.log(`PermissionService (${name}) initialized.`)
                },
                destroy: () => {
                    console.log(`PermissionService (${name}) destroyed.`)
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
PermissionService.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the PermissionService instance
    code: PropTypes.string.isRequired, // The unique code identifier for the PermissionService
    description: PropTypes.string.isRequired, // A brief description of the PermissionService
    extendedPublishSpec: PropTypes.object, // Extended publish specifications for additional events
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications for additional events
}

/**
 * Wraps the PermissionService component with React.memo to prevent unnecessary re-renders.
 * This optimization enhances performance, especially when the component receives stable props.
 */
export default React.memo(PermissionService)
