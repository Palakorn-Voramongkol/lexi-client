// src/components/RoleService.js

import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../../components/BaseComponent/mergeSpec' // Utility functions for merging specs
import { useMediator } from '../../contexts/MediatorContext' // Hook to access mediator via Context
import apiClient from '../apiClient'

const RoleService = ({ name, code, description, extendedSubscriptionSpec = {}, extendedPublishSpec = {} }) => {
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
                        description: 'Handles the application start event to initialize role management.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                        },
                    },
                    {
                        name: 'stop', // Event name indicating the stop of the application
                        description: 'Handles the application stop event to perform cleanup in role management.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                        },
                    },
                ],
            },
            {
                channel: 'role', // Channel name for role-related events
                events: [
                    {
                        name: 'createRoleRequested', // Event name indicating a role creation request
                        description: 'Handles requests to create a new role.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            code: 'string', // Code of the role to be created
                            name: 'string', // Name of the role to be created
                            description: 'string', // Description of the role
                        },
                    },
                    {
                        name: 'updateRoleRequested', // Event name indicating a role update request
                        description: 'Handles requests to update an existing role.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            roleId: 'integer', // ID of the role to be updated
                            code: 'string', // (Optional) New code for the role
                            name: 'string', // (Optional) New name for the role
                            description: 'string', // (Optional) New description for the role
                        },
                    },
                    {
                        name: 'deleteRoleRequested', // Event name indicating a role deletion request
                        description: 'Handles requests to delete an existing role.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            roleId: 'integer', // ID of the role to be deleted
                        },
                    },
                    {
                        name: 'addUserToRoleRequested', // Event name indicating adding a user to a role
                        description: 'Handles requests to add a user to an existing role.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            roleId: 'integer', // ID of the role
                            userId: 'integer', // ID of the user to add
                        },
                    },
                    {
                        name: 'removeUserFromRoleRequested', // Event name indicating removing a user from a role
                        description: 'Handles requests to remove a user from an existing role.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            roleId: 'integer', // ID of the role
                            userId: 'integer', // ID of the user to remove
                        },
                    },
                    {
                        name: 'addPermissionToRoleRequested', // Event name indicating adding a permission to a role
                        description: 'Handles requests to add a permission to an existing role.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            roleId: 'integer', // ID of the role
                            permissionId: 'integer', // ID of the permission to add
                        },
                    },
                    {
                        name: 'removePermissionFromRoleRequested', // Event name indicating removing a permission from a role
                        description: 'Handles requests to remove a permission from an existing role.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            roleId: 'integer', // ID of the role
                            permissionId: 'integer', // ID of the permission to remove
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
                channel: 'role', // Channel name for role-related publications
                event: 'createRoleSucceeded', // Event name indicating successful role creation
                description: 'Emits an event signaling that a role has been successfully created.',
                condition: 'Role creation API call succeeds.',
                dataFormat: {
                    roleId: 'integer', // ID of the newly created role
                    code: 'string', // Code of the role
                    name: 'string', // Name of the role
                    description: 'string', // Description of the role
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    roleId: 101,
                    code: 'ADMIN',
                    name: 'Administrator',
                    description: 'Has full access to all resources.',
                    timestamp: '2024-05-01T18:00:00Z',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'createRoleFailed', // Event name indicating failed role creation
                description: "Emits an event signaling that a role's creation attempt has failed.",
                condition: 'Role creation API call fails.',
                dataFormat: {
                    code: 'string', // Code of the role attempted to be created
                    name: 'string', // Name of the role attempted to be created
                    description: 'string', // Description attempted
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    code: 'ADMIN',
                    name: 'Administrator',
                    description: 'Has full access to all resources.',
                    timestamp: '2024-05-01T18:05:00Z',
                    reason: 'Role code already exists.',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'updateRoleSucceeded', // Event name indicating successful role update
                description: 'Emits an event signaling that a role has been successfully updated.',
                condition: 'Role update API call succeeds.',
                dataFormat: {
                    roleId: 'integer', // ID of the updated role
                    code: 'string', // Updated code
                    name: 'string', // Updated name
                    description: 'string', // Updated description
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    roleId: 101,
                    code: 'SUPER_ADMIN',
                    name: 'Super Administrator',
                    description: 'Has elevated access to all resources.',
                    timestamp: '2024-05-01T18:10:00Z',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'updateRoleFailed', // Event name indicating failed role update
                description: "Emits an event signaling that a role's update attempt has failed.",
                condition: 'Role update API call fails.',
                dataFormat: {
                    roleId: 'integer', // ID of the role attempted to be updated
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    roleId: 101,
                    timestamp: '2024-05-01T18:15:00Z',
                    reason: 'Role not found.',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'deleteRoleSucceeded', // Event name indicating successful role deletion
                description: 'Emits an event signaling that a role has been successfully deleted.',
                condition: 'Role deletion API call succeeds.',
                dataFormat: {
                    roleId: 'integer', // ID of the deleted role
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    roleId: 101,
                    timestamp: '2024-05-01T18:20:00Z',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'deleteRoleFailed', // Event name indicating failed role deletion
                description: "Emits an event signaling that a role's deletion attempt has failed.",
                condition: 'Role deletion API call fails.',
                dataFormat: {
                    roleId: 'integer', // ID of the role attempted to be deleted
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    roleId: 101,
                    timestamp: '2024-05-01T18:25:00Z',
                    reason: 'Role is assigned to active users.',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'addUserToRoleSucceeded', // Event name indicating successful addition of a user to a role
                description: 'Emits an event signaling that a user has been successfully added to a role.',
                condition: 'Add user to role API call succeeds.',
                dataFormat: {
                    roleId: 'integer', // ID of the role
                    userId: 'integer', // ID of the user added
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    roleId: 101,
                    userId: 202,
                    timestamp: '2024-05-01T18:30:00Z',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'addUserToRoleFailed', // Event name indicating failed addition of a user to a role
                description: 'Emits an event signaling that adding a user to a role has failed.',
                condition: 'Add user to role API call fails.',
                dataFormat: {
                    roleId: 'integer', // ID of the role
                    userId: 'integer', // ID of the user attempted to add
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    roleId: 101,
                    userId: 202,
                    timestamp: '2024-05-01T18:35:00Z',
                    reason: 'User already belongs to the role.',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'removeUserFromRoleSucceeded', // Event name indicating successful removal of a user from a role
                description: 'Emits an event signaling that a user has been successfully removed from a role.',
                condition: 'Remove user from role API call succeeds.',
                dataFormat: {
                    roleId: 'integer', // ID of the role
                    userId: 'integer', // ID of the user removed
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    roleId: 101,
                    userId: 202,
                    timestamp: '2024-05-01T18:40:00Z',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'removeUserFromRoleFailed', // Event name indicating failed removal of a user from a role
                description: 'Emits an event signaling that removing a user from a role has failed.',
                condition: 'Remove user from role API call fails.',
                dataFormat: {
                    roleId: 'integer', // ID of the role
                    userId: 'integer', // ID of the user attempted to remove
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    roleId: 101,
                    userId: 202,
                    timestamp: '2024-05-01T18:45:00Z',
                    reason: 'User does not belong to the role.',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'addPermissionToRoleSucceeded', // Event name indicating successful addition of a permission to a role
                description: 'Emits an event signaling that a permission has been successfully added to a role.',
                condition: 'Add permission to role API call succeeds.',
                dataFormat: {
                    roleId: 'integer', // ID of the role
                    permissionId: 'integer', // ID of the permission added
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    roleId: 101,
                    permissionId: 303,
                    timestamp: '2024-05-01T18:50:00Z',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'addPermissionToRoleFailed', // Event name indicating failed addition of a permission to a role
                description: 'Emits an event signaling that adding a permission to a role has failed.',
                condition: 'Add permission to role API call fails.',
                dataFormat: {
                    roleId: 'integer', // ID of the role
                    permissionId: 'integer', // ID of the permission attempted to add
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    roleId: 101,
                    permissionId: 303,
                    timestamp: '2024-05-01T18:55:00Z',
                    reason: 'Permission already exists in the role.',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'removePermissionFromRoleSucceeded', // Event name indicating successful removal of a permission from a role
                description: 'Emits an event signaling that a permission has been successfully removed from a role.',
                condition: 'Remove permission from role API call succeeds.',
                dataFormat: {
                    roleId: 'integer', // ID of the role
                    permissionId: 'integer', // ID of the permission removed
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    roleId: 101,
                    permissionId: 303,
                    timestamp: '2024-05-01T19:00:00Z',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'removePermissionFromRoleFailed', // Event name indicating failed removal of a permission from a role
                description: 'Emits an event signaling that removing a permission from a role has failed.',
                condition: 'Remove permission from role API call fails.',
                dataFormat: {
                    roleId: 'integer', // ID of the role
                    permissionId: 'integer', // ID of the permission attempted to remove
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    roleId: 101,
                    permissionId: 303,
                    timestamp: '2024-05-01T19:05:00Z',
                    reason: 'Permission does not exist in the role.',
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
        console.log(`RoleService (${data.componentName}) received 'system:start' event with data:`, data.data)
        // Implement additional logic for handling the start event if needed
    }

    /**
     * Handler for 'system:stop' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`RoleService (${data.componentName}) received 'system:stop' event with data:`, data.data)
        // Implement additional logic for handling the stop event if needed
    }

    /**
     * Handler for 'ui:windowSizeChange' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleWindowSizeChange(data) {
        console.log(`RoleService (${data.componentName}) received 'ui:windowSizeChange' event with data:`, data.data)
        // Implement additional logic for handling window size changes if needed
    }

    /**
     * Creates a new role by interacting with the backend API.
     *
     * @param {string} code - The code of the role.
     * @param {string} name - The name of the role.
     * @param {string} description - The description of the role.
     * @returns {Promise<Object>} - Resolves with role data on success.
     * @throws {Error} - Throws an error if role creation fails.
     */
    const createRole = async (code, name, description) => {
        try {
            const response = await apiClient.post('/Role', {
                code,
                name,
                description,
            })

            // Handle both 200 and 201 responses
            if (response.status === 200 || response.status === 201) {
                const {
                    id: roleId,
                    code: returnedCode,
                    name: returnedName,
                    description: returnedDescription,
                } = response.data

                return {
                    roleId,
                    code: returnedCode,
                    name: returnedName,
                    description: returnedDescription,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Role creation failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Updates an existing role by interacting with the backend API.
     *
     * @param {number} roleId - The ID of the role to update.
     * @param {string} [code] - The new code of the role.
     * @param {string} [name] - The new name of the role.
     * @param {string} [description] - The new description of the role.
     * @returns {Promise<Object>} - Resolves with updated role data on success.
     * @throws {Error} - Throws an error if role update fails.
     */
    const updateRole = async (roleId, code, name, description) => {
        try {
            const payload = {}
            if (code) payload.code = code
            if (name) payload.name = name
            if (description) payload.description = description

            const response = await apiClient.put(`/Role/${roleId}`, payload)

            if (response.status === 200 || response.status === 204) {
                if (response.status === 200) {
                    const {
                        id: updatedRoleId,
                        code: updatedCode,
                        name: updatedName,
                        description: updatedDescription,
                    } = response.data

                    return {
                        roleId: updatedRoleId,
                        code: updatedCode,
                        name: updatedName,
                        description: updatedDescription,
                        timestamp: new Date().toISOString(),
                    }
                } else {
                    // For 204 No Content, return the roleId and timestamp
                    return {
                        roleId,
                        timestamp: new Date().toISOString(),
                    }
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Role update failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Deletes an existing role by interacting with the backend API.
     *
     * @param {number} roleId - The ID of the role to delete.
     * @returns {Promise<Object>} - Resolves with deletion confirmation on success.
     * @throws {Error} - Throws an error if role deletion fails.
     */
    const deleteRole = async (roleId) => {
        try {
            const response = await apiClient.delete(`/Role/${roleId}`)

            if (response.status === 200 || response.status === 204) {
                return {
                    roleId,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Role deletion failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Adds a user to a role by interacting with the backend API.
     *
     * @param {number} roleId - The ID of the role.
     * @param {number} userId - The ID of the user to add.
     * @returns {Promise<Object>} - Resolves with addition confirmation on success.
     * @throws {Error} - Throws an error if adding user to role fails.
     */
    const addUserToRole = async (roleId, userId) => {
        try {
            const response = await apiClient.post('/Role/AddUser', {
                roleId,
                userId,
            })

            if (response.status === 200) {
                return {
                    roleId,
                    userId,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Adding user to role failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Removes a user from a role by interacting with the backend API.
     *
     * @param {number} roleId - The ID of the role.
     * @param {number} userId - The ID of the user to remove.
     * @returns {Promise<Object>} - Resolves with removal confirmation on success.
     * @throws {Error} - Throws an error if removing user from role fails.
     */
    const removeUserFromRole = async (roleId, userId) => {
        try {
            const response = await apiClient.delete('/Role/RemoveUser', {
                data: {
                    roleId,
                    userId,
                },
            })

            if (response.status === 200) {
                return {
                    roleId,
                    userId,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Removing user from role failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Adds a permission to a role by interacting with the backend API.
     *
     * @param {number} roleId - The ID of the role.
     * @param {number} permissionId - The ID of the permission to add.
     * @returns {Promise<Object>} - Resolves with addition confirmation on success.
     * @throws {Error} - Throws an error if adding permission to role fails.
     */
    const addPermissionToRole = async (roleId, permissionId) => {
        try {
            const response = await apiClient.post('/Role/AddPermission', {
                roleId,
                permissionId,
            })

            if (response.status === 200) {
                return {
                    roleId,
                    permissionId,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Adding permission to role failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Removes a permission from a role by interacting with the backend API.
     *
     * @param {number} roleId - The ID of the role.
     * @param {number} permissionId - The ID of the permission to remove.
     * @returns {Promise<Object>} - Resolves with removal confirmation on success.
     * @throws {Error} - Throws an error if removing permission from role fails.
     */
    const removePermissionFromRole = async (roleId, permissionId) => {
        try {
            const response = await apiClient.delete('/Role/RemovePermission', {
                data: {
                    roleId,
                    permissionId,
                },
            })

            if (response.status === 200) {
                return {
                    roleId,
                    permissionId,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Removing permission from role failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Handler for 'role:createRoleRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleCreateRoleRequested = async (data) => {
        console.log(`RoleService: Received 'role:createRoleRequested' event with data:`, data.data)

        const { code, name, description, timestamp } = data.data

        try {
            const roleData = await createRole(code, name, description)

            // On successful creation, publish 'createRoleSucceeded'
            mediator.publish(
                name,
                code,
                'role',
                'createRoleSucceeded',
                {
                    roleId: roleData.roleId,
                    code: roleData.code,
                    name: roleData.name,
                    description: roleData.description,
                    timestamp: roleData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'createRoleFailed'
            mediator.publish(
                name,
                code,
                'role',
                'createRoleFailed',
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
     * Handler for 'role:updateRoleRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleUpdateRoleRequested = async (data) => {
        console.log(`RoleService: Received 'role:updateRoleRequested' event with data:`, data.data)

        const { roleId, code, name, description, timestamp } = data.data

        try {
            const updatedRoleData = await updateRole(roleId, code, name, description)

            // On successful update, publish 'updateRoleSucceeded'
            mediator.publish(
                name,
                code,
                'role',
                'updateRoleSucceeded',
                {
                    roleId: updatedRoleData.roleId,
                    code: updatedRoleData.code,
                    name: updatedRoleData.name,
                    description: updatedRoleData.description,
                    timestamp: updatedRoleData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'updateRoleFailed'
            mediator.publish(
                name,
                code,
                'role',
                'updateRoleFailed',
                {
                    roleId: roleId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'role:deleteRoleRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleDeleteRoleRequested = async (data) => {
        console.log(`RoleService: Received 'role:deleteRoleRequested' event with data:`, data.data)

        const { roleId, timestamp } = data.data

        try {
            const deleteResponse = await deleteRole(roleId)

            // On successful deletion, publish 'deleteRoleSucceeded'
            mediator.publish(
                name,
                code,
                'role',
                'deleteRoleSucceeded',
                {
                    roleId: deleteResponse.roleId,
                    timestamp: deleteResponse.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'deleteRoleFailed'
            mediator.publish(
                name,
                code,
                'role',
                'deleteRoleFailed',
                {
                    roleId: roleId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'role:addUserToRoleRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleAddUserToRoleRequested = async (data) => {
        console.log(`RoleService: Received 'role:addUserToRoleRequested' event with data:`, data.data)

        const { roleId, userId, timestamp } = data.data

        try {
            const addUserData = await addUserToRole(roleId, userId)

            // On successful addition, publish 'addUserToRoleSucceeded'
            mediator.publish(
                name,
                code,
                'role',
                'addUserToRoleSucceeded',
                {
                    roleId: addUserData.roleId,
                    userId: addUserData.userId,
                    timestamp: addUserData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'addUserToRoleFailed'
            mediator.publish(
                name,
                code,
                'role',
                'addUserToRoleFailed',
                {
                    roleId: roleId,
                    userId: userId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'role:removeUserFromRoleRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleRemoveUserFromRoleRequested = async (data) => {
        console.log(`RoleService: Received 'role:removeUserFromRoleRequested' event with data:`, data.data)

        const { roleId, userId, timestamp } = data.data

        try {
            const removeUserData = await removeUserFromRole(roleId, userId)

            // On successful removal, publish 'removeUserFromRoleSucceeded'
            mediator.publish(
                name,
                code,
                'role',
                'removeUserFromRoleSucceeded',
                {
                    roleId: removeUserData.roleId,
                    userId: removeUserData.userId,
                    timestamp: removeUserData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'removeUserFromRoleFailed'
            mediator.publish(
                name,
                code,
                'role',
                'removeUserFromRoleFailed',
                {
                    roleId: roleId,
                    userId: userId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'role:addPermissionToRoleRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleAddPermissionToRoleRequested = async (data) => {
        console.log(`RoleService: Received 'role:addPermissionToRoleRequested' event with data:`, data.data)

        const { roleId, permissionId, timestamp } = data.data

        try {
            const addPermissionData = await addPermissionToRole(roleId, permissionId)

            // On successful addition, publish 'addPermissionToRoleSucceeded'
            mediator.publish(
                name,
                code,
                'role',
                'addPermissionToRoleSucceeded',
                {
                    roleId: addPermissionData.roleId,
                    permissionId: addPermissionData.permissionId,
                    timestamp: addPermissionData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'addPermissionToRoleFailed'
            mediator.publish(
                name,
                code,
                'role',
                'addPermissionToRoleFailed',
                {
                    roleId: roleId,
                    permissionId: permissionId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'role:removePermissionFromRoleRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleRemovePermissionFromRoleRequested = async (data) => {
        console.log(`RoleService: Received 'role:removePermissionFromRoleRequested' event with data:`, data.data)

        const { roleId, permissionId, timestamp } = data.data

        try {
            const removePermissionData = await removePermissionFromRole(roleId, permissionId)

            // On successful removal, publish 'removePermissionFromRoleSucceeded'
            mediator.publish(
                name,
                code,
                'role',
                'removePermissionFromRoleSucceeded',
                {
                    roleId: removePermissionData.roleId,
                    permissionId: removePermissionData.permissionId,
                    timestamp: removePermissionData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'removePermissionFromRoleFailed'
            mediator.publish(
                name,
                code,
                'role',
                'removePermissionFromRoleFailed',
                {
                    roleId: roleId,
                    permissionId: permissionId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Define custom event handlers specific to RoleService.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const customHandlers = {
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'ui:windowSizeChange': handleWindowSizeChange,
        'role:createRoleRequested': handleCreateRoleRequested,
        'role:updateRoleRequested': handleUpdateRoleRequested,
        'role:deleteRoleRequested': handleDeleteRoleRequested,
        'role:addUserToRoleRequested': handleAddUserToRoleRequested,
        'role:removeUserFromRoleRequested': handleRemoveUserFromRoleRequested,
        'role:addPermissionToRoleRequested': handleAddPermissionToRoleRequested,
        'role:removePermissionFromRoleRequested': handleRemovePermissionFromRoleRequested,
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
                        `Handler for event '${eventName}' on channel '${channel}' is not implemented in RoleService.`
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
            console.log(`RoleService: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2))
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
                console.warn(`No handler implemented for event '${event}' on channel '${channel}' in RoleService.`)
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
                console.log(`RoleService (${name}) initialized.`)
                // Additional initialization logic if needed
            },
            destroy: () => {
                console.log(`RoleService (${name}) destroyed.`)
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
                    console.log(`RoleService (${name}) initialized.`)
                },
                destroy: () => {
                    console.log(`RoleService (${name}) destroyed.`)
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
RoleService.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the RoleService instance
    code: PropTypes.string.isRequired, // The unique code identifier for the RoleService
    description: PropTypes.string.isRequired, // A brief description of the RoleService
    extendedPublishSpec: PropTypes.object, // Extended publish specifications for additional events
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications for additional events
}

/**
 * Wraps the RoleService component with React.memo to prevent unnecessary re-renders.
 * This optimization enhances performance, especially when the component receives stable props.
 */
export default React.memo(RoleService)
