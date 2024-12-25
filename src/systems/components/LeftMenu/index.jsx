// src/mediatorComponents/LeftMenu.js

import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
    Drawer,
    IconButton,
    Tooltip,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
} from '@mui/material'
import PushPinIcon from '@mui/icons-material/PushPin'
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'

import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../BaseComponent/mergeSpec'
import { useMediator } from '../../contexts/MediatorContext' // Hook to access mediator via Context
import { useTheme } from '@mui/material/styles' // Hook to access MUI theme

/**
 * LeftMenu Functional Component
 *
 * Provides a persistent left-side navigation drawer.
 * The drawer can be expanded or collapsed and contains menu items for navigation and actions.
 *
 * Integrates with a mediator for event-driven communication, subscribing to system events
 * and publishing user-related events.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.name - The unique name of the LeftMenu component.
 * @param {string} props.code - A short code representing the LeftMenu component.
 * @param {string} props.description - A brief description of the LeftMenu component.
 * @param {Object} [props.extendedSubscriptionSpec={}] - Extended subscription specifications for additional events.
 * @param {Object} [props.extendedPublishSpec={}] - Extended publication specifications for additional events.
 * @param {boolean} props.isDrawerOpened - Indicates if the drawer is expanded.
 * @param {boolean} props.isDrawerPinned - Indicates if the drawer is pinned (DrawerPinned).
 * @param {Function} props.toggleDrawerPinned - Function to toggle the DrawerPinned state of the drawer.
 * @param {Array} props.menuItems - Array of menu items to display in the drawer.
 * @param {Function} props.handleMouseEnter - Function to handle mouse enter events on the drawer.
 * @param {Function} props.handleMouseLeave - Function to handle mouse leave events on the drawer.
 * @param {Function} props.onRefresh - Function to handle the refresh action.
 * @param {Function} props.onMenuItemClick - Function to handle menu item clicks.
 * @returns {JSX.Element} The rendered LeftMenu component.
 */
const LeftMenu = ({
    name,
    code,
    description,
    extendedSubscriptionSpec = {},
    extendedPublishSpec = {},
    isDrawerOpened,
    isDrawerPinned,
    toggleDrawerPinned,
    menuItems,
    handleMouseEnter,
    handleMouseLeave,
    onRefresh,
    onMenuItemClick,
}) => {
    const mediator = useMediator() // Access mediator via Context
    const theme = useTheme() // Access MUI theme for styling

    /**
     * Define subscription specifications.
     */
    const initialSubscriptionSpec = {
        subscriptions: [
            {
                channel: 'system',
                events: [
                    {
                        name: 'start',
                        description: 'Handles the application start event to initialize the UI.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)',
                        },
                    },
                    {
                        name: 'stop',
                        description: 'Handles the application stop event to perform cleanup.',
                        dataFormat: {
                            timestamp: 'string (ISO 8601 format)',
                        },
                    },
                ],
            },
            {
                channel: 'ui',
                events: [
                    {
                        name: 'windowSizeChange',
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
        ],
    }

    /**
     * Define publication specifications.
     */
    const initialPublicationSpec = {
        publications: [
            {
                channel: 'system',
                event: 'clickMenu',
                description: 'Handles user click events on menu items.',
                condition: 'User clicks a menu item',
                dataFormat: {
                    userId: 'integer',
                    menuId: 'string',
                    menuItemId: 'string',
                    menuItemName: 'string',
                },
                exampleData: {
                    userId: 123,
                    menuId: 'menu001',
                    menuItemId: 'itemA12',
                    menuItemName: 'productMenuItem',
                },
            },
            {
                channel: 'app',
                event: 'refresh',
                description: 'Handles user click refresh events.',
                condition: 'User clicks the refresh item',
                dataFormat: {
                    userId: 'integer',
                    contentId: 'string',
                },
                exampleData: {
                    userId: 123,
                    contentId: 'contentHome',
                },
            },
        ],
    }

    /**
     * Merge the subscription and publication specifications with any extended specs.
     */
    const mergedSubscriptionSpec = mergeSubscriptionSpecs(initialSubscriptionSpec, extendedSubscriptionSpec)
    const mergedPublicationSpec = mergePublicationSpecs(initialPublicationSpec, extendedPublishSpec)

    /**
     * Define custom event handlers specific to LeftMenu.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const eventHandlers = {
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'ui:windowSizeChange': handleWindowSizeChange,
    }

    /**
     * Handler for 'system:start' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStart(data) {
        console.log(`LeftMenu (${data.componentName}) received 'system:start' event with data:`, data.data)
        // Implement additional logic for handling the start event if needed
    }

    /**
     * Handler for 'system:stop' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`LeftMenu (${data.componentName}) received 'system:stop' event with data:`, data.data)
        // Implement additional logic for handling the stop event if needed
    }

    /**
     * Handler for 'ui:windowSizeChange' event.
     * Adjusts the drawer state based on the new window size.
     *
     * @param {Object} data - The data associated with the event.
     * @param {Object} data.windowSize - The new window dimensions.
     * @param {number} data.windowSize.width - The new window width.
     * @param {number} data.windowSize.height - The new window height.
     */
    function handleWindowSizeChange(data) {
        const { windowSize } = data.data
        const { width } = windowSize

        console.log(`LeftMenu (${data.componentName}) received 'ui:windowSizeChange' event with width: ${width}px`)

        const breakpoint = 600 // Example breakpoint in pixels

        if (width < breakpoint && isDrawerOpened) {
            // Collapse the drawer if window width is below breakpoint
            setDrawerState(false) // Assuming setDrawerState is available
        } else if (width >= breakpoint && !isDrawerOpened) {
            // Expand the drawer if window width is above breakpoint
            setDrawerState(true) // Assuming setDrawerState is available
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
        console.log(`LeftMenu: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2))
        if (typeof eventHandlers[handlerKey] === 'function') {
            eventHandlers[handlerKey]({ componentName, componentCode, channel, event, data, timestamp })
        } else {
            console.warn(`No handler implemented for event '${event}' on channel '${channel}' in LeftMenu.`)
        }
    }

    /**
     * Register the component with the mediator upon mounting and unregister upon unmounting.
     */
    useEffect(() => {
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
                console.log(`LeftMenu (${name}) initialized.`)
                // Additional initialization logic if needed
            },
            destroy: () => {
                console.log(`LeftMenu (${name}) destroyed.`)
                // Additional cleanup logic if needed
            },
        })

        // Cleanup function to unregister the component
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
                    console.log(`LeftMenu (${name}) initialized.`)
                },
                destroy: () => {
                    console.log(`LeftMenu (${name}) destroyed.`)
                },
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Empty dependency array ensures this runs once on mount and cleans up on unmount

    /**
     * Handles menu item clicks.
     * Publishes the 'clickMenu' event with relevant data.
     *
     * @param {string} key - The unique identifier of the clicked menu item.
     */
    const handleMenuItemClickInternal = (key) => {
        // Publish the 'clickMenu' event under the correct channel
        const userId = 1 // Example user ID, should be dynamic based on authenticated user
        const menuId = 'menu001' // Example menu ID
        const menuItem = menuItems.find((item) => item.key === key)
        const menuItemName = menuItem ? menuItem.text : key // Use text or key as name

        const eventData = {
            userId,
            menuId,
            menuItemId: key,
            menuItemName,
        }

        mediator.publish(name, code, 'system', 'clickMenu', eventData, Date.now()) // Corrected channel to "system"

        // Invoke the passed-in handler
        onMenuItemClick(key)
    }

    /**
     * Handles the refresh action.
     * Publishes the 'refresh' event with relevant data.
     */
    const handleRefresh = () => {
        const userId = 1 // Example user ID, should be dynamic based on authenticated user
        const contentId = 'contentHome' // Example content ID

        const eventData = {
            userId,
            contentId,
        }

        mediator.publish(name, code, 'app', 'refresh', eventData, Date.now()) // Publishing under "app" channel as per publicationSpec

        // Invoke the passed-in handler
        onRefresh()
    }
    /**
     * Manages the drawer's open state.
     * This function should be provided via props if the state is controlled by a parent component.
     * Otherwise, manage the state locally.
     * For demonstration, we'll assume it's controlled by a parent.
     */
    const setDrawerState = (state) => {
        // Implement this function based on your state management approach
        // Example: If controlled by parent, you might have a prop like setIsDrawerOpen
        // For now, let's assume it's managed locally
        // If managed locally, define it using useState
    }

    return (
        <Drawer
            variant="permanent" // Permanent drawer that is always visible
            open={isDrawerOpened} // Controls the open state of the drawer
            onMouseEnter={handleMouseEnter} // Handle mouse enter events
            onMouseLeave={handleMouseLeave} // Handle mouse leave events
            sx={{
                width: isDrawerOpened ? `${theme.drawerWidth.expanded}px` : `${theme.drawerWidth.collapsed}px`, // Set the width based on the open state
                flexShrink: 0, // Prevent the drawer from shrinking
                display: 'flex', // Use flex layout
                flexDirection: 'column', // Arrange children vertically
                '& .MuiDrawer-paper': {
                    width: isDrawerOpened ? `${theme.drawerWidth.expanded}px` : `${theme.drawerWidth.collapsed}px`,
                    boxSizing: 'border-box', // Include padding and border in the element's total width and height
                    transition: (theme) =>
                        theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }), // Smooth transition for width changes based on theme
                    backgroundColor: theme.palette.menu.menuBackground, // Use theme's menu background color
                    color: theme.palette.menu.menuText, // Use theme's menu text color
                    display: 'flex', // Use flex layout for the paper
                    flexDirection: 'column', // Arrange children vertically
                    justifyContent: 'space-between', // Distribute space between top and bottom sections
                    overflow: 'hidden', // Prevent content overflow
                },
            }}
        >
            {/* Top Section: Pin/Unpin and Menu Items */}
            <Box>
                {/* Pin/Unpin Button */}
                <Tooltip title={isDrawerPinned ? 'Unpin Drawer' : 'Pin Drawer'} placement="right">
                    <IconButton
                        onClick={toggleDrawerPinned} // Toggle the DrawerPinned state on click
                        sx={{
                            margin: '10px',
                            color: theme.palette.menu.iconColor, // Use theme's icon color
                        }}
                        aria-label={isDrawerPinned ? 'Unpin Drawer' : 'Pin Drawer'} // Accessibility label
                    >
                        {isDrawerPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}{' '}
                        {/* Render appropriate icon based on DrawerPinned state */}
                    </IconButton>
                </Tooltip>

                {/* Menu Items */}
                <List>
                    {menuItems.map((item) => (
                        <ListItem key={item.key} disablePadding>
                            <ListItemButton
                                onClick={() => handleMenuItemClickInternal(item.key)} // Pass the key to handler
                                sx={{
                                    minHeight: 48, // Minimum height for each menu item
                                    justifyContent: isDrawerOpened ? 'initial' : 'center', // Align text based on drawer state
                                    px: 2.5, // Horizontal padding
                                    color: theme.palette.menu.menuText, // Use theme's menu text color
                                    '&:hover': {
                                        backgroundColor: theme.palette.menu.menuHover, // Use theme's menu hover color
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0, // Remove minimum width
                                        mr: isDrawerOpened ? 3 : 'auto', // Add margin if drawer is open
                                        justifyContent: 'center', // Center the icon
                                        color: theme.palette.menu.iconColor, // Use theme's icon color
                                    }}
                                >
                                    {item.icon} {/* Render the icon */}
                                </ListItemIcon>
                                {isDrawerOpened && <ListItemText primary={item.text} />}{' '}
                                {/* Render text only if drawer is open */}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Bottom Section: Refresh Button */}
            <Box>
                <Divider sx={{ backgroundColor: theme.palette.divider.main }} />{' '}
                {/* Divider with theme's divider color */}
                <Tooltip title={!isDrawerOpened ? 'Refresh' : ''} placement="right">
                    <ListItemButton
                        onClick={handleRefresh} // Handle refresh action on click
                        sx={{
                            minHeight: 48, // Minimum height for the refresh button
                            justifyContent: isDrawerOpened ? 'initial' : 'center', // Align text based on drawer state
                            px: 2.5, // Horizontal padding
                            backgroundColor: theme.palette.secondary.main, // Use theme's secondary main color
                            '&:hover': {
                                backgroundColor: theme.palette.secondary.dark || theme.palette.action.hover, // Darker secondary or default hover color
                            },
                            color: theme.palette.secondary.contrastText, // Use theme's secondary contrast text color
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0, // Remove minimum width
                                mr: isDrawerOpened ? 3 : 'auto', // Add margin if drawer is open
                                justifyContent: 'center', // Center the icon
                                color: 'inherit', // Inherit color from parent
                            }}
                        >
                            <RefreshIcon /> {/* Refresh icon */}
                        </ListItemIcon>
                        {isDrawerOpened && <ListItemText primary="Refresh" />} {/* Render text only if drawer is open */}
                    </ListItemButton>
                </Tooltip>
            </Box>
        </Drawer>
    )
}

/**
 * Defines PropTypes for the LeftMenu functional component.
 * Ensures that the component receives the correct types of props.
 * This enhances type safety and aids in catching bugs during development.
 */
LeftMenu.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the LeftMenu instance
    code: PropTypes.string.isRequired, // The unique code identifier for the LeftMenu
    description: PropTypes.string.isRequired, // A brief description of the LeftMenu
    extendedPublishSpec: PropTypes.object, // Extended publish specifications for additional events
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications for additional events

    isDrawerOpened: PropTypes.bool.isRequired, // Boolean indicating if the drawer is expanded
    isDrawerPinned: PropTypes.bool.isRequired, // Boolean indicating if the drawer is pinned (DrawerPinned)
    toggleDrawerPinned: PropTypes.func.isRequired, // Function to toggle the DrawerPinned state of the drawer
    menuItems: PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string.isRequired, // Display text for the menu item
            icon: PropTypes.element.isRequired, // Icon component for the menu item
            key: PropTypes.string.isRequired, // Unique key identifier for the menu item
        })
    ).isRequired, // Array of menu items
    handleMouseEnter: PropTypes.func.isRequired, // Function to handle mouse enter events on the drawer
    handleMouseLeave: PropTypes.func.isRequired, // Function to handle mouse leave events on the drawer
    onRefresh: PropTypes.func.isRequired, // Function to handle the refresh action
    onMenuItemClick: PropTypes.func.isRequired, // Function to handle menu item clicks
}

export default React.memo(LeftMenu)
