// src/hooks/useBaseComponent.js

import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../components/BaseComponent/mergeSpec'
import getHandlerMethodName from '../components/BaseComponent/subScriptionHandle'

/**
 * Custom Hook: useBaseComponent
 *
 * Provides mediator registration, subscription, publication,
 * and event handling functionalities to functional components.
 *
 * @param {Object} config - Configuration object.
 * @param {string} config.name - Unique name of the component.
 * @param {string} config.code - Short code representing the component.
 * @param {Object} config.mediator - Mediator instance for event communication.
 * @param {string} config.description - Brief description of the component.
 * @param {Object} config.extendedSubscriptionSpec - Extended subscription specifications.
 * @param {Object} config.extendedPublishSpec - Extended publication specifications.
 * @param {Function} [config.onInitialize] - Initialization callback.
 * @param {Function} [config.onDestroy] - Cleanup callback.
 * @param {Object} [config.customHandlers] - Custom event handlers mapped by channel and event.
 *
 * @returns {Object} - An object containing the publish function and any other necessary utilities.
 */
const useBaseComponent = ({
    name,
    code,
    mediator,
    description,
    extendedSubscriptionSpec = {},
    extendedPublishSpec = {},
    onInitialize = () => {},
    onDestroy = () => {},
    customHandlers = {}, // { 'channel:event': handlerFunction }
}) => {
    const isMounted = useRef(false)

    // Merge subscription and publication specifications
    const subscriptionSpec = {
        subscriptions: [
            // Define initial subscriptions if any
        ],
    }

    const publicationSpec = {
        publications: [
            // Define initial publications if any
        ],
    }

    const mergedSubscriptionSpec = mergeSubscriptionSpecs(subscriptionSpec, extendedSubscriptionSpec)
    const mergedPublicationSpec = mergePublicationSpecs(publicationSpec, extendedPublishSpec)

    /**
     * Handler for incoming events.
     * Maps events to custom handler functions based on channel and event names.
     *
     * @param {Object} eventObj - The event object.
     */
    const handleEvent = (eventObj) => {
        const { channel, event, componentName, componentCode, data, timestamp } = eventObj
        console.log(`${name} at ${timestamp}, received event '${event}' on channel '${channel}' with data:`, data)

        const handlerMethodName = getHandlerMethodName(channel, event)
        const key = `${channel}:${event}`

        if (customHandlers[key] && typeof customHandlers[key] === 'function') {
            customHandlers[key](eventObj)
        } else {
            console.warn(`No handler found for ${channel}:${event} in ${name}.`)
        }
    }

    /**
     * Publishes an event via the mediator.
     *
     * @param {string} channel - The channel to publish the event on.
     * @param {string} event - The name of the event.
     * @param {Object} data - The data associated with the event.
     */
    const publish = (channel, event, data) => {
        if (mediator) {
            mediator.publish(name, code, channel, event, data, Date.now())
        } else {
            console.error('Mediator is not set. Cannot publish event.')
        }
    }

    useEffect(() => {
        // Prevent running on server or if mediator is not provided
        if (!mediator) return

        // Register the component with the mediator
        const component = {
            name,
            code,
            description,
            subscriptionSpec: mergedSubscriptionSpec,
            publicationSpec: mergedPublicationSpec,
            handleEvent,
            publish,
        }

        mediator.register(component)
        console.log(`Component '${name}' registered successfully.`)

        // Call the initialization callback
        onInitialize()

        isMounted.current = true

        // Cleanup function
        return () => {
            if (mediator) {
                mediator.unregister(component)
                console.log(`Component '${name}' unregistered successfully.`)
            }
            // Call the cleanup callback
            onDestroy()
            isMounted.current = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mediator, name, code, description, mergedSubscriptionSpec, mergedPublicationSpec])

    return { publish }
}

useBaseComponent.propTypes = {
    name: PropTypes.string.isRequired, // Unique name of the component
    code: PropTypes.string.isRequired, // Short code identifier for the component
    mediator: PropTypes.object.isRequired, // Mediator instance for event communication
    description: PropTypes.string.isRequired, // Brief description of the component
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications
    extendedPublishSpec: PropTypes.object, // Extended publication specifications
    onInitialize: PropTypes.func, // Initialization callback
    onDestroy: PropTypes.func, // Cleanup callback
    customHandlers: PropTypes.objectOf(PropTypes.func), // Custom event handlers
}

export default useBaseComponent
