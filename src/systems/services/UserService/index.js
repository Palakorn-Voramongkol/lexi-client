// src/components/UserService.js

import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../../components/BaseComponent/mergeSpec' // Utility functions for merging specs
import { useMediator } from '../../contexts/MediatorContext' // Hook to access mediator via Context
import apiClient from '../apiClient'

const UserService = ({ name, code, description, extendedSubscriptionSpec = {}, extendedPublishSpec = {} }) => {
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
                        description: 'Handles the application start event to initialize user management.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                        },
                    },
                    {
                        name: 'stop', // Event name indicating the stop of the application
                        description: 'Handles the application stop event to perform cleanup in user management.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                        },
                    },
                ],
            },
            {
                channel: 'user', // Channel name for user-related events
                events: [
                    {
                        name: 'createUserRequested', // Event name indicating a user creation request
                        description: 'Handles requests to create a new user.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            username: 'string', // Username of the user to be created
                            email: 'string', // Email of the user to be created
                            password: 'string', // Password of the user to be created
                        },
                    },
                    {
                        name: 'updateUserRequested', // Event name indicating a user update request
                        description: 'Handles requests to update an existing user.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            userId: 'integer', // ID of the user to be updated
                            username: 'string', // (Optional) New username for the user
                            email: 'string', // (Optional) New email for the user
                            password: 'string', // (Optional) New password for the user
                        },
                    },
                    {
                        name: 'deleteUserRequested', // Event name indicating a user deletion request
                        description: 'Handles requests to delete an existing user.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            userId: 'integer', // ID of the user to be deleted
                        },
                    },
                    {
                        name: 'addRoleToUserRequested', // Event name indicating adding a role to a user
                        description: 'Handles requests to add a role to an existing user.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            userId: 'integer', // ID of the user
                            roleId: 'integer', // ID of the role to add
                        },
                    },
                    {
                        name: 'removeRoleFromUserRequested', // Event name indicating removing a role from a user
                        description: 'Handles requests to remove a role from an existing user.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            userId: 'integer', // ID of the user
                            roleId: 'integer', // ID of the role to remove
                        },
                    },
                    {
                        name: 'addPermissionToUserRequested', // Event name indicating adding a permission to a user
                        description: 'Handles requests to add a permission to an existing user.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            userId: 'integer', // ID of the user
                            permissionId: 'integer', // ID of the permission to add
                        },
                    },
                    {
                        name: 'removePermissionFromUserRequested', // Event name indicating removing a permission from a user
                        description: 'Handles requests to remove a permission from an existing user.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                            userId: 'integer', // ID of the user
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
                channel: 'user', // Channel name for user-related publications
                event: 'createUserSucceeded', // Event name indicating successful user creation
                description: 'Emits an event signaling that a user has been successfully created.',
                condition: 'User creation API call succeeds.',
                dataFormat: {
                    userId: 'integer', // ID of the newly created user
                    username: 'string', // Username of the user
                    email: 'string', // Email of the user
                    roles: 'array of role objects', // Roles assigned to the user
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    userId: 301,
                    username: 'johndoe',
                    email: 'johndoe@example.com',
                    roles: [
                        {
                            id: 101,
                            code: 'ADMIN',
                            name: 'Administrator',
                            description: 'Has full access to all resources.',
                        },
                    ],
                    timestamp: '2024-05-01T19:00:00Z',
                },
            },
            {
                channel: 'user', // Channel name for user-related publications
                event: 'createUserFailed', // Event name indicating failed user creation
                description: "Emits an event signaling that a user's creation attempt has failed.",
                condition: 'User creation API call fails.',
                dataFormat: {
                    username: 'string', // Username attempted to be created
                    email: 'string', // Email attempted to be created
                    password: 'string', // Password attempted to be created
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    username: 'johndoe',
                    email: 'johndoe@example.com',
                    password: 'securepassword',
                    timestamp: '2024-05-01T19:05:00Z',
                    reason: 'Email already exists.',
                },
            },
            {
                channel: 'user', // Channel name for user-related publications
                event: 'updateUserSucceeded', // Event name indicating successful user update
                description: 'Emits an event signaling that a user has been successfully updated.',
                condition: 'User update API call succeeds.',
                dataFormat: {
                    userId: 'integer', // ID of the updated user
                    username: 'string', // Updated username
                    email: 'string', // Updated email
                    roles: 'array of role objects', // Updated roles assigned to the user
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    userId: 301,
                    username: 'john_doe_updated',
                    email: 'john.doe.updated@example.com',
                    roles: [
                        {
                            id: 101,
                            code: 'ADMIN',
                            name: 'Administrator',
                            description: 'Has full access to all resources.',
                        },
                    ],
                    timestamp: '2024-05-01T19:10:00Z',
                },
            },
            {
                channel: 'user', // Channel name for user-related publications
                event: 'updateUserFailed', // Event name indicating failed user update
                description: "Emits an event signaling that a user's update attempt has failed.",
                condition: 'User update API call fails.',
                dataFormat: {
                    userId: 'integer', // ID of the user attempted to be updated
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    userId: 301,
                    timestamp: '2024-05-01T19:15:00Z',
                    reason: 'User not found.',
                },
            },
            {
                channel: 'user', // Channel name for user-related publications
                event: 'deleteUserSucceeded', // Event name indicating successful user deletion
                description: 'Emits an event signaling that a user has been successfully deleted.',
                condition: 'User deletion API call succeeds.',
                dataFormat: {
                    userId: 'integer', // ID of the deleted user
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    userId: 301,
                    timestamp: '2024-05-01T19:20:00Z',
                },
            },
            {
                channel: 'user', // Channel name for user-related publications
                event: 'deleteUserFailed', // Event name indicating failed user deletion
                description: "Emits an event signaling that a user's deletion attempt has failed.",
                condition: 'User deletion API call fails.',
                dataFormat: {
                    userId: 'integer', // ID of the user attempted to be deleted
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    userId: 301,
                    timestamp: '2024-05-01T19:25:00Z',
                    reason: 'User is assigned to active roles.',
                },
            },
            {
                channel: 'user', // Channel name for user-related publications
                event: 'addRoleToUserSucceeded', // Event name indicating successful addition of a role to a user
                description: 'Emits an event signaling that a role has been successfully added to a user.',
                condition: 'Add role to user API call succeeds.',
                dataFormat: {
                    userId: 'integer', // ID of the user
                    roleId: 'integer', // ID of the role added
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    userId: 301,
                    roleId: 101,
                    timestamp: '2024-05-01T19:30:00Z',
                },
            },
            {
                channel: 'user', // Channel name for user-related publications
                event: 'addRoleToUserFailed', // Event name indicating failed addition of a role to a user
                description: 'Emits an event signaling that adding a role to a user has failed.',
                condition: 'Add role to user API call fails.',
                dataFormat: {
                    userId: 'integer', // ID of the user
                    roleId: 'integer', // ID of the role attempted to add
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    userId: 301,
                    roleId: 101,
                    timestamp: '2024-05-01T19:35:00Z',
                    reason: 'Role already assigned to the user.',
                },
            },
            {
                channel: 'user', // Channel name for user-related publications
                event: 'removeRoleFromUserSucceeded', // Event name indicating successful removal of a role from a user
                description: 'Emits an event signaling that a role has been successfully removed from a user.',
                condition: 'Remove role from user API call succeeds.',
                dataFormat: {
                    userId: 'integer', // ID of the user
                    roleId: 'integer', // ID of the role removed
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    userId: 301,
                    roleId: 101,
                    timestamp: '2024-05-01T19:40:00Z',
                },
            },
            {
                channel: 'user', // Channel name for user-related publications
                event: 'removeRoleFromUserFailed', // Event name indicating failed removal of a role from a user
                description: 'Emits an event signaling that removing a role from a user has failed.',
                condition: 'Remove role from user API call fails.',
                dataFormat: {
                    userId: 'integer', // ID of the user
                    roleId: 'integer', // ID of the role attempted to remove
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    userId: 301,
                    roleId: 101,
                    timestamp: '2024-05-01T19:45:00Z',
                    reason: 'Role is not assigned to the user.',
                },
            },
            {
                channel: 'user', // Channel name for user-related publications
                event: 'addPermissionToUserSucceeded', // Event name indicating successful addition of a permission to a user
                description: 'Emits an event signaling that a permission has been successfully added to a user.',
                condition: 'Add permission to user API call succeeds.',
                dataFormat: {
                    userId: 'integer', // ID of the user
                    permissionId: 'integer', // ID of the permission added
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    userId: 301,
                    permissionId: 404,
                    timestamp: '2024-05-01T19:50:00Z',
                },
            },
            {
                channel: 'user', // Channel name for user-related publications
                event: 'addPermissionToUserFailed', // Event name indicating failed addition of a permission to a user
                description: 'Emits an event signaling that adding a permission to a user has failed.',
                condition: 'Add permission to user API call fails.',
                dataFormat: {
                    userId: 'integer', // ID of the user
                    permissionId: 'integer', // ID of the permission attempted to add
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    userId: 301,
                    permissionId: 404,
                    timestamp: '2024-05-01T19:55:00Z',
                    reason: 'Permission already assigned to the user.',
                },
            },
            {
                channel: 'user', // Channel name for user-related publications
                event: 'removePermissionFromUserSucceeded', // Event name indicating successful removal of a permission from a user
                description: 'Emits an event signaling that a permission has been successfully removed from a user.',
                condition: 'Remove permission from user API call succeeds.',
                dataFormat: {
                    userId: 'integer', // ID of the user
                    permissionId: 'integer', // ID of the permission removed
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                },
                exampleData: {
                    userId: 301,
                    permissionId: 404,
                    timestamp: '2024-05-01T20:00:00Z',
                },
            },
            {
                channel: 'user', // Channel name for user-related publications
                event: 'removePermissionFromUserFailed', // Event name indicating failed removal of a permission from a user
                description: 'Emits an event signaling that removing a permission from a user has failed.',
                condition: 'Remove permission from user API call fails.',
                dataFormat: {
                    userId: 'integer', // ID of the user
                    permissionId: 'integer', // ID of the permission attempted to remove
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the event
                    reason: 'string', // Reason for the failure
                },
                exampleData: {
                    userId: 301,
                    permissionId: 404,
                    timestamp: '2024-05-01T20:05:00Z',
                    reason: 'Permission is not assigned to the user.',
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
        console.log(`UserService (${data.componentName}) received 'system:start' event with data:`, data.data)
        // Implement additional logic for handling the start event if needed
    }

    /**
     * Handler for 'system:stop' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`UserService (${data.componentName}) received 'system:stop' event with data:`, data.data)
        // Implement additional logic for handling the stop event if needed
    }

    /**
     * Handler for 'ui:windowSizeChange' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleWindowSizeChange(data) {
        console.log(`UserService (${data.componentName}) received 'ui:windowSizeChange' event with data:`, data.data)
        // Implement additional logic for handling window size changes if needed
    }

    /**
     * Creates a new user by interacting with the backend API.
     *
     * @param {string} username - The username of the user.
     * @param {string} email - The email of the user.
     * @param {string} password - The password of the user.
     * @returns {Promise<Object>} - Resolves with user data on success.
     * @throws {Error} - Throws an error if user creation fails.
     */
    const createUser = async (username, email, password) => {
        try {
            const response = await apiClient.post('/User', {
                username,
                email,
                password,
            })

            // Handle both 200 and 201 responses
            if (response.status === 200 || response.status === 201) {
                const { id: userId, username: returnedUsername, email: returnedEmail, roles } = response.data

                return {
                    userId,
                    username: returnedUsername,
                    email: returnedEmail,
                    roles,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'User creation failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Updates an existing user by interacting with the backend API.
     *
     * @param {number} userId - The ID of the user to update.
     * @param {string} [username] - The new username of the user.
     * @param {string} [email] - The new email of the user.
     * @param {string} [password] - The new password of the user.
     * @returns {Promise<Object>} - Resolves with updated user data on success.
     * @throws {Error} - Throws an error if user update fails.
     */
    const updateUser = async (userId, username, email, password) => {
        try {
            const payload = {}
            if (username) payload.username = username
            if (email) payload.email = email
            if (password) payload.password = password

            const response = await apiClient.put(`/User/${userId}`, payload)

            if (response.status === 200 || response.status === 204) {
                if (response.status === 200) {
                    const {
                        id: updatedUserId,
                        username: updatedUsername,
                        email: updatedEmail,
                        roles: updatedRoles,
                    } = response.data

                    return {
                        userId: updatedUserId,
                        username: updatedUsername,
                        email: updatedEmail,
                        roles: updatedRoles,
                        timestamp: new Date().toISOString(),
                    }
                } else {
                    // For 204 No Content, return the userId and timestamp
                    return {
                        userId,
                        timestamp: new Date().toISOString(),
                    }
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'User update failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Deletes an existing user by interacting with the backend API.
     *
     * @param {number} userId - The ID of the user to delete.
     * @returns {Promise<Object>} - Resolves with deletion confirmation on success.
     * @throws {Error} - Throws an error if user deletion fails.
     */
    const deleteUser = async (userId) => {
        try {
            const response = await apiClient.delete(`/User/${userId}`)

            if (response.status === 200 || response.status === 204) {
                return {
                    userId,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'User deletion failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Adds a role to a user by interacting with the backend API.
     *
     * @param {number} userId - The ID of the user.
     * @param {number} roleId - The ID of the role to add.
     * @returns {Promise<Object>} - Resolves with addition confirmation on success.
     * @throws {Error} - Throws an error if adding role to user fails.
     */
    const addRoleToUser = async (userId, roleId) => {
        try {
            const response = await apiClient.post('/User/AddRole', {
                userId,
                roleId,
            })

            if (response.status === 200) {
                return {
                    userId,
                    roleId,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Adding role to user failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Removes a role from a user by interacting with the backend API.
     *
     * @param {number} userId - The ID of the user.
     * @param {number} roleId - The ID of the role to remove.
     * @returns {Promise<Object>} - Resolves with removal confirmation on success.
     * @throws {Error} - Throws an error if removing role from user fails.
     */
    const removeRoleFromUser = async (userId, roleId) => {
        try {
            const response = await apiClient.delete('/User/RemoveRole', {
                data: {
                    userId,
                    roleId,
                },
            })

            if (response.status === 200) {
                return {
                    userId,
                    roleId,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Removing role from user failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Adds a permission to a user by interacting with the backend API.
     *
     * @param {number} userId - The ID of the user.
     * @param {number} permissionId - The ID of the permission to add.
     * @returns {Promise<Object>} - Resolves with addition confirmation on success.
     * @throws {Error} - Throws an error if adding permission to user fails.
     */
    const addPermissionToUser = async (userId, permissionId) => {
        try {
            const response = await apiClient.post('/User/AddPermission', {
                userId,
                permissionId,
            })

            if (response.status === 200) {
                return {
                    userId,
                    permissionId,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Adding permission to user failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Removes a permission from a user by interacting with the backend API.
     *
     * @param {number} userId - The ID of the user.
     * @param {number} permissionId - The ID of the permission to remove.
     * @returns {Promise<Object>} - Resolves with removal confirmation on success.
     * @throws {Error} - Throws an error if removing permission from user fails.
     */
    const removePermissionFromUser = async (userId, permissionId) => {
        try {
            const response = await apiClient.delete('/User/RemovePermission', {
                data: {
                    userId,
                    permissionId,
                },
            })

            if (response.status === 200) {
                return {
                    userId,
                    permissionId,
                    timestamp: new Date().toISOString(),
                }
            } else {
                throw new Error('Unexpected response status.')
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Removing permission from user failed. Please try again.'
            throw new Error(errorMessage)
        }
    }

    /**
     * Handler for 'user:createUserRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleCreateUserRequested = async (data) => {
        console.log(`UserService: Received 'user:createUserRequested' event with data:`, data.data)

        const { username, email, password, timestamp } = data.data

        try {
            const userData = await createUser(username, email, password)

            // On successful creation, publish 'createUserSucceeded'
            mediator.publish(
                name,
                code,
                'user',
                'createUserSucceeded',
                {
                    userId: userData.userId,
                    username: userData.username,
                    email: userData.email,
                    roles: userData.roles,
                    timestamp: userData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'createUserFailed'
            mediator.publish(
                name,
                code,
                'user',
                'createUserFailed',
                {
                    username,
                    email,
                    password,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'user:updateUserRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleUpdateUserRequested = async (data) => {
        console.log(`UserService: Received 'user:updateUserRequested' event with data:`, data.data)

        const { userId, username, email, password, timestamp } = data.data

        try {
            const updatedUserData = await updateUser(userId, username, email, password)

            // On successful update, publish 'updateUserSucceeded'
            mediator.publish(
                name,
                code,
                'user',
                'updateUserSucceeded',
                {
                    userId: updatedUserData.userId,
                    username: updatedUserData.username,
                    email: updatedUserData.email,
                    roles: updatedUserData.roles,
                    timestamp: updatedUserData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'updateUserFailed'
            mediator.publish(
                name,
                code,
                'user',
                'updateUserFailed',
                {
                    userId: userId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'user:deleteUserRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleDeleteUserRequested = async (data) => {
        console.log(`UserService: Received 'user:deleteUserRequested' event with data:`, data.data)

        const { userId, timestamp } = data.data

        try {
            const deleteResponse = await deleteUser(userId)

            // On successful deletion, publish 'deleteUserSucceeded'
            mediator.publish(
                name,
                code,
                'user',
                'deleteUserSucceeded',
                {
                    userId: deleteResponse.userId,
                    timestamp: deleteResponse.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'deleteUserFailed'
            mediator.publish(
                name,
                code,
                'user',
                'deleteUserFailed',
                {
                    userId: userId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'user:addRoleToUserRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleAddRoleToUserRequested = async (data) => {
        console.log(`UserService: Received 'user:addRoleToUserRequested' event with data:`, data.data)

        const { userId, roleId, timestamp } = data.data

        try {
            const addRoleData = await addRoleToUser(userId, roleId)

            // On successful addition, publish 'addRoleToUserSucceeded'
            mediator.publish(
                name,
                code,
                'user',
                'addRoleToUserSucceeded',
                {
                    userId: addRoleData.userId,
                    roleId: addRoleData.roleId,
                    timestamp: addRoleData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'addRoleToUserFailed'
            mediator.publish(
                name,
                code,
                'user',
                'addRoleToUserFailed',
                {
                    userId: userId,
                    roleId: roleId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'user:removeRoleFromUserRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleRemoveRoleFromUserRequested = async (data) => {
        console.log(`UserService: Received 'user:removeRoleFromUserRequested' event with data:`, data.data)

        const { userId, roleId, timestamp } = data.data

        try {
            const removeRoleData = await removeRoleFromUser(userId, roleId)

            // On successful removal, publish 'removeRoleFromUserSucceeded'
            mediator.publish(
                name,
                code,
                'user',
                'removeRoleFromUserSucceeded',
                {
                    userId: removeRoleData.userId,
                    roleId: removeRoleData.roleId,
                    timestamp: removeRoleData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'removeRoleFromUserFailed'
            mediator.publish(
                name,
                code,
                'user',
                'removeRoleFromUserFailed',
                {
                    userId: userId,
                    roleId: roleId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'user:addPermissionToUserRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleAddPermissionToUserRequested = async (data) => {
        console.log(`UserService: Received 'user:addPermissionToUserRequested' event with data:`, data.data)

        const { userId, permissionId, timestamp } = data.data

        try {
            const addPermissionData = await addPermissionToUser(userId, permissionId)

            // On successful addition, publish 'addPermissionToUserSucceeded'
            mediator.publish(
                name,
                code,
                'user',
                'addPermissionToUserSucceeded',
                {
                    userId: addPermissionData.userId,
                    permissionId: addPermissionData.permissionId,
                    timestamp: addPermissionData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'addPermissionToUserFailed'
            mediator.publish(
                name,
                code,
                'user',
                'addPermissionToUserFailed',
                {
                    userId: userId,
                    permissionId: permissionId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Handler for 'user:removePermissionFromUserRequested' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    const handleRemovePermissionFromUserRequested = async (data) => {
        console.log(`UserService: Received 'user:removePermissionFromUserRequested' event with data:`, data.data)

        const { userId, permissionId, timestamp } = data.data

        try {
            const removePermissionData = await removePermissionFromUser(userId, permissionId)

            // On successful removal, publish 'removePermissionFromUserSucceeded'
            mediator.publish(
                name,
                code,
                'user',
                'removePermissionFromUserSucceeded',
                {
                    userId: removePermissionData.userId,
                    permissionId: removePermissionData.permissionId,
                    timestamp: removePermissionData.timestamp,
                },
                Date.now()
            )
        } catch (error) {
            // On failure, publish 'removePermissionFromUserFailed'
            mediator.publish(
                name,
                code,
                'user',
                'removePermissionFromUserFailed',
                {
                    userId: userId,
                    permissionId: permissionId,
                    timestamp: new Date().toISOString(),
                    reason: error.message,
                },
                Date.now()
            )
        }
    }

    /**
     * Define custom event handlers specific to UserService.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const customHandlers = {
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'ui:windowSizeChange': handleWindowSizeChange,
        'user:createUserRequested': handleCreateUserRequested,
        'user:updateUserRequested': handleUpdateUserRequested,
        'user:deleteUserRequested': handleDeleteUserRequested,
        'user:addRoleToUserRequested': handleAddRoleToUserRequested,
        'user:removeRoleFromUserRequested': handleRemoveRoleFromUserRequested,
        'user:addPermissionToUserRequested': handleAddPermissionToUserRequested,
        'user:removePermissionFromUserRequested': handleRemovePermissionFromUserRequested,
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
                        `Handler for event '${eventName}' on channel '${channel}' is not implemented in UserService.`
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
            console.log(`UserService: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2))
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
                console.warn(`No handler implemented for event '${event}' on channel '${channel}' in UserService.`)
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
                console.log(`UserService (${name}) initialized.`)
                // Additional initialization logic if needed
            },
            destroy: () => {
                console.log(`UserService (${name}) destroyed.`)
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
                    console.log(`UserService (${name}) initialized.`)
                },
                destroy: () => {
                    console.log(`UserService (${name}) destroyed.`)
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
UserService.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the UserService instance
    code: PropTypes.string.isRequired, // The unique code identifier for the UserService
    description: PropTypes.string.isRequired, // A brief description of the UserService
    extendedPublishSpec: PropTypes.object, // Extended publish specifications for additional events
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications for additional events
}

/**
 * Wraps the UserService component with React.memo to prevent unnecessary re-renders.
 * This optimization enhances performance, especially when the component receives stable props.
 */
export default React.memo(UserService)
