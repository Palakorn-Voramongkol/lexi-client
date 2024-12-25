// src/mediators/MediatorProvider.js

import React, { useLayoutEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import MediatorContext from '../contexts/MediatorContext'
import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../components/BaseComponent/mergeSpec'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'

/**
 * MediatorProvider Functional Component
 *
 * Manages event subscriptions and publications based on predefined specifications.
 * Facilitates communication between different components by handling event distribution.
 *
 * @param {Object} props - The properties passed to the component.
 * @returns {JSX.Element} The MediatorProvider component.
 */
const MediatorProvider = ({
    name,
    code,
    description,
    extendedSubscriptionSpec = {},
    extendedPublishSpec = {},
    children,
}) => {
    console.log('MediatorProvider mounted') // Diagnostic Log

    // Refs for mutable objects
    const channelsRef = useRef({})
    const publicationsRef = useRef([])
    const registeredComponentsRef = useRef(new Set())
    const internalLogRef = useRef([])

    /**
     * Initialize Subscriptions and Publications Synchronously
     */
    // Define initial subscription specifications
    const initialSubscriptionSpec = {
        subscriptions: [
            {
                channel: 'system',
                events: [
                    {
                        name: 'start',
                        description: 'Handles the application start event to initialize the UI.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Example: "2024-11-18T10:00:00Z"
                        },
                    },
                    {
                        name: 'stop',
                        description: 'Handles the application stop event to clean up the UI.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Example: "2024-11-18T18:00:00Z"
                        },
                    },
                ],
            },
        ],
    }

    // Define initial publication specifications
    const initialPublicationSpec = {
        publications: [
            {
                channel: 'system',
                event: 'registeredComponentSpec',
                description: 'Publish the specification of the new component spec.',
                condition: 'When the new component is registered and wants to publish the new spec',
                dataFormat: {
                    timeStamp: 'string (ISO 8601 format)',
                    componentName: 'string',
                    componentSpec: 'object',
                },
                exampleData: {
                    timeStamp: '2023-10-01T12:00:00Z',
                    componentName: 'MyComponent',
                    componentSpec: {
                        name: 'MyComponent',
                        code: 'comp123',
                        description: 'This is a sample component.',
                        subscriptionSpec: {
                            subscriptions: [
                                {
                                    channel: 'system',
                                    events: [
                                        {
                                            name: 'start',
                                            description: 'Triggered when the system starts.',
                                            required: true,
                                        },
                                    ],
                                },
                            ],
                        },
                        publicationSpec: {
                            publications: [
                                {
                                    channel: 'componentStatus',
                                    event: 'statusUpdate',
                                    description: 'Publishes the status update of the component.',
                                    condition: 'When the component status changes.',
                                    dataFormat: {
                                        timestamp: 'string (ISO 8601 format)',
                                        componentName: 'string',
                                        componentSpec: 'object',
                                    },
                                    exampleData: {
                                        timestamp: '2023-10-01T12:00:00Z',
                                        componentName: 'MyComponent',
                                        componentSpec: {
                                            version: '1.0.0',
                                            status: 'active',
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            },
            {
                channel: 'system',
                event: 'unregisteredComponentSpec',
                description: 'Publish the unregister component.',
                condition: 'When the component is unregistered ',
                dataFormat: {
                    timeStamp: 'string (ISO 8601 format)',
                    componentName: 'string',
                    componentSpec: 'object',
                },
                exampleData: {
                    timeStamp: '2023-10-01T12:00:00Z',
                    componentName: 'MyComponent',
                    componentSpec: {
                        name: 'MyComponent',
                        code: 'comp123',
                        description: 'This is a sample component.',
                        subscriptionSpec: {
                            subscriptions: [
                                {
                                    channel: 'system',
                                    events: [
                                        {
                                            name: 'start',
                                            description: 'Triggered when the system starts.',
                                            required: true,
                                        },
                                    ],
                                },
                            ],
                        },
                        publicationSpec: {
                            publications: [
                                {
                                    channel: 'componentStatus',
                                    event: 'statusUpdate',
                                    description: 'Publishes the status update of the component.',
                                    condition: 'When the component status changes.',
                                    dataFormat: {
                                        timestamp: 'string (ISO 8601 format)',
                                        componentName: 'string',
                                        componentSpec: 'object',
                                    },
                                    exampleData: {
                                        timestamp: '2023-10-01T12:00:00Z',
                                        componentName: 'MyComponent',
                                        componentSpec: {
                                            version: '1.0.0',
                                            status: 'active',
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        ],
    }

    // Merge extended specs synchronously
    const mergedPublicationSpec = mergePublicationSpecs(initialPublicationSpec, extendedPublishSpec)
    const mergedSubscriptionSpec = mergeSubscriptionSpecs(initialSubscriptionSpec, extendedSubscriptionSpec)

    /**
     * Registers event handlers with the mediator upon component mount.
     * Also performs any initialization logic, such as fetching user settings.
     * Cleans up event handlers upon component unmount.
     */
    useLayoutEffect(() => {
        // Changed from useEffect to useLayoutEffect
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
            console.log(`MediatorProvider: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2))
            if (typeof eventHandlers[handlerKey] === 'function') {
                eventHandlers[handlerKey]({ componentName, componentCode, channel, event, data, timestamp })
            } else {
                console.warn(`MediatorProvider: No handler implemented for event '${event}' on channel '${channel}'`)
            }
        }

        // Register the component with the mediator
        register({
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
                console.log(`MediatorProvider (${name}) initialized.`)
                // Perform any additional initialization logic here
                // Example: Fetch initial settings data
                // mediator.publish(name, code, 'settings', 'fetchSettings', { userId: code, timestamp: Date.now() });
            },
            destroy: () => {
                console.log(`MediatorProvider (${name}) destroyed.`)
                // Perform any necessary cleanup here
            },
        })

        // Cleanup function to unregister the component when it unmounts
        return () => {
            unregister({
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
                    console.log(`MediatorProvider (${name}) initialized.`)
                },
                destroy: () => {
                    console.log(`MediatorProvider (${name}) destroyed.`)
                },
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Empty dependency array ensures this runs once on mount and cleans up on unmount

    console.log('MediatorProvider initialized with publications and subscriptions.')

    /**
     * Helper function to add an event to the internal log.
     * Ensures the log does not exceed 100 entries.
     */
    const addEvent = (newEvent) => {
        internalLogRef.current = [newEvent, ...internalLogRef.current].slice(0, 100)
    }

    /**
     * Logging function
     */
    const logEvent = (type, data) => {
        const timestamp = Date.now()
        internalLogRef.current.push({ type, timestamp, data })
    }

    /**
     * Event handler for 'system:start' event.
     *
     * @param {Object} eventObj - The event object containing event details.
     */
    function handleSystemStart(eventObj) {
        const { data } = eventObj
        console.log(`MediatorProvider (${name}) received 'system:start' event with data:`, data)
        // TODO: Implement additional logic for handling the start event
    }

    /**
     * Event handler for 'system:stop' event.
     *
     * @param {Object} eventObj - The event object containing event details.
     */
    function handleSystemStop(eventObj) {
        const { data } = eventObj
        console.log(`MediatorProvider (${name}) received 'system:stop' event with data:`, data)
        // TODO: Implement additional logic for handling the stop event
    }

    function handleRegisteredComponentSpec(eventObj) {
        const { data } = eventObj
        addEvent({
            id: uuidv4(),
            timestamp: dayjs(data.timeStamp).format('YYYY-MM-DD HH:mm:ss'),
            componentName: data.componentName,
            componentCode: data.componentSpec.code || 'N/A',
            channel: 'system',
            event: 'Registered Component',
            origin: 'subscription spec',
        })
    }

    function handleUnregisteredComponentSpec(eventObj) {
        const { data } = eventObj
        addEvent({
            id: uuidv4(),
            timestamp: dayjs(data.timeStamp).format('YYYY-MM-DD HH:mm:ss'),
            componentName: data.componentName,
            componentCode: 'N/A',
            channel: 'system',
            event: 'Unregistered Component',
            origin: 'publication spec',
        })
    }

    /**
     * Define custom event handlers specific to MediatorProvider.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const eventHandlers = {
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'system:registeredComponentSpec': handleRegisteredComponentSpec,
        'system:unregisteredComponentSpec': handleUnregisteredComponentSpec,
    }

    /**
     * Function to register a component with the mediator.
     * Handles both subscriptions and publications in a unified manner.
     *
     * @param {Object} component - The component instance to register.
     */
    function register(component) {
        console.log('Registering component:', component.code)
        try {
            // Validate that code and name are not empty
            if (!component.code || !component.name || !component.description) {
                throw new Error('Component code and name must not be empty.')
            }

            // Check for duplicate registration
            const isRegistered = Array.from(registeredComponentsRef.current).some(
                (comp) => comp.code === component.code
            )

            if (isRegistered) {
                console.log(`Component with code '${component.code}' is already registered.`)
                return
            }

            // Inject the mediator instance into the component if 'setMediator' method exists
            if (typeof component.setMediator === 'function') {
                component.setMediator({
                    publish,
                    receiveSubscriptionEvent,
                })
            }

            // Verify event handlers for subscriptions
            const subscriptionSpec = component.getSubscriptionSpec()
            if (subscriptionSpec && subscriptionSpec.subscriptions) {
                subscriptionSpec.subscriptions.forEach((sub) => {
                    const { channel, events } = sub
                    if (!channel || !events) {
                        throw new Error('Each subscription must have a channel and events.')
                    }
                    events.forEach((event) => {
                        const eventName = event.name
                        if (!eventName) {
                            throw new Error('Each event must have a name.')
                        }
                    })
                })
            }

            // Register publications from the component
            const publicationSpec = component.getPublicationSpec()
            if (publicationSpec && publicationSpec.publications) {
                publicationSpec.publications.forEach((spec) => {
                    const { channel, event, description, condition, dataFormat, exampleData } = spec
                    if (!channel || !event || !description || !condition || !dataFormat || !exampleData) {
                        throw new Error(
                            'Each publication must have channel, event, description, condition, dataFormat, and exampleData.'
                        )
                    }
                    publicationsRef.current.push({
                        channel,
                        event,
                        description,
                        condition,
                        dataFormat,
                        exampleData,
                        contributor: component.name,
                    })
                })
            }

            // Register subscriptions
            if (subscriptionSpec && subscriptionSpec.subscriptions) {
                subscriptionSpec.subscriptions.forEach((sub) => {
                    const { channel, events } = sub
                    if (!channel || !events) {
                        throw new Error('Each subscription must have a channel and events.')
                    }
                    events.forEach((event) => {
                        const eventName = event.name
                        if (!eventName) {
                            throw new Error('Each event must have a name.')
                        }
                        // Initialize channel and event in channelsRef
                        if (!channelsRef.current[channel]) {
                            channelsRef.current[channel] = {}
                        }
                        if (!channelsRef.current[channel][eventName]) {
                            channelsRef.current[channel][eventName] = new Set()
                        }
                        channelsRef.current[channel][eventName].add(component)
                    })
                })
            }

            // Add component to registered components
            registeredComponentsRef.current.add(component)
            logEvent('register', {
                componentName: component.name,
                componentCode: component.code,
                componentSpec: component.getComponentFullSpec(),
                timestamp: Date.now(),
            })
            console.log(`Component '${component.code}' registered successfully.`)
        } catch (error) {
            console.error(`Failed to register component '${component.code}': ${error.message}`)
        }
        try {
            // Publish 'registeredComponentSpec' event
            publish(
                component.name,
                component.code,
                'system',
                'registeredComponentSpec',
                component.getComponentFullSpec(),
                Date.now()
            )
        } catch (error) {
            console.error(
                `Failed to publish registered component event "registeredComponentSpec" for : '${component.name}': ${error.message}`
            )
        }
    }

    /**
     * Function to unregister a component from the mediator.
     * Prevents unregistration if the component's code starts with 'sys_'.
     *
     * @param {Object} component - The component instance to unregister.
     */
    function unregister(component) {
        // Check if the component's code starts with 'sys_'
        if (component.code.startsWith('sys_')) {
            console.log(
                `Component '${component.name}' with code '${component.code}' is a system component and will not be unregistered.`
            )
            return // Exit the function early to prevent unregistration
        }
        console.log('Unregistering component:', component.code)
        // Remove the component from all channel subscriptions
        for (const channel in channelsRef.current) {
            for (const event in channelsRef.current[channel]) {
                channelsRef.current[channel][event].delete(component)
                // If no more subscribers, delete the event
                if (channelsRef.current[channel][event].size === 0) {
                    delete channelsRef.current[channel][event]
                }
            }
            // If no more events in the channel, delete the channel
            if (Object.keys(channelsRef.current[channel]).length === 0) {
                delete channelsRef.current[channel]
            }
        }
        // Remove publications contributed by the component
        publicationsRef.current = publicationsRef.current.filter((spec) => spec.contributor !== component.name)

        // Remove the component from registered components
        registeredComponentsRef.current.delete(component)
        logEvent('unregister', { componentName: component.name, componentCode: component.code })

        console.log(`Component '${component.name}' unregistered successfully.`)
    }

    /**
     * Function to publish an event.
     * @param {string} componentName - Name of the component publishing the event.
     * @param {string} componentCode - Code of the component publishing the event.
     * @param {string} channel - The channel name.
     * @param {string} event - The event name.
     * @param {Object} data - The data associated with the event.
     * @param {number} timestamp - The event timestamp.
     */
    function publish(componentName, componentCode, channel, event, data, timestamp) {
        const eventSpecs = publicationsRef.current.filter((pub) => pub.channel === channel && pub.event === event)
        if (eventSpecs.length === 0) {
            console.warn(`Attempted to publish undefined event '${event}' on channel '${channel}'.`)
            return
        }
        logEvent('publish', { componentName, componentCode, channel, event, data, timestamp })
        console.log(
            `\n[Mediator] Publishing event at '${dayjs(timestamp).format(
                'YYYY-MM-DD HH:mm:ss'
            )}' : '${event}' on channel '${channel}' with data:`,
            data
        )
        // Notify all subscribed components
        if (channelsRef.current[channel] && channelsRef.current[channel][event]) {
            channelsRef.current[channel][event].forEach((component) => {
                if (typeof component.handleEvent === 'function') {
                    component.handleEvent({ componentName, componentCode, channel, event, data, timestamp })
                }
            })
        }
    }

    /**
     * Function to handle subscription events received.
     * @param {string} componentName - Name of the component triggering the event.
     * @param {string} componentCode - Code of the component triggering the event.
     * @param {string} channel - The channel name.
     * @param {string} event - The event name.
     * @param {Object} data - The data associated with the event.
     */
    function receiveSubscriptionEvent(componentName, componentCode, channel, event, data) {
        logEvent('subscription', { componentName, componentCode, channel, event, data })
        console.log(`[Mediator] Received subscription event '${event}' on channel '${channel}' with data:`, data)
    }

    /**
     * Function to retrieve logs by types with pagination.
     * @param {Array<string>} types - The types of logs to retrieve.
     * @param {number} page - The page number (1-based index).
     * @param {number} pageSize - The number of logs per page.
     * @returns {Object} - An object containing the logs and total count.
     */
    function getLogsByTypes(types, page = 1, pageSize = 10) {
        if (!Array.isArray(types) || types.length === 0 || !types.every((type) => typeof type === 'string')) {
            console.warn('Invalid types specified. Please provide an array of valid log types.')
            return { logs: [], total: 0 }
        }
        if (typeof page !== 'number' || page <= 0 || !Number.isInteger(page)) {
            console.warn('Invalid page number specified. Please provide a positive integer.')
            page = 1
        }
        if (typeof pageSize !== 'number' || pageSize <= 0 || !Number.isInteger(pageSize)) {
            console.warn('Invalid pageSize specified. Please provide a positive integer.')
            pageSize = 10
        }
        if (!Array.isArray(internalLogRef.current)) {
            console.warn('Internal log is not initialized or is not an array.')
            return { logs: [], total: 0 }
        }
        const filteredLogs = internalLogRef.current
            .filter((log) => types.includes(log.type))
            .sort((a, b) => b.timestamp - a.timestamp)
        const total = filteredLogs.length
        const startIndex = (page - 1) * pageSize
        const endIndex = startIndex + pageSize
        const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

        return { logs: paginatedLogs, total }
    }

    /**
     * Function to retrieve recent logs with pagination.
     * @param {number} page - The page number (1-based index).
     * @param {number} pageSize - The number of logs per page.
     * @returns {Object} - An object containing the logs and total count.
     */
    function getRecentLogs(page = 1, pageSize = 10) {
        if (typeof page !== 'number' || page <= 0 || !Number.isInteger(page)) {
            console.warn('Invalid page number specified. Please provide a positive integer.')
            page = 1
        }
        if (typeof pageSize !== 'number' || pageSize <= 0 || !Number.isInteger(pageSize)) {
            console.warn('Invalid pageSize specified. Please provide a positive integer.')
            pageSize = 10
        }
        if (!Array.isArray(internalLogRef.current)) {
            console.warn('Internal log is not initialized or is not an array.')
            return { logs: [], total: 0 }
        }

        const sortedLogs = [...internalLogRef.current].sort((a, b) => b.timestamp - a.timestamp)
        const total = sortedLogs.length
        const startIndex = (page - 1) * pageSize
        const endIndex = startIndex + pageSize
        const paginatedLogs = sortedLogs.slice(startIndex, endIndex)
        return { logs: paginatedLogs, total }
    }

    /**
     * Function to retrieve Pub/Sub status.
     * @returns {Object} - An object detailing subscription status and publication contributors.
     */
    function getPubSubStatus() {
        if (registeredComponentsRef.current.size === 0) {
            return { message: 'No components are currently registered with subscriptions or publications.' }
        }

        const pubSubStatus = {
            subscriptions: [],
            publications: [],
        }

        // Collect subscription details
        for (const [channel, events] of Object.entries(channelsRef.current)) {
            for (const [event, components] of Object.entries(events)) {
                pubSubStatus.subscriptions.push({
                    channel,
                    event,
                    subscribers: Array.from(components).map((component) => component.name),
                })
            }
        }

        // Collect publication details
        if (publicationsRef.current.length > 0) {
            publicationsRef.current.forEach((publication) => {
                pubSubStatus.publications.push({
                    channel: publication.channel,
                    event: publication.event,
                    contributor: publication.contributor || 'Mediator',
                })
            })
        }

        console.log('Pub/Sub Channels:', JSON.stringify(channelsRef.current, null, 2))
        return pubSubStatus
    }

    /**
     * Function to retrieve registered components and their specifications.
     * @returns {Object} - An object detailing registered components and their specs.
     */
    function getRegisteredComponents() {
        if (registeredComponentsRef.current.size === 0) {
            return { message: 'No components are currently registered.' }
        }

        const componentsInfo = []
        registeredComponentsRef.current.forEach((component) => {
            componentsInfo.push({
                name: component.name,
                code: component.code,
                description: component.description,
                subscriptionSpec: component.getSubscriptionSpec().subscriptions.map((sub) => ({
                    channel: sub.channel,
                    events: sub.events.map((event) => ({
                        name: event.name,
                        description: event.description,
                        dataFormat: event.dataFormat,
                    })),
                })),
                publicationSpec: {
                    publications: component.getPublicationSpec().publications.map((spec) => ({
                        channel: spec.channel,
                        event: spec.event,
                        description: spec.description,
                        condition: spec.condition,
                        dataFormat: spec.dataFormat,
                        exampleData: spec.exampleData,
                    })),
                },
            })
        })

        return { registeredComponents: componentsInfo }
    }

    /**
     * Function to print the internal log.
     */
    function printInternalLog() {
        console.log(`\n=== Internal Mediator Log ===`)
        console.log(JSON.stringify(internalLogRef.current, null, 2))
        console.log(`=== End of Internal Mediator Log ===\n`)
    }

    /**
     * Function to print the publication specification.
     */
    function printPublicationSpec() {
        console.log(`\n=== Mediator Publish Specification ===`)
        if (publicationsRef.current.length === 0) {
            console.log('No publish events defined.')
        } else {
            console.log(JSON.stringify({ publicationSpec: { publications: publicationsRef.current } }, null, 2))
        }
        console.log(`=== End of Mediator Publish Specification ===\n`)
    }

    /**
     * Function to print the subscription specification.
     */
    function printSubscriptionSpec() {
        console.log(`\n=== Mediator Subscription Specification ===`)
        const subscriptionSpecInfo = {
            subscriptionSpec: {
                subscriptions: [],
            },
        }

        // Iterate over each registered component to gather their subscription specifications
        registeredComponentsRef.current.forEach((component) => {
            const componentSubSpec = component.getSubscriptionSpec()
            if (componentSubSpec && componentSubSpec.subscriptions) {
                componentSubSpec.subscriptions.forEach((sub) => {
                    subscriptionSpecInfo.subscriptionSpec.subscriptions.push({
                        componentName: component.name,
                        channel: sub.channel,
                        events: sub.events.map((event) => ({
                            name: event.name,
                            description: event.description,
                            dataFormat: event.dataFormat,
                        })),
                    })
                })
            }
        })

        if (subscriptionSpecInfo.subscriptionSpec.subscriptions.length === 0) {
            console.log('No subscription specifications defined.')
        } else {
            console.log(JSON.stringify(subscriptionSpecInfo, null, 2))
        }

        console.log(`=== End of Mediator Subscription Specification ===\n`)
    }

    /**
     * Function to print registered components.
     */
    function printRegisteredComponents() {
        console.log(`\n=== Registered Components ===`)
        const registeredComponentsInfo = getRegisteredComponents()

        if (registeredComponentsInfo.message) {
            console.log(registeredComponentsInfo.message)
        } else {
            console.log(
                JSON.stringify({ registeredComponents: registeredComponentsInfo.registeredComponents }, null, 2)
            )
        }

        console.log(`=== End of Registered Components ===\n`)
    }

    /**
     * Context value to be provided to consuming components.
     */
    const contextValue = {
        register,
        unregister,
        publish,
        receiveSubscriptionEvent,
        getLogsByTypes,
        getRecentLogs,
        getPubSubStatus,
        getRegisteredComponents,
        printInternalLog,
        printPublicationSpec,
        printSubscriptionSpec,
        printRegisteredComponents,
    }

    return <MediatorContext.Provider value={contextValue}>{children}</MediatorContext.Provider>
}

/**
 * Define PropTypes for the MediatorProvider component.
 */
MediatorProvider.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the Mediator instance
    code: PropTypes.string.isRequired, // The unique code identifier for the Mediator
    description: PropTypes.string.isRequired, // A brief description of the Mediator
    extendedPublishSpec: PropTypes.object, // Extended publication specifications (optional)
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications (optional)
    children: PropTypes.node.isRequired, // Child components that can access the mediator
}

export default MediatorProvider
