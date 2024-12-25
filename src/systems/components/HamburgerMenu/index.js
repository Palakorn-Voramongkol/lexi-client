// src/components/HamburgerMenu.js

import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Typography,
    Box,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu' // Hamburger menu icon
import HomeIcon from '@mui/icons-material/Home' // Home page icon
import ExitToAppIcon from '@mui/icons-material/ExitToApp' // Logout icon
import AccountCircleIcon from '@mui/icons-material/AccountCircle' // User account icon
import SettingsIcon from '@mui/icons-material/Settings' // Settings icon
import LoginIcon from '@mui/icons-material/Login' // Login icon
import MailIcon from '@mui/icons-material/Mail'

import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../BaseComponent/mergeSpec' // Utility functions for merging specs
import { useMediator } from '../../contexts/MediatorContext' // Hook to access mediator via Context
import { useTheme } from '@mui/material/styles'

/**
 * HamburgerMenu Functional Component
 *
 * Provides a hamburger menu with dynamic menu items based on user authentication status.
 * Handles user interactions with the menu, such as navigating to different sections or performing authentication actions.
 *
 * Integrates with a mediator for event-driven communication, subscribing to system events
 * and publishing user-related events.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.name - The unique name of the HamburgerMenu component.
 * @param {string} props.code - A short code representing the HamburgerMenu component.
 * @param {string} props.description - A brief description of the HamburgerMenu component.
 * @param {Object} [props.extendedSubscriptionSpec={}] - Extended subscription specifications for additional events.
 * @param {Object} [props.extendedPublishSpec={}] - Extended publication specifications for additional events.
 * @param {boolean} props.isLoggedIn - Indicates if the user is logged in.
 * @param {Function} props.handleLoginLogout - Function to handle login/logout actions.
 * @param {Function} props.onMenuItemClick - Function to handle menu item clicks and update content.
 * @returns {JSX.Element} The rendered HamburgerMenu component.
 */
const HamburgerMenu = ({
    name,
    code,
    description,
    extendedSubscriptionSpec = {},
    extendedPublishSpec = {},
    isLoggedIn, // Boolean indicating if the user is logged in
    handleLoginLogout, // Function to handle login/logout actions
    onMenuItemClick, // Function to handle menu item clicks and update content
}) => {
    const mediator = useMediator() // Access mediator via Context
    const theme = useTheme() // Access MUI theme for styling

    // Local state for managing the menu's anchor element
    const [anchorEl, setAnchorEl] = useState(null)
    const open = Boolean(anchorEl)

    // Local state for managing the logout confirmation dialog
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

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
                channel: 'system', // Channel name for system-level publications
                event: 'clickMenu', // Event name indicating a menu item was clicked
                description: 'Handles user click events on menu items.',
                condition: 'User clicks a menu item',
                dataFormat: {
                    userId: 'integer', // ID of the user performing the action
                    menuId: 'string', // ID of the menu
                    menuItemId: 'string', // ID of the clicked menu item
                    menuItemName: 'string', // Name of the clicked menu item
                },
                exampleData: {
                    userId: 123,
                    menuId: 'menu001',
                    menuItemId: 'itemA12',
                    menuItemName: 'userAccount',
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
     * Define custom event handlers specific to HamburgerMenu.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const eventHandlers = {
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'ui:windowSizeChange': handleWindowSizeChange,
    }

    /**
     * Handler for the 'system:start' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStart(data) {
        try {
            console.log(`HamburgerMenu (${data.componentName}) received 'system:start' event with data:`, data.data)
            // Additional logic if needed
        } catch (error) {
            console.error(`Error handling 'system:start' event:`, error)
        }
    }

    /**
     * Handler for the 'system:stop' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        try {
            console.log(`HamburgerMenu (${data.componentName}) received 'system:stop' event with data:`, data.data)
            // Additional logic if needed
        } catch (error) {
            console.error(`Error handling 'system:stop' event:`, error)
        }
    }

    /**
     * Handler for the 'ui:windowSizeChange' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleWindowSizeChange(data) {
        try {
            console.log(`HamburgerMenu (${data.componentName}) received 'ui:windowSizeChange' event with data:`, data.data)
            // Additional logic if needed
        } catch (error) {
            console.error(`Error handling 'ui:windowSizeChange' event:`, error)
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
        console.log(`HamburgerMenu: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2))
        if (typeof eventHandlers[handlerKey] === 'function') {
            eventHandlers[handlerKey]({ componentName, componentCode, channel, event, data, timestamp })
        } else {
            console.warn(`No handler implemented for event '${event}' on channel '${channel}' in HamburgerMenu.`)
        }
    }

    /**
     * Register the component with the mediator upon mounting and unregister upon unmounting.
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
                console.log(`HamburgerMenu (${name}) initialized.`)
                // Additional initialization logic if needed
            },
            destroy: () => {
                console.log(`HamburgerMenu (${name}) destroyed.`)
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
                    console.log(`HamburgerMenu (${name}) initialized.`)
                },
                destroy: () => {
                    console.log(`HamburgerMenu (${name}) destroyed.`)
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
        const menuId = 'menu001' // Example menu ID
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
     * Opens the menu by setting the anchor element.
     *
     * @param {Object} event - The click event.
     */
    const handleMenuClickInternal = (event) => {
        setAnchorEl(event.currentTarget)
    }

    /**
     * Closes the menu by resetting the anchor element.
     */
    const handleMenuCloseInternal = () => {
        setAnchorEl(null)
    }

    /**
     * Opens the logout confirmation dialog.
     */
    const handleLogoutClick = () => {
        setAnchorEl(null)
        setLogoutDialogOpen(true)
    }

    /**
     * Closes the logout confirmation dialog.
     */
    const handleLogoutCancel = () => {
        setLogoutDialogOpen(false)
    }

    /**
     * Confirms the logout action.
     * Calls the provided handleLoginLogout function and publishes the logout event.
     */
    const handleLogoutConfirm = () => {
        setLogoutDialogOpen(false)
        handleLoginLogout() // Handle the actual logout action
        handleMenuItemClickInternal('logout') // Publish the logout event
    }

    /**
     * Define menu items as an array.
     * Each menu item includes a key, icon, text, and onClick handler.
     * The items vary based on the user's authentication status.
     */
    const menuItems = [
        {
            key: 'home',
            icon: <HomeIcon fontSize="small" />, // Icon representing the Home page
            text: 'Home', // Display text for the menu item
            onClick: () => handleMenuItemClickInternal('home'), // Handler for menu item click
        },
    ]

    if (isLoggedIn) {
        // If the user is logged in, add Account, Settings, and Logout options
        menuItems.push(
            {
                key: 'account',
                icon: <AccountCircleIcon fontSize="small" />, // Icon representing User Account
                text: 'Account',
                onClick: () => handleMenuItemClickInternal('account'),
            },
            {
                key: 'settings',
                icon: <SettingsIcon fontSize="small" />, // Icon representing Settings
                text: 'Settings', // Corrected to "Settings" instead of "Setting"
                onClick: () => handleMenuItemClickInternal('settings'),
            },
            {
                key: 'divider-logged-in',
                divider: true, // Divider to separate menu sections
            },
            {
                key: 'feedback',
                icon: <MailIcon fontSize="small" />, // Icon Mail
                text: 'Feedback', // Corrected to "Settings" instead of "Setting"
                onClick: () => handleMenuItemClickInternal('feedback'),
            },
            {
                key: 'divider-logged-in',
                divider: true, // Divider to separate menu sections
            },
            {
                key: 'logout',
                icon: <ExitToAppIcon fontSize="small" />, // Icon representing Logout
                text: 'Logout',
                onClick: handleLogoutClick, // Open the confirmation dialog instead of immediate logout
            }
        )
    } else {
        // If the user is not logged in, add Login option
        menuItems.push(
            {
                key: 'divider-logged-out',
                divider: true, // Divider to separate menu sections
            },
            {
                key: 'login',
                icon: <LoginIcon fontSize="small" />, // More appropriate icon for Login
                // Alternatively, use PersonAddIcon:
                // icon: <PersonAddIcon fontSize="small" />,
                text: 'Login',
                onClick: () => {
                    handleLoginLogout() // Handle login action
                    handleMenuItemClickInternal('login') // Publish the login event
                },
            }
        )
    }

    return (
        <>
            {/* Hamburger Menu Button */}
            <IconButton
                sx={{
                    backgroundColor: theme.palette.menu.menuBackground, // Use theme's menu background color
                    color: theme.palette.menu.iconColor, // Use theme's icon color
                    '&:hover': {
                        backgroundColor: theme.palette.menu.menuHover, // Use theme's menu hover color
                    },
                }}
                onClick={handleMenuClickInternal} // Open the menu on click
                aria-controls={open ? 'hamburger-menu' : undefined} // Accessibility attribute
                aria-haspopup="true" // Accessibility attribute indicating a popup menu
                aria-expanded={open ? 'true' : undefined} // Accessibility attribute indicating if the menu is expanded
            >
                <MenuIcon /> {/* Hamburger menu icon */}
            </IconButton>

            {/* Dropdown Menu */}
            <Menu
                id="hamburger-menu" // ID for the menu, used for accessibility
                anchorEl={anchorEl} // Anchor element where the menu is attached
                open={open} // Boolean indicating if the menu is open
                onClose={handleMenuCloseInternal} // Function to handle closing the menu
                PaperProps={{
                    sx: {
                        backgroundColor: theme.palette.menu.menuBackground, // Use theme's menu background color
                        color: theme.palette.menu.menuText, // Use theme's menu text color
                    },
                }} // Apply theme-based styles to the menu's paper
                anchorOrigin={{
                    vertical: 'bottom', // Vertical alignment of the menu relative to the anchor
                    horizontal: 'right', // Horizontal alignment of the menu relative to the anchor
                }}
                transformOrigin={{
                    vertical: 'top', // Vertical alignment of the menu's origin point
                    horizontal: 'right', // Horizontal alignment of the menu's origin point
                }}
            >
                {/* Iterate over menuItems to render MenuItem or Divider */}
                {menuItems.map((item) =>
                    item.divider ? (
                        <Divider key={item.key} sx={{ backgroundColor: theme.palette.divider.main }} /> // Render a Divider if the item has a 'divider' property
                    ) : (
                        <MenuItem
                            key={item.key}
                            onClick={item.onClick}
                            sx={{
                                '&:hover': {
                                    backgroundColor: theme.palette.menu.menuHover, // Use theme's menu hover color
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>{' '}
                            {/* Render the icon with inherited color */}
                            {item.text} {/* Render the display text */}
                        </MenuItem>
                    )
                )}
            </Menu>

            {/* Logout Confirmation Dialog */}
            <Dialog
                open={logoutDialogOpen} // Controls the visibility of the dialog
                onClose={handleLogoutCancel} // Function to handle closing the dialog
                aria-labelledby="logout-dialog-title" // Accessibility attribute
                aria-describedby="logout-dialog-description" // Accessibility attribute
                maxWidth="sm" // Set maximum width to small
                fullWidth // Make the dialog take the full width up to maxWidth
            >
                <Box sx={{ padding: 3, textAlign: 'center' }}>
                    <ExitToAppIcon color="error" sx={{ fontSize: 60 }} /> {/* Large Logout Icon */}
                    <DialogTitle id="logout-dialog-title" sx={{ mt: 2 }}>
                        <Typography variant="h5" component="div">
                            Confirm Logout
                        </Typography>{' '}
                        {/* Dialog title with enhanced typography */}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="logout-dialog-description" sx={{ mt: 1 }}>
                            <Typography variant="body1">
                                Are you sure you want to logout? You will need to login again to access your account.
                            </Typography>{' '}
                            {/* Enhanced confirmation message */}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
                        <Button
                            onClick={handleLogoutCancel}
                            color="primary"
                            variant="outlined"
                            sx={{ minWidth: '100px', mr: 2 }}
                        >
                            Cancel
                        </Button>{' '}
                        {/* Cancel button with consistent sizing */}
                        <Button
                            onClick={handleLogoutConfirm}
                            color="error"
                            variant="contained"
                            sx={{ minWidth: '100px' }}
                        >
                            Logout
                        </Button>{' '}
                        {/* Confirm logout button with prominent styling */}
                    </DialogActions>
                </Box>
            </Dialog>
        </>
    )
}

/**
 * Defines PropTypes for the HamburgerMenu functional component.
 * Ensures that the component receives the correct types of props.
 * This enhances type safety and aids in catching bugs during development.
 */
HamburgerMenu.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the HamburgerMenu instance
    code: PropTypes.string.isRequired, // The unique code identifier for the HamburgerMenu
    description: PropTypes.string.isRequired, // A brief description of the HamburgerMenu
    extendedPublishSpec: PropTypes.object, // Extended publish specifications for additional events
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications for additional events

    isLoggedIn: PropTypes.bool.isRequired, // Boolean indicating if the user is logged in
    handleLoginLogout: PropTypes.func.isRequired, // Function to handle login/logout actions
    onMenuItemClick: PropTypes.func.isRequired, // Function to handle menu item clicks and update content
}

export default React.memo(HamburgerMenu)
