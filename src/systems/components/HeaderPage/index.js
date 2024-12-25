// src/components/HeaderPage.js

import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
    Box,
    IconButton,
    ListItemIcon,
    Divider,
    List,
    ListItem,
    ListItemText,
    Drawer,
    Tooltip,
    Collapse,
} from '@mui/material'
import BuildIcon from '@mui/icons-material/PostAdd';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'; // For lists of people/customers
import PersonIcon from '@mui/icons-material/Person'; // For individual details
import StorefrontIcon from '@mui/icons-material/Storefront'; // For lists of vendors or shops
import StoreIcon from '@mui/icons-material/Store'; // For individual vendor details
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import TableChartIcon from '@mui/icons-material/TableChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import SplitscreenIcon from '@mui/icons-material/Splitscreen';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import CategoryIcon from '@mui/icons-material/Category';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GavelIcon from '@mui/icons-material/Gavel';
import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../BaseComponent/mergeSpec'; // Utility functions for merging specs
import { useMediator } from '../../contexts/MediatorContext'; // Hook to access mediator via Context
import { useTheme } from '@mui/material/styles';
import TaxMenu from './TaxMenu';
import LawMenu from './LawMenu';
import HomeMenu from './HomeMenu';

/**
 * HeaderPage Functional Component
 *
 * Displays the TopNavbar along with the page title.
 * Integrates with a mediator for event-driven communication, subscribing to system events
 * and potentially publishing user-related events.
 *
 * @param {Object} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered HeaderPage component.
 */
const HeaderPage = ({
    name,
    code,
    description,
    extendedSubscriptionSpec = {},
    extendedPublishSpec = {},
    height,
    isDrawerOpened,
    isDrawerPinned,
    toggleDrawerPinned,
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
    const subscriptionSpec = {
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
                channel: 'ui', // Channel name for UI-level events
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
        ],
    }

    /**
     * Define publication specifications.
     */
    const publicationSpec = {
        publications: [
            {
                channel: 'user', // Channel name for user-related publications
                event: 'accountUpdate', // Event name indicating an account update
                description: 'Publishes account update events when user interacts with the account icon.',
                condition: 'User clicks the account icon',
                dataFormat: {
                    userId: 'integer', // ID of the user performing the action
                    action: 'string', // Action performed by the user (e.g., 'view', 'edit')
                    timestamp: 'string (ISO 8601 format)', // Timestamp of the action
                },
                exampleData: {
                    userId: 1234,
                    action: 'view',
                    timestamp: '2024-05-01T14:30:00Z',
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
     * Define custom event handlers specific to HeaderPage.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const customHandlers = {
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'ui:windowSizeChange': handleWindowSizeChange, // Newly added handler
    }

    /**
     * Handler for 'system:start' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStart(data) {
        console.log(`HeaderPage (${name}) received 'system:start' event with data:`, data.data)
        // Implement additional logic for handling the start event if needed
    }

    /**
     * Handler for 'system:stop' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`HeaderPage (${name}) received 'system:stop' event with data:`, data.data)
        // Implement additional logic for handling the stop event if needed
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
     * Toggles the drawer open/close state.
     *
     * @param {boolean} open - Whether to open or close the drawer.
     * @returns {function} - Event handler function.
     */
    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return
        }
        toggleDrawerPinned()
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
                        `Handler for event '${eventName}' on channel '${channel}' is not implemented in HeaderPage.`
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
            console.log(`HeaderPage: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2))
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
                console.warn(`No handler implemented for event '${event}' on channel '${channel}' in HeaderPage.`)
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
                console.log(`HeaderPage (${name}) initialized.`)
                // Additional initialization logic if needed
            },
            destroy: () => {
                console.log(`HeaderPage (${name}) destroyed.`)
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
                    console.log(`HeaderPage (${name}) initialized.`)
                },
                destroy: () => {
                    console.log(`HeaderPage (${name}) destroyed.`)
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
        handleMenuCloseInternal() // Close the menu after handling the click
        onMenuItemClick(key) // Notify the parent component to change the main content

        // Publish the 'clickMenu' event
        const userId = 1 // Example user ID, should be dynamic based on authenticated user
        const menuId = `menu-${key}` // Example menu ID
        const menuItem = menuItems.find((item) => item.key === key)
        const menuItemName = menuItem ? menuItem.text : key // Use text or key as name

        const eventData = {
            userId,
            menuId,
            menuItemId: key,
            menuItemName,
        }

        mediator.publish(name, code, 'system', 'clickMenu', eventData, Date.now())
    }

    /**
     * Closes the menu by resetting the anchor element.
     */
    const handleMenuCloseInternal = () => {
        // Implement if there's a specific menu to close
    }
    const [openMenus, setOpenMenus] = React.useState({})

    const handleToggleMenu = (key) => {
        setOpenMenus((prev) => ({
            ...prev,
            [key]: !prev[key],
        }))
    }

    /**
     * Define the list of menu items with submenus.
     */

    const menuItems = [
        {
            key: 'pages',
            text: 'Pages',
            icon: <BuildIcon />,
            submenu: [
                { key: 'single-column', text: 'Single Column', icon: <ViewColumnIcon /> },
                { key: 'two-column', text: 'Two Column', icon: <ViewAgendaIcon /> },
                { key: 'three-column', text: 'Three Column', icon: <TableChartIcon /> },
                { key: 'dashboard', text: 'Dashboard', icon: <DashboardIcon /> },
                { key: 'grid', text: 'Grid', icon: <GridViewIcon /> },
                { key: 'sidebar', text: 'Sidebar', icon: <ViewSidebarIcon /> },
                { key: 'hero', text: 'Hero', icon: <FeaturedPlayListIcon /> },
                { key: 'card-based', text: 'Card-Based', icon: <ViewQuiltIcon /> },
                { key: 'split-screen', text: 'Split Screen', icon: <SplitscreenIcon /> },
            ],
        },
        {
            key: 'components',
            text: 'Components',
            icon: <SettingsApplicationsIcon />,
            submenu: [
                { key: 'customerList', text: 'Customer List', icon: <PeopleAltIcon /> }, // Represents a list of people/customers
                { key: 'customerDetail', text: 'Customer Detail', icon: <PersonIcon /> }, // Represents individual customer details
                { key: 'vendorList', text: 'Vendor List', icon: <StorefrontIcon /> }, // Represents a list of vendors or shops
                { key: 'vendorDetail', text: 'Vendor Detail', icon: <StoreIcon /> }, // Represents individual vendor details
            ],
            
        },
        {
            key: 'dataServices',
            text: 'Data Services',
            icon: <SyncAltIcon />,
            submenu: [
                { key: 'customer', text: 'Customer', icon: <PersonIcon /> }, // Matches a person/customer
                { key: 'vendor', text: 'Vendor', icon: <StoreIcon /> }, // Matches a vendor/store
                { key: 'product', text: 'Product', icon: <CategoryIcon /> }, // Matches product/categories
                { key: 'issue', text: 'Issue', icon: <ErrorOutlineIcon /> }, // Matches issue/problems
                { key: 'tax', text: 'Tax', icon: <AccountBalanceIcon /> }, // Matches tax/government
                { key: 'law', text: 'Law', icon: <GavelIcon /> }, // Matches law/legal
            ],
        },
    ]

    /**
     * Function to render the list inside the drawer.
     *
     * @returns {JSX.Element} The list component.
     */
    const list = () => (
        <Box
            sx={{
                width: theme.drawerWidth.expanded,
                height: '100%',
                position: 'relative', // Ensure positioning works for the pin icon
            }}
            role="presentation"
            // Remove onClick to prevent closing the drawer when interacting inside
            onKeyDown={toggleDrawer(false)}
        >
            {/* Pin/Unpin Icon Button */}
            <Tooltip title={isDrawerPinned ? 'Unpin Drawer' : 'Pin Drawer'} placement="right">
                <IconButton
                    onClick={(event) => {
                        event.stopPropagation() // Prevent drawer close
                        toggleDrawerPinned()
                    }}
                    aria-label={isDrawerPinned ? 'Unpin drawer' : 'Pin drawer'}
                    sx={{
                        position: 'absolute', // Top-right corner

                        right: theme.spacing(2),
                        color: theme.palette.menu.iconColor, // Match menu item icon color
                        backgroundColor: 'transparent', // No background
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        },
                    }}
                >
                    {isDrawerPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                </IconButton>
            </Tooltip>
            {/* Menu Items Positioned Below the Pin Button */}
            <Box sx={{ mt: 5 }}>
                <List>
                    {menuItems.map((item) => (
                        <React.Fragment key={item.key}>
                            {/* Main Menu Item */}
                            <ListItem button onClick={() => handleToggleMenu(item.key)}>
                                <ListItemIcon sx={{ color: theme.palette.menu.iconColor }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} sx={{ color: theme.palette.menu.menuText }} />
                                {item.submenu && (openMenus[item.key] ? <ExpandLess /> : <ExpandMore />)}
                            </ListItem>

                            {/* Submenu Items */}
                            {item.submenu && (
                                <Collapse in={openMenus[item.key]} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {item.submenu.map((subItem) => (
                                            <ListItem
                                                button
                                                key={subItem.key}
                                                onClick={() => handleMenuItemClickInternal(subItem.key)}
                                                sx={{
                                                    pl: 4, // Padding to visually indicate nesting
                                                    backgroundColor: theme.palette.menu.submenuBackground, // Lighter background
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.menu.submenuHoverBackground,
                                                    },
                                                    '& .MuiListItemIcon-root': {
                                                        color: theme.palette.menu.submenuIconColor,
                                                    },
                                                    '& .MuiTypography-root': {
                                                        color: theme.palette.menu.submenuText,
                                                    },
                                                }}
                                            >
                                                <ListItemIcon>{subItem.icon}</ListItemIcon>
                                                <ListItemText primary={subItem.text} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            )}
                        </React.Fragment>
                    ))}
                    <Divider />
                </List>
            </Box>
        </Box>
    )

    /**
     * Render the HeaderPage component.
     * The component includes the TopNavbar and the page title.
     */
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row', // Ensures horizontal alignment
                height: `${height}`,
                backgroundColor: theme.palette.primary,
            }}
        >
            <Box sx={{ display: 'flex', height: '100vh' }}>
                {/* Drawer Toggle Button (Visible only when not pinned) */}
                {!isDrawerPinned && (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer(true)}
                        sx={{
                            position: 'fixed', // Fixed position
                            left: theme.spacing(0.1),
                            zIndex: theme.zIndex.drawer + 1, // Ensure it's above the Drawer
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            '&:hover': {
                                backgroundColor: theme.palette.primary.dark,
                            },
                        }}
                    >
                        <FormatIndentIncreaseIcon />
                    </IconButton>
                )}

                {/* Drawer Component for the Side Menu */}
                <Drawer
                    anchor="left"
                    open={isDrawerOpened || isDrawerPinned} // Keeps the drawer open if pinned
                    onClose={toggleDrawer(false)}
                    variant={isDrawerPinned ? 'permanent' : 'temporary'} // Use 'permanent' when pinned
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: theme.drawerWidth.expanded, // Drawer width
                            backgroundColor: theme.palette.menu.menuBackground, // Ensure background color
                            color: theme.palette.menu.menuText, // Ensure text color
                            overflowX: 'hidden', // Prevent horizontal overflow
                            transition: theme.transitions.create(['width'], {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        },
                    }}
                >
                    {list()}
                </Drawer>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row', // Ensures horizontal alignment
                    justifyContent: 'flex-start', // Aligns items to the left
                    alignItems: 'center', // Vertically centers the items
                    gap: theme.spacing(1), // Spacing between items
                    height: 'auto', // Adjusts height based on content
                    width: '100%', // Ensures the Box takes full width of its container
                    marginLeft: isDrawerOpened || isDrawerPinned ? 0 : 3,
                }}
            >
                {/* Home Menu */}
                <HomeMenu onMenuItemClick={handleMenuItemClickInternal} />

                {/* Tax Menu */}
                <TaxMenu onMenuItemClick={handleMenuItemClickInternal} />

                {/* Law Menu */}
                <LawMenu onMenuItemClick={handleMenuItemClickInternal} />
            </Box>
        </Box>
    )
}

/**
 * Define PropTypes for type checking.
 * Ensures that the component receives the correct types of props.
 */
HeaderPage.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the HeaderPage instance
    code: PropTypes.string.isRequired, // The unique code identifier for the HeaderPage
    description: PropTypes.string.isRequired, // A brief description of the HeaderPage
    extendedPublishSpec: PropTypes.object, // Extended publish specifications for additional events
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications for additional events
    height: PropTypes.number, // Hight of the menu bar
    pageTitle: PropTypes.string.isRequired, // Title of the current page
    onMenuItemClick: PropTypes.func.isRequired, // Function for menu item click actions
    isDrawerOpened: PropTypes.bool.isRequired, // Boolean indicating if the drawer is expanded
    isDrawerPinned: PropTypes.bool.isRequired, // Boolean indicating if the drawer is pinned (DrawerPinned)
    toggleDrawerPinned: PropTypes.func.isRequired, // Function to toggle the DrawerPinned state of the drawer
    handleMouseEnter: PropTypes.func.isRequired, // Function to handle mouse enter events on the drawer
    handleMouseLeave: PropTypes.func.isRequired, // Function to handle mouse leave events on the drawer
    onRefresh: PropTypes.func.isRequired, // Function to handle the refresh action
}

/**
 * Wraps the HeaderPage component with React.memo to prevent unnecessary re-renders.
 * This optimization enhances performance, especially when the component receives stable props.
 */
export default React.memo(HeaderPage)
