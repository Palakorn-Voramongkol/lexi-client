// src/components/RoleService.js

import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../../components/BaseComponent/mergeSpec' // Ensure these utilities are correctly implemented
import { useMediator } from '../../contexts/MediatorContext' // Ensure this context is correctly set up
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query' // Correct import
import axios from 'axios'

/**
 * Create an Axios instance with the base URL.
 * Replace 'https://api.yourdomain.com' with your actual API base URL.
 */
const api = axios.create({
    baseURL: 'https://api.yourdomain.com', // Replace with your actual API base URL
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * Utility function to include authentication headers.
 * Modify this function based on how you handle authentication tokens.
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * RoleService Component
 *
 * Handles all role-related operations, including fetching, creating,
 * updating, and deleting roles. The component integrates with a mediator for
 * event-driven communication and uses React Query for data fetching and caching.
 */
const RoleService = ({ name, code, description, extendedSubscriptionSpec = {}, extendedPublishSpec = {} }) => {
    const mediator = useMediator() // Access mediator via Context
    const queryClient = useQueryClient() // Access React Query's QueryClient

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
                            id: 'integer', // ID of the role to be updated
                            code: 'string', // (Optional) New code
                            name: 'string', // (Optional) New name
                            description: 'string', // (Optional) New description
                        },
                    },
                    {
                        name: 'deleteRoleRequested', // Event name indicating a role deletion request
                        description: 'Handles requests to delete an existing role.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            id: 'integer', // ID of the role to be deleted
                        },
                    },
                    {
                        name: 'addUserToRoleRequested', // Event name indicating adding a user to a role
                        description: 'Handles requests to add a user to a specific role.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)',
                            roleId: 'integer',
                            userId: 'integer',
                        },
                    },
                    {
                        name: 'removeUserFromRoleRequested', // Event name indicating removing a user from a role
                        description: 'Handles requests to remove a user from a specific role.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)',
                            roleId: 'integer',
                            userId: 'integer',
                        },
                    },
                    {
                        name: 'addPermissionToRoleRequested', // Event name indicating adding a permission to a role
                        description: 'Handles requests to add a permission to a specific role.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)',
                            roleId: 'integer',
                            permissionId: 'integer',
                        },
                    },
                    {
                        name: 'removePermissionFromRoleRequested', // Event name indicating removing a permission from a role
                        description: 'Handles requests to remove a permission from a specific role.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)',
                            roleId: 'integer',
                            permissionId: 'integer',
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
                    id: 'integer', // ID of the newly created role
                    code: 'string', // Code of the role
                    name: 'string', // Name of the role
                    description: 'string', // Description of the role
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    id: 1,
                    code: 'admin',
                    name: 'Administrator',
                    description: 'Admin role with all permissions.',
                    timestamp: '2024-05-02T13:00:00Z',
                },
            },
            {
                channel: 'role',
                event: 'createRoleFailed',
                description: "Emits an event signaling that a role's creation attempt has failed.",
                condition: 'Role creation API call fails.',
                dataFormat: {
                    code: 'string',
                    name: 'string',
                    description: 'string',
                    timestamp: 'string (ISO 8601 format)',
                    reason: 'string',
                },
                exampleData: {
                    code: 'admin',
                    name: 'Administrator',
                    description: 'Admin role with all permissions.',
                    timestamp: '2024-05-02T13:05:00Z',
                    reason: 'Role code already exists.',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'updateRoleSucceeded', // Event name indicating successful role update
                description: 'Emits an event signaling that a role has been successfully updated.',
                condition: 'Role update API call succeeds.',
                dataFormat: {
                    id: 'integer', // ID of the updated role
                    code: 'string', // Updated code
                    name: 'string', // Updated name
                    description: 'string', // Updated description
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    id: 1,
                    code: 'admin',
                    name: 'Administrator Updated',
                    description: 'Updated description.',
                    timestamp: '2024-05-02T12:10:00Z',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'updateRoleFailed', // Event name indicating failed role update
                description: "Emits an event signaling that a role's update attempt has failed.",
                condition: 'Role update API call fails.',
                dataFormat: {
                    id: 'integer', // ID of the role attempted to update
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    id: 1,
                    timestamp: '2024-05-02T12:15:00Z',
                    reason: 'Role not found.',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'deleteRoleSucceeded', // Event name indicating successful role deletion
                description: 'Emits an event signaling that a role has been successfully deleted.',
                condition: 'Role deletion API call succeeds.',
                dataFormat: {
                    id: 'integer', // ID of the deleted role
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    id: 1,
                    timestamp: '2024-05-02T12:20:00Z',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'deleteRoleFailed', // Event name indicating failed role deletion
                description: "Emits an event signaling that a role's deletion attempt has failed.",
                condition: 'Role deletion API call fails.',
                dataFormat: {
                    id: 'integer', // ID of the role attempted to delete
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    id: 1,
                    timestamp: '2024-05-02T12:25:00Z',
                    reason: 'Role not found.',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'addUserToRoleSucceeded', // Event name indicating successful user addition to role
                description: 'Emits an event signaling that a user has been successfully added to a role.',
                condition: 'Add user to role API call succeeds.',
                dataFormat: {
                    roleId: 'integer',
                    userId: 'integer',
                    timestamp: 'string (ISO 8601 format)',
                },
                exampleData: {
                    roleId: 1,
                    userId: 101,
                    timestamp: '2024-05-02T12:30:00Z',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'addUserToRoleFailed', // Event name indicating failed user addition to role
                description: 'Emits an event signaling that adding a user to a role has failed.',
                condition: 'Add user to role API call fails.',
                dataFormat: {
                    roleId: 'integer',
                    userId: 'integer',
                    timestamp: 'string (ISO 8601 format)',
                    reason: 'string',
                },
                exampleData: {
                    roleId: 1,
                    userId: 101,
                    timestamp: '2024-05-02T12:35:00Z',
                    reason: 'User already assigned to the role.',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'removeUserFromRoleSucceeded', // Event name indicating successful user removal from role
                description: 'Emits an event signaling that a user has been successfully removed from a role.',
                condition: 'Remove user from role API call succeeds.',
                dataFormat: {
                    roleId: 'integer',
                    userId: 'integer',
                    timestamp: 'string (ISO 8601 format)',
                },
                exampleData: {
                    roleId: 1,
                    userId: 101,
                    timestamp: '2024-05-02T12:40:00Z',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'removeUserFromRoleFailed', // Event name indicating failed user removal from role
                description: 'Emits an event signaling that removing a user from a role has failed.',
                condition: 'Remove user from role API call fails.',
                dataFormat: {
                    roleId: 'integer',
                    userId: 'integer',
                    timestamp: 'string (ISO 8601 format)',
                    reason: 'string',
                },
                exampleData: {
                    roleId: 1,
                    userId: 101,
                    timestamp: '2024-05-02T12:45:00Z',
                    reason: 'User not assigned to the role.',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'addPermissionToRoleSucceeded', // Event name indicating successful permission addition to role
                description: 'Emits an event signaling that a permission has been successfully added to a role.',
                condition: 'Add permission to role API call succeeds.',
                dataFormat: {
                    roleId: 'integer',
                    permissionId: 'integer',
                    timestamp: 'string (ISO 8601 format)',
                },
                exampleData: {
                    roleId: 1,
                    permissionId: 3,
                    timestamp: '2024-05-02T12:50:00Z',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'addPermissionToRoleFailed', // Event name indicating failed permission addition to role
                description: 'Emits an event signaling that adding a permission to a role has failed.',
                condition: 'Add permission to role API call fails.',
                dataFormat: {
                    roleId: 'integer',
                    permissionId: 'integer',
                    timestamp: 'string (ISO 8601 format)',
                    reason: 'string',
                },
                exampleData: {
                    roleId: 1,
                    permissionId: 3,
                    timestamp: '2024-05-02T12:55:00Z',
                    reason: 'Permission already assigned to the role.',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'removePermissionFromRoleSucceeded', // Event name indicating successful permission removal from role
                description: 'Emits an event signaling that a permission has been successfully removed from a role.',
                condition: 'Remove permission from role API call succeeds.',
                dataFormat: {
                    roleId: 'integer',
                    permissionId: 'integer',
                    timestamp: 'string (ISO 8601 format)',
                },
                exampleData: {
                    roleId: 1,
                    permissionId: 3,
                    timestamp: '2024-05-02T13:00:00Z',
                },
            },
            {
                channel: 'role', // Channel name for role-related publications
                event: 'removePermissionFromRoleFailed', // Event name indicating failed permission removal from role
                description: 'Emits an event signaling that removing a permission from a role has failed.',
                condition: 'Remove permission from role API call fails.',
                dataFormat: {
                    roleId: 'integer',
                    permissionId: 'integer',
                    timestamp: 'string (ISO 8601 format)',
                    reason: 'string',
                },
                exampleData: {
                    roleId: 1,
                    permissionId: 3,
                    timestamp: '2024-05-02T13:05:00Z',
                    reason: 'Permission not assigned to the role.',
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
     * Handler for 'role:createRoleRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleCreateRoleRequested = async (data) => {
        console.log(`RoleService: Received 'role:createRoleRequested' event with data:`, data.data)

        const { code, name, description, timestamp } = data.data

        try {
            const roleData = await createRoleMutation.mutateAsync({ code, name, description })

            // On successful creation, publish 'createRoleSucceeded'
            mediator.publish({
                name,
                code,
                channel: 'role',
                event: 'createRoleSucceeded',
                data: {
                    id: roleData.id,
                    code: roleData.code,
                    name: roleData.name,
                    description: roleData.description,
                    timestamp: new Date().toISOString(),
                },
                timestamp: Date.now(),
            })

            // Optionally, invalidate queries related to roles
            queryClient.invalidateQueries(['roles'])
        } catch (error) {
            // On failure, publish 'createRoleFailed'
            mediator.publish({
                name,
                code,
                channel: 'role',
                event: 'createRoleFailed',
                data: {
                    code,
                    name,
                    description,
                    timestamp: new Date().toISOString(),
                    reason: error.response?.data?.message || error.message,
                },
                timestamp: Date.now(),
            })
        }
    }

    /**
     * Handler for 'role:updateRoleRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleUpdateRoleRequested = async (data) => {
        console.log(`RoleService: Received 'role:updateRoleRequested' event with data:`, data.data)

        const { id, code, name, description, timestamp } = data.data

        try {
            const updatedRoleData = await updateRoleMutation.mutateAsync({ id, code, name, description })

            // On successful update, publish 'updateRoleSucceeded'
            mediator.publish({
                name,
                code,
                channel: 'role',
                event: 'updateRoleSucceeded',
                data: {
                    id: updatedRoleData.id,
                    code: updatedRoleData.code,
                    name: updatedRoleData.name,
                    description: updatedRoleData.description,
                    timestamp: new Date().toISOString(),
                },
                timestamp: Date.now(),
            })

            // Optionally, invalidate queries related to this role
            queryClient.invalidateQueries(['roles', id])
        } catch (error) {
            // On failure, publish 'updateRoleFailed'
            mediator.publish({
                name,
                code,
                channel: 'role',
                event: 'updateRoleFailed',
                data: {
                    id,
                    timestamp: new Date().toISOString(),
                    reason: error.response?.data?.message || error.message,
                },
                timestamp: Date.now(),
            })
        }
    }

    /**
     * Handler for 'role:deleteRoleRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleDeleteRoleRequested = async (data) => {
        console.log(`RoleService: Received 'role:deleteRoleRequested' event with data:`, data.data)

        const { id, timestamp } = data.data

        try {
            await deleteRoleMutation.mutateAsync(id)

            // On successful deletion, publish 'deleteRoleSucceeded'
            mediator.publish({
                name,
                code,
                channel: 'role',
                event: 'deleteRoleSucceeded',
                data: {
                    id,
                    timestamp: new Date().toISOString(),
                },
                timestamp: Date.now(),
            })

            // Optionally, invalidate queries related to roles
            queryClient.invalidateQueries(['roles'])
        } catch (error) {
            // On failure, publish 'deleteRoleFailed'
            mediator.publish({
                name,
                code,
                channel: 'role',
                event: 'deleteRoleFailed',
                data: {
                    id,
                    timestamp: new Date().toISOString(),
                    reason: error.response?.data?.message || error.message,
                },
                timestamp: Date.now(),
            })
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
            await addUserToRoleMutation.mutateAsync({ roleId, userId })

            // On successful addition, publish 'addUserToRoleSucceeded'
            mediator.publish({
                name,
                code,
                channel: 'role',
                event: 'addUserToRoleSucceeded',
                data: {
                    roleId,
                    userId,
                    timestamp: new Date().toISOString(),
                },
                timestamp: Date.now(),
            })

            // Optionally, invalidate queries related to the role
            queryClient.invalidateQueries(['roles', roleId])
        } catch (error) {
            // On failure, publish 'addUserToRoleFailed'
            mediator.publish({
                name,
                code,
                channel: 'role',
                event: 'addUserToRoleFailed',
                data: {
                    roleId,
                    userId,
                    timestamp: new Date().toISOString(),
                    reason: error.response?.data?.message || error.message,
                },
                timestamp: Date.now(),
            })
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
            await removeUserFromRoleMutation.mutateAsync({ roleId, userId })

            // On successful removal, publish 'removeUserFromRoleSucceeded'
            mediator.publish({
                name,
                code,
                channel: 'role',
                event: 'removeUserFromRoleSucceeded',
                data: {
                    roleId,
                    userId,
                    timestamp: new Date().toISOString(),
                },
                timestamp: Date.now(),
            })

            // Optionally, invalidate queries related to the role
            queryClient.invalidateQueries(['roles', roleId])
        } catch (error) {
            // On failure, publish 'removeUserFromRoleFailed'
            mediator.publish({
                name,
                code,
                channel: 'role',
                event: 'removeUserFromRoleFailed',
                data: {
                    roleId,
                    userId,
                    timestamp: new Date().toISOString(),
                    reason: error.response?.data?.message || error.message,
                },
                timestamp: Date.now(),
            })
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
            await addPermissionToRoleMutation.mutateAsync({ roleId, permissionId })

            // On successful addition, publish 'addPermissionToRoleSucceeded'
            mediator.publish({
                name,
                code,
                channel: 'role',
                event: 'addPermissionToRoleSucceeded',
                data: {
                    roleId,
                    permissionId,
                    timestamp: new Date().toISOString(),
                },
                timestamp: Date.now(),
            })

            // Optionally, invalidate queries related to the role
            queryClient.invalidateQueries(['roles', roleId])
        } catch (error) {
            // On failure, publish 'addPermissionToRoleFailed'
            mediator.publish({
                name,
                code,
                channel: 'role',
                event: 'addPermissionToRoleFailed',
                data: {
                    roleId,
                    permissionId,
                    timestamp: new Date().toISOString(),
                    reason: error.response?.data?.message || error.message,
                },
                timestamp: Date.now(),
            })
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
            await removePermissionFromRoleMutation.mutateAsync({ roleId, permissionId })

            // On successful removal, publish 'removePermissionFromRoleSucceeded'
            mediator.publish({
                name,
                code,
                channel: 'role',
                event: 'removePermissionFromRoleSucceeded',
                data: {
                    roleId,
                    permissionId,
                    timestamp: new Date().toISOString(),
                },
                timestamp: Date.now(),
            })

            // Optionally, invalidate queries related to the role
            queryClient.invalidateQueries(['roles', roleId])
        } catch (error) {
            // On failure, publish 'removePermissionFromRoleFailed'
            mediator.publish({
                name,
                code,
                channel: 'role',
                event: 'removePermissionFromRoleFailed',
                data: {
                    roleId,
                    permissionId,
                    timestamp: new Date().toISOString(),
                    reason: error.response?.data?.message || error.message,
                },
                timestamp: Date.now(),
            })
        }
    }

    /**
     * Define React Query hooks for API interactions.
     */

    /**
     * Fetch all roles.
     */
    const fetchRoles = async () => {
        const response = await api.get('/api/Role', {
            headers: getAuthHeaders(),
        })

        return response.data
    }

    /**
     * Fetch a specific role by ID.
     */
    const fetchRoleById = async (id) => {
        const response = await api.get(`/api/Role/${id}`, {
            headers: getAuthHeaders(),
        })

        return response.data
    }

    /**
     * Create a new role.
     */
    const createRole = async ({ code, name, description }) => {
        const response = await api.post(
            '/api/Role',
            { code, name, description },
            {
                headers: getAuthHeaders(),
            }
        )

        return response.data
    }

    /**
     * Update an existing role.
     */
    const updateRole = async ({ id, code, name, description }) => {
        const payload = {}
        if (code) payload.code = code
        if (name) payload.name = name
        if (description) payload.description = description

        const response = await api.put(`/api/Role/${id}`, payload, {
            headers: getAuthHeaders(),
        })

        if (response.status === 200 || response.status === 204) {
            // Assuming the API returns the updated role data
            if (response.status === 200) {
                return response.data
            } else {
                // No Content, return minimal data
                return { id, timestamp: new Date().toISOString() }
            }
        }

        throw new Error('Unexpected response status')
    }

    /**
     * Delete a role by ID.
     */
    const deleteRole = async (id) => {
        const response = await api.delete(`/api/Role/${id}`, {
            headers: getAuthHeaders(),
        })

        return response.status
    }

    /**
     * Add a user to a role.
     */
    const addUserToRole = async ({ roleId, userId }) => {
        const response = await api.post(
            '/api/Role/AddUserToRole', // Ensure this endpoint exists
            { roleId, userId },
            {
                headers: getAuthHeaders(),
            }
        )

        return response.status
    }

    /**
     * Remove a user from a role.
     */
    const removeUserFromRole = async ({ roleId, userId }) => {
        const response = await api.delete('/api/Role/RemoveUserFromRole', {
            headers: getAuthHeaders(),
            data: { roleId, userId },
        })

        return response.status
    }

    /**
     * Add a permission to a role.
     */
    const addPermissionToRole = async ({ roleId, permissionId }) => {
        const response = await api.post(
            '/api/Role/AddPermissionToRole', // Ensure this endpoint exists
            { roleId, permissionId },
            {
                headers: getAuthHeaders(),
            }
        )

        return response.status
    }

    /**
     * Remove a permission from a role.
     */
    const removePermissionFromRole = async ({ roleId, permissionId }) => {
        const response = await api.delete('/api/Role/RemovePermissionFromRole', {
            headers: getAuthHeaders(),
            data: { roleId, permissionId },
        })

        return response.status
    }

    /**
     * Initialize React Query hooks.
     */

    /**
     * useQuery for fetching all roles.
     */
    const useFetchRoles = () => {
        return useQuery(['roles'], fetchRoles, {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 30 * 60 * 1000, // 30 minutes
            retry: 2,
        })
    }

    /**
     * useQuery for fetching a role by ID.
     */
    const useFetchRoleById = (id) => {
        return useQuery(['roles', id], () => fetchRoleById(id), {
            enabled: !!id, // Only run this query if an ID is provided
            staleTime: 5 * 60 * 1000,
            cacheTime: 30 * 60 * 1000,
            retry: 2,
        })
    }

    /**
     * useMutation for creating a role.
     */
    const useCreateRole = () => {
        return useMutation(createRole, {
            onSuccess: () => {
                // Invalidate and refetch roles
                queryClient.invalidateQueries(['roles'])
            },
        })
    }

    /**
     * useMutation for updating a role.
     */
    const useUpdateRole = () => {
        return useMutation(updateRole, {
            onSuccess: (_, variables) => {
                // Invalidate and refetch the specific role
                queryClient.invalidateQueries(['roles', variables.id])
            },
        })
    }

    /**
     * useMutation for deleting a role.
     */
    const useDeleteRole = () => {
        return useMutation(deleteRole, {
            onSuccess: () => {
                // Invalidate and refetch roles
                queryClient.invalidateQueries(['roles'])
            },
        })
    }

    /**
     * useMutation for adding a user to a role.
     */
    const useAddUserToRole = () => {
        return useMutation(addUserToRole, {
            onSuccess: (_, variables) => {
                // Invalidate and refetch the specific role
                queryClient.invalidateQueries(['roles', variables.roleId])
            },
        })
    }

    /**
     * useMutation for removing a user from a role.
     */
    const useRemoveUserFromRole = () => {
        return useMutation(removeUserFromRole, {
            onSuccess: (_, variables) => {
                // Invalidate and refetch the specific role
                queryClient.invalidateQueries(['roles', variables.roleId])
            },
        })
    }

    /**
     * useMutation for adding a permission to a role.
     */
    const useAddPermissionToRole = () => {
        return useMutation(addPermissionToRole, {
            onSuccess: (_, variables) => {
                // Invalidate and refetch the specific role
                queryClient.invalidateQueries(['roles', variables.roleId])
            },
        })
    }

    /**
     * useMutation for removing a permission from a role.
     */
    const useRemovePermissionFromRole = () => {
        return useMutation(removePermissionFromRole, {
            onSuccess: (_, variables) => {
                // Invalidate and refetch the specific role
                queryClient.invalidateQueries(['roles', variables.roleId])
            },
        })
    }

    /**
     * Initialize all mutations.
     */
    const createRoleMutation = useCreateRole()
    const updateRoleMutation = useUpdateRole()
    const deleteRoleMutation = useDeleteRole()
    const addUserToRoleMutation = useAddUserToRole()
    const removeUserFromRoleMutation = useRemoveUserFromRole()
    const addPermissionToRoleMutation = useAddPermissionToRole()
    const removePermissionFromRoleMutation = useRemovePermissionFromRole()

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
