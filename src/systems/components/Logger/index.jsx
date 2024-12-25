// src/components/Logger.js

// Importing necessary libraries and utilities
import PropTypes from 'prop-types'; // For type checking of component props
import BaseComponent from "../BaseComponent"; // Base class providing foundational functionalities
import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../../../components/BaseComponent/mergeSpec'; // Utility functions to merge subscription and publication specifications

/**
 * Logger Class
 * 
 * Extends the BaseComponent to handle logging for specific application events.
 * Listens to 'start', 'stop', and 'log' events on designated channels and logs relevant information.
 * 
 * This component does not publish any events but solely focuses on subscribing to and handling events.
 * 
 * @extends BaseComponent
 */
class Logger extends BaseComponent {
    /**
     * Creates an instance of Logger.
     * 
     * @param {Object} props - The properties passed to the component.
     * @param {string} props.name - The unique name of the Logger component.
     * @param {string} props.code - A short code representing the Logger component.
     * @param {Object} [props.mediator] - An optional mediator component for event communication.
     * @param {string} props.description - A brief description of the Logger component.
     * @param {Object} props.extendedSubscriptionSpec - The extended subscription specification.
     * @param {Object} props.extendedPublishSpec - The extended publish specification contributed by the component.
     * 
     * @throws {Error} Throws an error if attempting to instantiate BaseComponent directly.
     */
    constructor({ name, code, mediator, description, extendedSubscriptionSpec, extendedPublishSpec }) {

        /**
         * 1. Define the subscription specifications.
         * These specifications outline the events that the Logger component subscribes to for handling.
         * 
         * Structure:
         * {
         *   subscriptions: [
         *     {
         *       channel: "channelName",
         *       events: [
         *         {
         *           name: "eventName",
         *           description: "Description of the event.",
         *           dataFormat: { // data structure  }
         *         },
         *         // More events...
         *       ]
         *     },
         *     // More channels...
         *   ]
         * }
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
                        },
                        {
                            name: "log", // Event name for system-level logging
                            description: "Handles the system logging request.",
                            dataFormat: {
                                "timestamp": "string (ISO 8601 format)", // Timestamp of the log event
                                "content": "string" // Content of the log message
                            }
                        }
                    ]
                },
                {
                    channel: "app", // Channel name for application-level events
                    events: [
                        {
                            name: "log", // Event name for application-level logging
                            description: "Handles the application logging request.",
                            dataFormat: {
                                "timestamp": "string (ISO 8601 format)", // Timestamp of the log event
                                "content": "string" // Content of the log message
                            }
                        }
                    ]
                }
            ]
        };

        /**
         * 2. Define the publication specifications.
         * Logger does not publish any events by default, so this remains empty.
         * However, it can be extended by child components if needed.
         * 
         * Structure:
         * {
         *   publications: [
         *     {
         *       channel: "channelName",
         *       event: "eventName",
         *       description: "Description of the event.",
         *       condition: "Condition for publishing the event.",
         *       dataFormat: { // data structure  },
         *       exampleData: { // example data  },
         *     },
         *     // More events...
         *   ]
         * }
         */
        const publicationSpec = {
            publications: [
                // Logger does not publish any events by default
            ]
        };

        /**
         * 3. Merge the subscription and publication specifications.
         * This allows for dynamic addition or modification of specs by other components.
         */
        extendedSubscriptionSpec = mergeSubscriptionSpecs(subscriptionSpec, extendedSubscriptionSpec);
        extendedPublishSpec = mergePublicationSpecs(publicationSpec, extendedPublishSpec);

        /**
         * Call the parent constructor with the merged specifications.
         * This initializes the BaseComponent with the appropriate event subscriptions.
         */
        super({ name, code, mediator, description, extendedSubscriptionSpec, extendedPublishSpec });
    }

    /**
 * Initializes the component.
 * This method is intended to be overridden by subclasses to include component-specific initialization logic, such as setting up event listeners, timers, or fetching initial data.
 */
    initialize() {
        // Component-specific initialization logic goes here.
        // For example:
        // this.timer = setInterval(this.updateData, 1000);
        // Call base class initialize
        super.initialize();
    }

    /**
     * Cleans up the component before it is unmounted.
     * This method is intended to be overridden by subclasses to include component-specific cleanup logic, such as removing event listeners, clearing timers, or canceling network requests.
     */
    destroy() {
        // Component-specific cleanup logic goes here.
        // For example:
        // clearInterval(this.timer);
        // Call base class destroy
        super.destroy()
    }

    /**
     * Handler for the 'system:start' event.
     * 
     * @param {Object} data - The data associated with the event.
     * @param {string} data.timestamp - The timestamp when the event was triggered.
     */
    handleSubscription_System_Start(data) {
        console.log(`Logger (${this.name}) - Event 'start' occurred on 'system' with data:`, data);
        // Additional logic for handling the start event can be added here
    }

    /**
     * Handler for the 'system:stop' event.
     * 
     * @param {Object} data - The data associated with the event.
     * @param {string} data.timestamp - The timestamp when the event was triggered.
     */
    handleSubscription_System_Stop(data) {
        console.log(`Logger (${this.name}) - Event 'stop' occurred on 'system' with data:`, data);
        // Additional logic for handling the stop event can be added here
    }

    /**
     * Handler for the 'system:log' event.
     * 
     * @param {Object} data - The data associated with the event.
     * @param {string} data.timestamp - The timestamp when the log event was triggered.
     * @param {string} data.content - The content of the log message.
     */
    handleSubscription_System_Log(data) {
        console.log(`Logger (${this.name}) - System Log: [${data.timestamp}] ${data.content}`);
        // Additional logic for handling system logs can be added here
    }

    /**
     * Handler for the 'app:log' event.
     * 
     * @param {Object} data - The data associated with the event.
     * @param {string} data.timestamp - The timestamp when the log event was triggered.
     * @param {string} data.content - The content of the log message.
     */
    handleSubscription_App_Log(data) {
        console.log(`Logger (${this.name}) - Application Log: [${data.timestamp}] ${data.content}`);
        // Additional logic for handling application logs can be added here
    }
}

/**
 * Defines PropTypes for the Logger class.
 * Ensures that the component receives the correct types of props.
 * This enhances type safety and aids in catching bugs during development.
 */
Logger.propTypes = function (props) {
    PropTypes.checkPropTypes(Logger.propTypesDefinitions, props, 'parameter', 'Logger');
};

/**
 * Define the expected prop types for the Logger component.
 * Each prop is documented with comments to describe its purpose.
 */
Logger.propTypesDefinitions = {
    name: PropTypes.string.isRequired,                  // The unique name of the Logger instance
    code: PropTypes.string.isRequired,                  // The unique code identifier for the Logger
    mediator: PropTypes.object,                         // The mediator instance to register with
    description: PropTypes.string.isRequired,           // A brief description of the Logger
    extendedPublishSpec: PropTypes.object,               // Extended publish specifications for additional events
    extendedSubscriptionSpec: PropTypes.object,          // Extended subscription specifications for additional events
};

/**
 * Export the Logger class for use in other parts of the application.
 */
export default Logger;
