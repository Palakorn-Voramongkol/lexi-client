// src/components/ProductContent.js

import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Typography, Box, Button, List, ListItem, ListItemText, Divider, Paper } from '@mui/material' // Added necessary Material-UI components
// import { useMediator } from '../../systems/contexts/MediatorContext' // Hook to access mediator via Context
import { useMediator } from '../../../systems/contexts/MediatorContext' 
import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../../../systems/components/BaseComponent/mergeSpec' // Utility functions to merge specs
import { useTheme } from '@mui/material/styles' // Hook to access MUI theme

/**
 * ProductListContent Functional Component
 *
 * Displays the products page content and integrates with the mediator for event-driven communication.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.name - The unique name of the ProductContent instance.
 * @param {string} props.code - The unique code identifier for the ProductContent.
 * @param {string} props.description - A brief description of the ProductContent.
 * @param {Object} [props.extendedSubscriptionSpec={}] - Extended subscription specifications for additional events.
 * @param {Object} [props.extendedPublishSpec={}] - Extended publication specifications for additional events.
 * @returns {JSX.Element} The rendered ProductContent component.
 */
const ProductListContent = ({ name, code, description, extendedSubscriptionSpec = {}, extendedPublishSpec = {} }) => {
    const mediator = useMediator() // Access mediator via Context
    const theme = useTheme() // Access MUI theme for styling

    // State to manage responsive layout
    const [isMobile, setIsMobile] = useState(false)

    // State to manage the list of products
    const [products, setProducts] = useState([])

    /**
     * Define initial subscription specifications.
     * ProductContent subscribes to 'product:addedProduct', 'product:removedProduct', and 'product:updatedProduct' events.
     */
    const initialSubscriptionSpec = {
        subscriptions: [
            {
                channel: 'system', // Channel name for system-level events
                events: [
                    {
                        name: 'start', // Event name indicating the start of the application
                        description: 'Handles the application start event to initialize the UI.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                        },
                    },
                    {
                        name: 'stop', // Event name indicating the stop of the application
                        description: 'Handles the application stop event to perform cleanup.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)', // Expected data format for the event
                        },
                    },
                ],
            },
            {
                channel: 'ui', // Channel name for UI-related events
                events: [
                    {
                        name: 'windowSizeChange', // Event name indicating a window size change
                        description: 'Handles the application window size change.',
                        dataFormat: {
                            windowSize: {
                                width: 'integer',
                                height: 'integer',
                            },
                        },
                    },
                ],
            },
            {
                channel: 'product', // Channel name for product-related events
                events: [
                    {
                        name: 'addedProduct', // Event name indicating a product was added
                        description: 'Handles events when a new product is added.',
                        dataFormat: {
                            productId: 'string',
                            productName: 'string',
                            addedBy: 'string',
                            timestamp: 'string (ISO 8601 format)',
                        },
                    },
                    {
                        name: 'removedProduct', // Event name indicating a product was removed
                        description: 'Handles events when a product is removed.',
                        dataFormat: {
                            productId: 'string',
                            removedBy: 'string',
                            timestamp: 'string (ISO 8601 format)',
                        },
                    },
                    {
                        name: 'updatedProduct', // Event name indicating a product was updated
                        description: 'Handles events when a product is updated.',
                        dataFormat: {
                            productId: 'string',
                            updatedBy: 'string',
                            timestamp: 'string (ISO 8601 format)',
                        },
                    },
                ],
            },
        ],
    }

    /**
     * Define publication specifications.
     * ProductContent publishes an event when a new product is created.
     */
    const publicationSpec = {
        publications: [
            {
                channel: 'product', // Channel name for product-related events
                event: 'created', // Event name indicating a product was created
                description: 'Publishes an event when a new product is created.',
                condition: 'When a new product is successfully created.',
                dataFormat: {
                    productId: 'string',
                    productName: 'string',
                    createdBy: 'string',
                    timestamp: 'string (ISO 8601 format)',
                },
                exampleData: {
                    productId: 'prod-12345',
                    productName: 'New Product',
                    createdBy: 'adminUser',
                    timestamp: '2024-05-01T12:00:00Z',
                },
            },
        ],
    }

    /**
     * Merge the subscription and publication specifications with any extended specs.
     */
    const mergedSubscriptionSpec = mergeSubscriptionSpecs(initialSubscriptionSpec, extendedSubscriptionSpec)
    const mergedPublicationSpec = mergePublicationSpecs(publicationSpec, extendedPublishSpec)

    /**
     * Define custom event handlers specific to ProductContent.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const eventHandlers = {
        'product:addedProduct': handleProductAdded,
        'product:removedProduct': handleProductRemoved,
        'product:updatedProduct': handleProductUpdated,
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'ui:windowSizeChange': handleWindowSizeChange,
    }

    /**
     * Handler for 'product:addedProduct' event.
     * Adds the new product to the local products list.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleProductAdded(data) {
        console.log(`ProductContent (${data.accountName}) received 'product:addedProduct' event with data:`, data.data)
        setProducts((prevProducts) => [...prevProducts, data.data])
    }

    /**
     * Handler for 'product:removedProduct' event.
     * Removes the product from the local products list.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleProductRemoved(data) {
        console.log(`ProductContent (${data.accountName}) received 'product:removedProduct' event with data:`, data.data)
        setProducts((prevProducts) => prevProducts.filter((product) => product.productId !== data.data.productId))
    }

    /**
     * Handler for 'product:updatedProduct' event.
     * Updates the product details in the local products list.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleProductUpdated(data) {
        console.log(`ProductContent (${data.accountName}) received 'product:updatedProduct' event with data:`, data.data)
        setProducts((prevProducts) =>
            prevProducts.map((product) =>
                product.productId === data.data.productId ? { ...product, ...data.data } : product
            )
        )
    }

    /**
     * Handler for 'system:start' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStart(data) {
        console.log(`ProductContent (${data.accountName}) received 'system:start' event with data:`, data.data)
        // Implement additional logic for handling the start event if needed
        // For example, initialize certain settings or fetch initial data
    }

    /**
     * Handler for 'system:stop' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`ProductContent (${data.accountName}) received 'system:stop' event with data:`, data.data)
        // Implement additional logic for handling the stop event if needed
        // For example, perform cleanup or save state
    }

    /**
     * Handler for 'ui:windowSizeChange' event.
     * Adjusts the component's layout based on the new window size.
     *
     * @param {Object} data - The data associated with the event.
     * @param {Object} data.windowSize - The new window dimensions.
     * @param {number} data.windowSize.width - The new window width.
     * @param {number} data.windowSize.height - The new window height.
     */
    function handleWindowSizeChange(data) {
        const { windowSize } = data.data
        const { width } = windowSize

        console.log(`ProductContent (${data.accountName}) received 'ui:windowSizeChange' event with width: ${width}px`)

        const breakpoint = 600 // Example breakpoint in pixels

        if (width < breakpoint && !isMobile) {
            setIsMobile(true) // Switch to mobile layout
        } else if (width >= breakpoint && isMobile) {
            setIsMobile(false) // Switch back to desktop layout
        }
    }

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
        console.log(`ProductContent: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2))
        if (typeof eventHandlers[handlerKey] === 'function') {
            eventHandlers[handlerKey]({ componentName, componentCode, channel, event, data, timestamp })
        } else {
            console.warn(`No handler implemented for event '${event}' on channel '${channel}' in ProductContent.`)
        }
    }

    /**
     * Registers event handlers with the mediator upon component mount.
     * Also performs any initialization logic, such as fetching initial data.
     * Cleans up event handlers upon component unmount.
     */
    useEffect(() => {
        // Register the component with the mediator
        mediator.register({
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
                console.log(`ProductContent (${name}) initialized.`)
                // Perform any additional initialization logic here
                // Example: Fetch initial product list or subscribe to additional events
            },
            destroy: () => {
                console.log(`ProductContent (${name}) destroyed.`)
                // Perform any necessary cleanup here
            },
        })

        // Cleanup function to unregister the component when it unmounts
        return () => {
            mediator.unregister({
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
                    console.log(`ProductContent (${name}) initialized.`)
                },
                destroy: () => {
                    console.log(`ProductContent (${name}) destroyed.`)
                },
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Empty dependency array ensures this runs once on mount and cleans up on unmount

    /**
     * Example function to publish a 'product:created' event.
     * This can be triggered based on specific actions within the component.
     */
    const triggerProductCreation = () => {
        const newProduct = {
            productId: 'prod-67890',
            productName: 'Awesome Gadget',
            createdBy: 'productAdmin',
            timestamp: new Date().toISOString(),
        }
        mediator.publish(name, code, 'product', 'created', newProduct, Date.now())
        console.log(`ProductContent (${name}) published 'product:created' event with data:`, newProduct)
    }

    /**
     * Determines the typography variant based on the current layout (mobile or desktop).
     *
     * @returns {string} The typography variant.
     */
    const getTypographyVariant = () => (isMobile ? 'h6' : 'h4')

    return (
        <Box
            sx={{
                padding: isMobile ? 2 : 4, // Adjust padding based on layout
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '80vh', // Ensure the content takes up sufficient vertical space
                backgroundColor: theme.palette.background.default, // Use theme's default background color
            }}
        >
            <Typography variant={getTypographyVariant()} gutterBottom>
                Products
            </Typography>
            <Typography variant="body1" align="center" sx={{ maxWidth: 600 }}>
                Welcome to the Products page! Here you can view, add, remove, and update products in your inventory.
            </Typography>
            {/* Example button to trigger a product creation event */}
            <Button
                variant="contained"
                color="primary"
                onClick={triggerProductCreation}
                sx={{ marginTop: 2 }}
                aria-label="Create New Product"
            >
                Create New Product
            </Button>
            {/* Displaying the list of products */}
            <Box sx={{ mt: 4, width: '100%', maxWidth: 600 }}>
                <Typography variant="h6" gutterBottom>
                    Product List
                </Typography>
                <Paper elevation={3}>
                    <List>
                        {products.length === 0 ? (
                            <ListItem>
                                <ListItemText primary="No products available." />
                            </ListItem>
                        ) : (
                            products.map((product) => (
                                <React.Fragment key={product.productId}>
                                    <ListItem>
                                        <ListItemText
                                            primary={product.productName}
                                            secondary={`ID: ${product.productId} | Added by: ${
                                                product.addedBy
                                            } | Timestamp: ${new Date(product.timestamp).toLocaleString()}`}
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </React.Fragment>
                            ))
                        )}
                    </List>
                </Paper>
            </Box>
        </Box>       
    )
}

/**
 * Define PropTypes for type checking.
 */
ProductListContent.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the ProductContent instance
    code: PropTypes.string.isRequired, // The unique code identifier for the ProductContent
    description: PropTypes.string.isRequired, // A brief description of the ProductContent
    extendedPublishSpec: PropTypes.object, // Extended publication specifications for additional events
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications for additional events
}

export default React.memo(ProductListContent)
