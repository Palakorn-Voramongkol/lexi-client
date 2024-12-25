// src/components/MainPage.js

import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Tabs,
    Tab,
} from '@mui/material';
import { Resizable } from 're-resizable';

import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';

import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../../components/BaseComponent/mergeSpec'; // Utility functions
import { useMediator } from '../../contexts/MediatorContext'; // Custom hook to access mediator
import { useTheme } from '@mui/material/styles'
import useWindowSize from '../../hooks/useWindowSize'; // Adjust the path as necessary

import DashboardContent from '../../contents/DashboardContent'; // Example content component
import HomeContent from '../../../app/contents/HomeContent/index';
import ProductListContent from '../../../app/contents/ProductListContent/index';
import AccountContent from '../../contents/AccountContent';
import SettingsContent from '../../contents/SettingsContent';
import FeedbackContent from '../../contents/FeedbackContent';


import AccountIconComponent from '../../components/AccountIcon';
import HamburgerMenu from '../../components/HamburgerMenu';
import LoginDialog from '../../components/LoginDialog';
import HeaderPage from '../../components/HeaderPage';
import ComponentRegistry from '../../components/ComponentRegistry';
import ComponentPubSubStatus from '../../components/ComponentPubSubStatus';
import getHandleSubscriptionName from '../../components/BaseComponent/subScriptionHandle'; // Path to the updated function
import NotificationIcon from '../../components/NotificationIcon';

import AuthenService from '../../services/AuthenService';
import RoleService from '../../services/RoleService';
import PermissionService from '../../services/PermissionService';
import UserService from '../../services/UserService';
import UiitemService from '../../services/UiitemService';
import UipermissionService from '../../services/UipermissionService';

/**
 * MainPage Functional Component
 * 
 * Represents the main page of the application. Integrates with the mediator
 * to handle event-driven communication by subscribing to and publishing specific events.
 * 
 * @param {Object} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered MainPage component.
 */
const MainPage = ({
    name,
    code,
    description,
    pageTitle,
    extendedSubscriptionSpec = {},
    extendedPublishSpec = {},
}) => {
    const mediator = useMediator(); // Access mediator via Context
    const theme = useTheme();
    const timerRef = useRef(null);
    const windowSize = useWindowSize(); // Utilize the custom hook to get window dimensions


    const [state, setState] = useState({
        anchorEl: null,
        isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
        isDrawerOpen: localStorage.getItem('isDrawerPinned') !== null ? JSON.parse(localStorage.getItem('isDrawerPinned')) : true,
        isDrawerPinned: localStorage.getItem('isDrawerPinned') !== null ? JSON.parse(localStorage.getItem('isDrawerPinned')) : true,
        isMouseOverDrawer: false,
        footerHeight: 50,
        openLoginDialog: false,
        openUserProfile: false,
        showLogger: true,
        selectedTab: 0,
        selectedContent: <HomeContent id="homeContent" name="Home" code="homeContent" description='The home page of the main application' />,
        isInitialized: false, // New state to track initialization
    });

    /**
     * Define subscription specifications.
     */
    const subscriptionSpec = {
        subscriptions: [
            {
                channel: "system",
                events: [
                    {
                        name: "start",
                        description: "Handles the application start event to initialize the UI.",
                        dataFormat: {
                            timestamp: "string (ISO 8601 format)", // Example: "2024-11-18T10:00:00Z"
                        },
                    },
                    {
                        name: "stop",
                        description: "Handles the application stop event to clean up the UI.",
                        dataFormat: {
                            timestamp: "string (ISO 8601 format)", // Example: "2024-11-18T18:00:00Z"
                        },
                    },
                ],
            },
        ],
    };

    /**
     * Define publication specifications.
     */
    const publicationSpec = {
        publications: [
            {
                channel: "system",
                event: "start",
                description: "Triggered when the application starts.",
                condition: "When the application initialization is complete.",
                dataFormat: {
                    timestamp: "string (ISO 8601 format)", // Example: "2024-11-18T10:00:00Z"
                },
                exampleData: {
                    timestamp: "2024-11-18T10:00:00Z",
                },
            },
            {
                channel: "system",
                event: "stop",
                description: "Triggered when the application stops.",
                condition: "When the application shutdown is initiated.",
                dataFormat: {
                    timestamp: "string (ISO 8601 format)", // Example: "2024-11-18T18:00:00Z"
                },
                exampleData: {
                    timestamp: "2024-11-18T18:00:00Z",
                },
            },
            {
                channel: "ui",
                event: "windowSizeChange",
                description: "Triggered when the main windows size have changed",
                condition: "When the application window size have changed",
                dataFormat: {
                    windowSize: {
                        width: window.innerWidth,
                        height: window.innerHeight,
                    }
                },
                exampleData: {
                    windowSize: {
                        width: 500,
                        height: 200,
                    }
                },
            },
        ],
    };



    console.log('MainPage render');

    /**
     * Define custom event handlers specific to MainPage.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const customHandlers = {
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
    };

    /**
     * Event handler for 'system:start' event.
     * 
     * @param {Object} eventObj - The event object containing event details.
     */
    function handleSystemStart(data) {

        console.log(`MainPage (${data.componentName}) received 'system:start' event with data:`, data.data);
        // TODO: Implement additional logic for handling the start event
    }

    /**
     * Event handler for 'system:stop' event.
     * 
     * @param {Object} eventObj - The event object containing event details.
     */
    function handleSystemStop(data) {
        console.log(`MainPage (${data.componentName}) received 'system:stop' event with data:`, data.data);
        // TODO: Implement additional logic for handling the stop event
    }

    /**
     * Register and manage mediator functionalities using useEffect.
     */
    useEffect(() => {
        const initialize = async () => {
            // Perform any asynchronous initialization here
            // Example: await fetchData();
            console.log('MainPage initializing...');
            // After initialization completes
            setState((prevState) => ({ ...prevState, isInitialized: true }));
        };

        /**
         * Combined event handlers object.
         * Maps event identifiers to their corresponding handler functions.
         */
        const eventHandlers = {};

        // Dynamically assign handlers based on mergedSubscriptionSpec
        const mergedSubscriptionSpec = mergeSubscriptionSpecs(subscriptionSpec, extendedSubscriptionSpec);
        const mergedPublicationSpec = mergePublicationSpecs(publicationSpec, extendedPublishSpec);

        mergedSubscriptionSpec.subscriptions.forEach(({ channel, events }) => {
            events.forEach(({ name: eventName }) => {
                const handlerName = getHandleSubscriptionName(channel, eventName);
                if (typeof customHandlers[`${channel}:${eventName}`] === 'function') {
                    eventHandlers[handlerName] = customHandlers[`${channel}:${eventName}`];
                } else {
                    console.warn(`Handler for event '${eventName}' on channel '${channel}' is not implemented in MainPage.`);
                }
            });
        });

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
            const handlerKey = `${channel}:${event}`;
            console.log(`MainPage: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2));
            if (typeof eventHandlers[handlerKey] === 'function') {
                eventHandlers[handlerKey]({ componentName, componentCode, channel, event, data, timestamp });
            } else {
                console.warn(`MainPage: No handler implemented for event '${event}' on channel '${channel}'.`);
            }
        };

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

        });

        initialize();

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
                    console.log(`MainPage (${name}) initialized.`);
                },
                destroy: () => {
                    console.log(`MainPage (${name}) destroyed.`);
                },
            });

        };

    }, [])

    /**
     * Publish window size changes to the mediator whenever windowSize updates.
     */

    useEffect(() => {
        mediator.publish(name, code, 'ui', 'windowSizeChange', { windowSize }, Date.now());
    }, [windowSize]);

    /**
     * Event handlers replacing class methods.
     */

    const handleMenuItemClick = (key) => {
        console.log(`Menu item clicked: ${key}`);
        const contentMap = {
            home: <HomeContent id="homeContent" name="Home" code="homeContent" description='The home page of the main application' />,
            dashboard: <DashboardContent id="dashboardContent" name="Dashboard" code="dashboardContent" description='The application dashboard' />,
            account: <AccountContent id="AccountContent" name="User Account Setting" code="AccountContent" description='The configuration related to user account' />,
            products: <ProductListContent id="productsListContent" name="Products List" code="productsListContent" description='The list of the product for certain category' />,
            settings: <SettingsContent id="applicationSettingsContent" name="Application Settings" code="applicationSettingsContent" description='The application setting page' />,
            feedback: <FeedbackContent id="feedbackContent" name="Feedback from user" code="feedbackContent" description='The application feedback page' />,
            // Add more mappings as needed
        };

        setState((prevState) => ({
            ...prevState,
            selectedContent: contentMap[key] || <HomeContent id="homeContent" name="Home" code="homeContent" description='The home page of the main application' />, // Default to HomeContent if key not found
        }));
    };

    const handleMenuClick = (event) => {
        setState((prevState) => ({ ...prevState, anchorEl: event.currentTarget }));
    };

    const handleMenuClose = () => {
        setState((prevState) => ({ ...prevState, anchorEl: null }));
    };

    const handleLoginLogout = () => {
        const { isLoggedIn } = state;

        if (isLoggedIn) {
            // User is logging out
            setState((prevState) => ({
                ...prevState,
                isLoggedIn: false,
            }));
            localStorage.setItem('isLoggedIn', 'false');
        } else {
            // User is initiating login
            setState((prevState) => ({
                ...prevState,
                openLoginDialog: true,
            }));
        }

        // Close the menu after performing the action
        handleMenuClose();
    };

    const handleLoginDialogClose = () => {
        setState((prevState) => ({ ...prevState, openLoginDialog: false }));
    };

    const handleLogin = () => {
        setState((prevState) => ({ ...prevState, isLoggedIn: true }));
        localStorage.setItem('isLoggedIn', 'true');
    };

    const handleMouseEnter = () => {
        setState((prevState) => ({ ...prevState, isMouseOverDrawer: true }));
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleMouseLeave = () => {
        const { isDrawerOpen, isDrawerPinned } = state;
        setState((prevState) => ({ ...prevState, isMouseOverDrawer: false }));

        if (isDrawerOpen && !isDrawerPinned) {
            // Start a timer to collapse the drawer after 5 seconds
            timerRef.current = setTimeout(() => {
                setState((prevState) => ({ ...prevState, isDrawerOpen: false }));
                timerRef.current = null;
            }, 5000); // 5 seconds
        }
    };

    const toggleDrawerPinned = () => {
        setState((prevState) => {
            const newDrawerPinned = !prevState.isDrawerPinned;
            console.log(`Toggling DrawerPinned: ${newDrawerPinned}`);

            // Persist the new 'isDrawerPinned' value to localStorage
            localStorage.setItem('isDrawerPinned', JSON.stringify(newDrawerPinned));

            return {
                ...prevState,
                isDrawerPinned: newDrawerPinned,
                isDrawerOpen: newDrawerPinned ? true : false, // Immediately collapse when unpinned
            };
        });
    };

    const expandDrawer = (open = true) => {
        setState((prevState) => ({ ...prevState, isDrawerOpen: open }));
    };

    const handleMediatorTabChange = (event, newValue) => {
        setState((prevState) => ({ ...prevState, selectedTab: newValue }));
    };

    /**
     * Define DropdownMenu items based on the user's login status.
     */
    const dropdownMenuItems = state.isLoggedIn
        ? [
            {
                key: 'account',
                onClick: () => handleMenuItemClick('account'),
                icon: <AccountCircleIcon fontSize="small" />,
                text: 'Account',
            },
            {
                key: 'settings',
                onClick: () => handleMenuItemClick('settings'),
                icon: <SettingsIcon fontSize="small" />,
                text: 'Settings',
            },
            {
                key: 'divider-logged-in',
                divider: true,
            },
            {
                key: 'logout',
                onClick: () => {
                    handleLoginLogout();
                    handleMenuClose();
                },
                icon: <ExitToAppIcon fontSize="small" />,
                text: 'Logout',
            },
        ]
        : [
            {
                key: 'divider-logged-out',
                divider: true,
            },
            {
                key: 'login',
                onClick: () => {
                    handleLoginLogout();
                    handleMenuClose();
                },
                icon: <ExitToAppIcon fontSize="small" />,
                text: 'Login',
            },
        ];


    /**
     * Example functions to publish events.
     * These can be triggered based on specific actions within the component.
     */
    const triggerSystemStart = () => {
        // Publish 'system:start' event
        mediator.publish(name, code, 'system', 'start', Date.now());
    };

    const triggerSystemStop = () => {

        // Publish 'system:stop' event
        mediator.publish(name, code, 'system', 'stop', Date.now());
    };

    /**
     * Render the main content of the page only after initialization.
     */
    if (!state.isInitialized) {
        // Optionally, render a loading indicator
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
            >
                <Typography variant="h6">Loading...</Typography>
            </Box>
        );
    }

    return (

        <Box display="flex" minHeight="100vh">
            {/* Header Section */}
            <AuthenService
                id="sys_authenService"
                name="Authentication Service"
                code="sys_authenService"
                description="Handles user authentication processes, including login and logout requests, interacts with the authentication API, manages authentication state, and communicates authentication events across the application via the mediator pattern."
            />
            {/* Role Management Service */}
            <RoleService
                id="sys_roleService"
                name="Role Management Service"
                code="sys_roleService"
                description="Manages role-related operations, including creating, updating, and deleting roles, interacts with the role API, manages role state, and communicates role events across the application via the mediator pattern."
            />
            {/* Permission Management Service */}
            <PermissionService
                id="sys_permissionService"
                name="Permission Management Service"
                code="sys_permissionService"
                description="Handles permission-related operations, including creating, updating, deleting permissions, managing UI permissions, interacts with the permission API, and communicates permission events across the application via the mediator pattern."
            />
            {/* User Management Service */}
            <UserService
                id="sys_userService"
                name="User Management Service"
                code="sys_userService"
                description="Handles user-related operations, including creating, updating, deleting users, managing role and permission associations, interacts with the user API, manages user state, and communicates user events across the application via the mediator pattern."
            />
            {/* UI Item Management Service */}
            <UiitemService
                id="sys_uiitemService"
                name="UI Item Management Service"
                code="sys_uiitemService"
                description="Handles UI item-related operations, including creating, updating, deleting UI items, interacts with the UI item API, manages UI item state, and communicates UI item events across the application via the mediator pattern."
            />
            {/* UI Permission Management Service */}
            <UipermissionService
                id="sys_uipermissionService"
                name="UI Permission Management Service"
                code="sys_uipermissionService"
                description="Handles UI permission-related operations, including creating, updating, deleting UI permissions, managing associations with UI items, interacts with the UI permission API, manages UI permission state, and communicates UI permission events across the application via the mediator pattern."
            />


            <Box
                component="header"
                sx={{
                    height: theme.navBar.height,
                    backgroundColor: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingX: 2,
                    position: 'fixed',
                    top: 0,
                    left: state.isDrawerOpen ? theme.drawerWidth.expanded : theme.drawerWidth.collapsed,
                    right: 0,
                    zIndex: (theme) => theme.zIndex.appBar + 1, // Ensure the header stays above the Drawer
                }}
            >
                {/* Page Title */}
                <HeaderPage
                    id="sys_headerPage"
                    name="Header Page"
                    code="sys_headerPage"
                    description="The page header of the main page"
                    pageTitle={pageTitle}
                    height="40px"
                    anchorEl={state.anchorEl}
                    open={Boolean(state.anchorEl)}
                    handleMenuClick={handleMenuClick}
                    handleMenuClose={handleMenuClose}
                    onMenuItemClick={handleMenuItemClick}
                    dropdownMenuItems={dropdownMenuItems}
                    isDrawerOpen={state.isDrawerOpen}
                    isDrawerPinned={state.isDrawerPinned}
                    toggleDrawerPinned={toggleDrawerPinned}
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
                    onRefresh={() => mediator.publish(name, code, 'ui', 'refresh', { code, name }, Date.now())}
                >
                </HeaderPage>
                {/* Right-side Icons */}
                <Box display="flex" alignItems="center">
                    {/* Notification Icon (visible only when logged in) */}
                    {state.isLoggedIn && (
                        <NotificationIcon
                            id="sys_notificationIcon"
                            name="Notification Status Icon"
                            code="sys_notificationIcon"
                            description="Notification icon shown after the user has logged in, and has notification"
                            onClick={() => { /* TODO: Navigate to notification page */ }}
                        />
                    )}
                    {/* Account Icon (visible only when logged in) */}
                    {state.isLoggedIn && (
                        <AccountIconComponent
                            id="sys_accountIcon"
                            name="Login Status Account Icon"
                            code="sys_accountIcon"
                            description="Account icon shown after the user has logged in"
                            onClick={() => { /* TODO: Navigate to account page or open account menu */ }}
                        />
                    )}
                    {/* Hamburger Menu Component */}
                    <HamburgerMenu
                        id="sys_mainHamburgerMenu"
                        name='Main Hamburger Menu'
                        code='sys_mainHamburgerMenu'
                        description='Main application hamburger menu'
                        anchorEl={state.anchorEl}
                        open={Boolean(state.anchorEl)}
                        handleMenuClick={handleMenuClick}
                        handleMenuClose={handleMenuClose}
                        isLoggedIn={state.isLoggedIn}
                        handleLoginLogout={handleLoginLogout}
                        onMenuItemClick={handleMenuItemClick}
                        dropdownMenuItems={dropdownMenuItems}
                    />
                </Box>
            </Box>

            {/* Login Dialog Component */}
            <LoginDialog
                id="sys_userAuthen"
                name="User Authentication"
                code="sys_userAuthen"
                description="Handle the User Login and LogOff "
                open={state.openLoginDialog}
                onClose={handleLoginDialogClose}
                onLogin={handleLogin}
            />
            {/* Main Content Area */}

            <Box
                display="flex"
                flexDirection="column"
                height="100vh"
            >
                {/* Main Content Area */}
                <Box
                    display="flex"
                    flexDirection="column"
                    flexGrow={1}
                    sx={{
                        marginLeft: state.isDrawerOpen || state.isDrawerPinned
                            ? `${theme.drawerWidth.expanded}px`
                            : `${theme.drawerWidth.collapsed}px`,
                        transition: 'margin-left 0.3s',
                        overflow: 'hidden', // Prevent content from overflowing horizontally
                    }}
                >
                    {/* Spacer to prevent content from being hidden behind the fixed header */}
                    <Box sx={{ height: 40 }} />

                    {/* Main Content */}
                    <Box
                        component="main"
                        flexGrow={1}
                        paddingTop={4}
                        paddingLeft={1}
                        paddingRight={1}
                        overflow="auto" // Enable scrolling if content overflows
                    >
                        {state.selectedContent}
                    </Box>
                </Box>
            </Box>
            {/* Resizable Footer Component */}
            {state.showLogger && (
                <Resizable
                    defaultSize={{
                        height: state.footerHeight,
                    }}
                    minHeight={50}
                    maxHeight={600}
                    enable={{ top: true }}
                    handleStyles={{
                        top: {
                            top: '-5px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '30px',
                            height: '10px',
                            backgroundColor: '#ccc',
                            cursor: 'ns-resize',
                            position: 'absolute',
                            borderRadius: '5px',
                        },
                    }}
                    onResizeStop={(e, direction, ref, d) => {
                        setState((prevState) => ({
                            ...prevState,
                            footerHeight: Math.max(prevState.footerHeight + d.height, theme.footer.drawer.height.min),
                        }));
                    }}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: state.isDrawerOpen ? `${theme.drawerWidth.expanded}px` : `${theme.drawerWidth.collapsed}px`,
                        right: 0,
                        backgroundColor: '#f8f9fa',
                        zIndex: 1,
                        overflow: 'hidden',
                        transition: 'left 0.3s, margin-left 0.3s',
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',

                        }}
                    >
                        {/* Tabs for Logger */}
                        <Tabs
                            value={state.selectedTab}
                            onChange={handleMediatorTabChange}
                            aria-label="events tabs"
                            variant="standard"
                            scrollButtons={false}
                            sx={(theme) => ({
                                marginBottom: 1,
                                backgroundColor: theme.palette.background.paper,
                            })}
                        >
                            <Tab label="Events Logger" />
                            <Tab label="Components Registry" />
                            <Tab label="Pub/Sub Status" />
                        </Tabs>
                        {/* Content for Selected Tab */}
                        <Box sx={(theme) => ({
                            flexGrow: 1,
                            overflow: 'auto',
                            backgroundColor: theme.palette.background.default,
                        })}>
                            <Box sx={{ height: '100%' }}>
                                {/* Component Registry Content */}
                                <Box sx={{ padding: 1, height: '100%', display: state.selectedTab === 1 ? 'block' : 'none' }}>
                                    <ComponentRegistry
                                        id="sys_componentRegistry"
                                        name="Main Application Component Registry"
                                        code="sys_componentRegistry"
                                        description="List all the components registered specification with a main application mediator."
                                        maxHeight={state.footerHeight - 100}
                                    />
                                </Box>
                                {/* Pub Sub Status Content */}
                                <Box sx={{ padding: 1, height: '100%', display: state.selectedTab === 2 ? 'block' : 'none' }}>
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <ComponentPubSubStatus
                                            id="sys_mediatorPubSubStatus"
                                            name="Mediator Publisher/Subscriber Status"
                                            code="sys_mediatorPubSubStatus"
                                            description="Displays the Pub/Sub status of system mediator."
                                            maxHeight={state.footerHeight - 100}
                                        />
                                    </Suspense>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Resizable>
            )}
        </Box>
    );
};

/**
 * Define PropTypes for type checking.
 */
MainPage.propTypes = {
    name: PropTypes.string.isRequired,                  // The unique name of the MainPage instance
    code: PropTypes.string.isRequired,                  // The unique code identifier for the MainPage
    description: PropTypes.string.isRequired,           // A brief description of the MainPage
    extendedPublishSpec: PropTypes.object,              // Extended publication specification
    extendedSubscriptionSpec: PropTypes.object,         // Extended subscription specification
    pageTitle: PropTypes.string.isRequired,             // The title displayed on the page
};

export default MainPage;
