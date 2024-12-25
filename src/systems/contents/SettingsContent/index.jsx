// src/components/SettingContent.js

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Typography,
    Box,
    Tabs,
    Tab,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    Snackbar,
    Alert,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Paper,
    Divider,
    Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useMediator } from '../../contexts/MediatorContext';
import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../../components/BaseComponent/mergeSpec'; // Utility functions to merge specs

/**
 * TabPanel Component
 * 
 * A helper component to render the content of each tab.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The content to display within the tab.
 * @param {number} props.value - The current active tab index.
 * @param {number} props.index - The index of the TabPanel.
 * @returns {JSX.Element} The rendered TabPanel component.
 */
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`setting-tabpanel-${index}`}
            aria-labelledby={`setting-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

/**
 * a11yProps Function
 * 
 * Generates accessibility properties for each Tab.
 * 
 * @param {number} index - The index of the tab.
 * @returns {Object} The accessibility properties.
 */
function a11yProps(index) {
    return {
        id: `setting-tab-${index}`,
        'aria-controls': `setting-tabpanel-${index}`,
    };
}

/**
 * SettingContent Functional Component
 * 
 * Displays the settings page content and integrates with the mediator for event-driven communication.
 * Features a tabbed interface for organizing different settings categories.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.name - The unique name of the SettingContent instance.
 * @param {string} props.code - The unique code identifier for the SettingContent.
 * @param {string} props.description - A brief description of the SettingContent.
 * @param {Object} [props.extendedSubscriptionSpec={}] - Extended subscription specifications for additional events.
 * @param {Object} [props.extendedPublishSpec={}] - Extended publication specifications for additional events.
 * @returns {JSX.Element} The rendered SettingContent component.
 */
const SettingContent = ({
    name,
    code,
    description,
    extendedSubscriptionSpec = {},
    extendedPublishSpec = {},
}) => {
    const mediator = useMediator(); // Access mediator via Context

    /**
     * Define initial subscription specifications.
     * SettingContent subscribes to relevant system and UI events.
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
            // Add other channels and events as needed
        ],
    };

    /**
     * Define publication specifications.
     * SettingContent publishes events when a user updates their settings.
     */
    const publicationSpec = {
        publications: [
            {
                channel: 'settings', // Channel name for settings-related events
                event: 'settingsUpdated', // Event name indicating settings update
                description: 'Publishes an event when the user updates their settings.',
                condition: 'When the user successfully updates their settings.',
                dataFormat: {
                    userId: 'string',
                    updatedSettings: 'object',
                    timestamp: 'string (ISO 8601 format)',
                },
                exampleData: {
                    userId: 'user-67890',
                    updatedSettings: {
                        theme: 'dark',
                        notifications: true,
                    },
                    timestamp: '2024-05-01T13:00:00Z',
                },
            },
            // Add other publications as needed
            {
                channel: 'settings',
                event: 'languageChanged',
                description: 'Publishes an event when the user changes their language preference.',
                condition: 'When the user successfully changes their language preference.',
                dataFormat: {
                    userId: 'string',
                    language: 'string',
                    timestamp: 'string (ISO 8601 format)',
                },
                exampleData: {
                    userId: 'user-67890',
                    language: 'es',
                    timestamp: '2024-05-01T13:05:00Z',
                },
            },
            {
                channel: 'settings',
                event: 'privacySettingsUpdated',
                description: 'Publishes an event when the user updates their privacy settings.',
                condition: 'When the user successfully updates their privacy settings.',
                dataFormat: {
                    userId: 'string',
                    privacySettings: 'object',
                    timestamp: 'string (ISO 8601 format)',
                },
                exampleData: {
                    userId: 'user-67890',
                    privacySettings: {
                        profileVisibility: 'friends_only',
                        dataSharing: false,
                    },
                    timestamp: '2024-05-01T13:10:00Z',
                },
            },
        ],
    };

    /**
     * Merge the subscription and publication specifications with any extended specs.
     */
    const mergedSubscriptionSpec = mergeSubscriptionSpecs(
        initialSubscriptionSpec,
        extendedSubscriptionSpec
    );
    const mergedPublicationSpec = mergePublicationSpecs(
        publicationSpec,
        extendedPublishSpec
    );

    /**
     * Define custom event handlers specific to SettingContent.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const eventHandlers = {
        'settings:preferencesUpdate': handlePreferencesUpdate,
        'settings:themeChange': handleThemeChange,
        'settings:languageChanged': handleLanguageChanged,
        'settings:privacySettingsUpdated': handlePrivacySettingsUpdated,
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'ui:windowSizeChange': handleWindowSizeChange,
    };

    /**
     * Handler for 'settings:preferencesUpdate' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handlePreferencesUpdate(data) {
        console.log(`SettingContent (${data.accountName}) received 'settings:preferencesUpdate' event with data:`, data.data);
        // Implement additional logic for handling the preferences update event
        // For example, updating the UI or notifying the user
    }

    /**
     * Handler for 'settings:themeChange' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleThemeChange(data) {
        console.log(`SettingContent (${data.accountName}) received 'settings:themeChange' event with data:`, data.data);
        // Implement additional logic for handling the theme change event
        // For example, updating the application's theme
        setThemeMode(data.theme);
    }

    /**
     * Handler for 'settings:languageChanged' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleLanguageChanged(data) {
        console.log(`SettingContent (${data.accountName}) received 'settings:languageChanged' event with data:`, data.data);
        // Implement additional logic for handling the language change event
        setLanguage(data.language);
    }

    /**
     * Handler for 'settings:privacySettingsUpdated' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handlePrivacySettingsUpdated(data) {
        console.log(`SettingContent (${data.accountName}) received 'settings:privacySettingsUpdated' event with data:`, data.data);
        // Implement additional logic for handling the privacy settings update
        setPrivacySettings(data.privacySettings);
    }

    /**
     * Handler for 'system:start' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStart(data) {
        console.log(`SettingContent (${data.accountName}) received 'system:start' event with data:`, data.data);
        // Implement additional logic for handling the start event if needed
    }

    /**
     * Handler for 'system:stop' event.
     * 
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`SettingContent (${data.accountName}) received 'system:stop' event with data:`, data.data);
        // Implement additional logic for handling the stop event if needed
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
        console.log(`SettingContent (${data.accountName}) received 'ui:windowSizeChange' event with data:`, data.data);
        // Implement additional logic for handling window size changes if needed
    }

    /**
     * Registers event handlers with the mediator upon component mount.
     * Also performs any initialization logic, such as fetching user settings.
     * Cleans up event handlers upon component unmount.
     */
    useEffect(() => {
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
            console.log(`SettingContent: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2));
            if (typeof eventHandlers[handlerKey] === 'function') {
                eventHandlers[handlerKey]({ componentName, componentCode, channel, event, data, timestamp });
            } else {
                console.warn(`SettingContent: No handler implemented for event '${event}' on channel '${channel}'`);
            }
        };


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
                console.log(`SettingContent (${name}) initialized.`);
                // Perform any additional initialization logic here
                // Example: Fetch initial settings data
                // mediator.publish(name, code, 'settings', 'fetchSettings', { userId: code, timestamp: Date.now() });
            },
            destroy: () => {
                console.log(`SettingContent (${name}) destroyed.`);
                // Perform any necessary cleanup here
            },
        });

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
                    console.log(`SettingContent (${name}) initialized.`);
                },
                destroy: () => {
                    console.log(`SettingContent (${name}) destroyed.`);
                },
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

    /**
     * State to manage the current active tab.
     */
    const [tabIndex, setTabIndex] = useState(0);

    /**
     * Event handler for tab changes.
     * 
     * @param {Object} event - The event object.
     * @param {number} newValue - The index of the selected tab.
     */
    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    /**
     * State to manage user preferences.
     */
    const [preferences, setPreferences] = useState({
        emailNotifications: false,
        smsNotifications: false,
        pushNotifications: false,
        inAppNotifications: false,
        language: 'en',
    });

    /**
     * Handler for preferences form input changes.
     * 
     * @param {Object} event - The change event.
     */
    const handlePreferencesChange = (event) => {
        const { name, value, checked, type } = event.target;
        setPreferences((prevPreferences) => ({
            ...prevPreferences,
            [name]: type === 'checkbox' || type === 'switch' ? checked : value,
        }));
    };

    /**
     * Handler for submitting the preferences form.
     */
    const handlePreferencesSubmit = (event) => {
        event.preventDefault();
        // Publish a 'settingsUpdated' event via mediator
        const settingsUpdateData = {
            userId: code, // Assuming 'code' represents the user ID
            updatedSettings: preferences,
            timestamp: new Date().toISOString(),
        };
        mediator.publish(
            name,
            code,
            'settings',
            'settingsUpdated',
            settingsUpdateData,
            Date.now()
        );
        console.log(`SettingContent (${name}) published 'settingsUpdated' event with data:`, settingsUpdateData);
        // Show success snackbar
        setSnackbar({
            open: true,
            message: 'Preferences updated successfully!',
            severity: 'success',
        });
    };

    /**
     * State to manage theme mode.
     * Assuming you have a theming context or state management in place.
     */
    const [themeMode, setThemeMode] = useState('light');

    /**
     * Handler for toggling dark mode.
     * 
     * @param {Object} event - The change event.
     */
    const handleThemeToggle = (event) => {
        const newTheme = event.target.checked ? 'dark' : 'light';
        setThemeMode(newTheme);
        // Publish a theme change event
        const themeChangeData = {
            theme: newTheme,
            timestamp: new Date().toISOString(),
        };
        mediator.publish(
            name,
            code,
            'settings',
            'themeChanged',
            themeChangeData,
            Date.now()
        );
        console.log(`SettingContent (${name}) published 'themeChanged' event with data:`, themeChangeData);
    };

    /**
     * State to manage language selection.
     */
    const [language, setLanguage] = useState('en');

    /**
     * Handler for changing language.
     * 
     * @param {Object} event - The change event.
     */
    const handleLanguageChange = (event) => {
        const selectedLanguage = event.target.value;
        setLanguage(selectedLanguage);
        // Publish a language change event
        const languageChangeData = {
            userId: code,
            language: selectedLanguage,
            timestamp: new Date().toISOString(),
        };
        mediator.publish(
            name,
            code,
            'settings',
            'languageChanged',
            languageChangeData,
            Date.now()
        );
        console.log(`SettingContent (${name}) published 'languageChanged' event with data:`, languageChangeData);
    };

    /**
     * State to manage privacy settings.
     */
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'public', // Options: public, friends_only, private
        dataSharing: false,
    });

    /**
     * Handler for privacy settings changes.
     * 
     * @param {Object} event - The change event.
     */
    const handlePrivacyChange = (event) => {
        const { name, value, checked, type } = event.target;
        setPrivacySettings((prevPrivacySettings) => ({
            ...prevPrivacySettings,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    /**
     * Handler for submitting the privacy settings form.
     */
    const handlePrivacySubmit = (event) => {
        event.preventDefault();
        // Publish a 'privacySettingsUpdated' event via mediator
        const privacyUpdateData = {
            userId: code,
            privacySettings: privacySettings,
            timestamp: new Date().toISOString(),
        };
        mediator.publish(
            name,
            code,
            'settings',
            'privacySettingsUpdated',
            privacyUpdateData,
            Date.now()
        );
        console.log(`SettingContent (${name}) published 'privacySettingsUpdated' event with data:`, privacyUpdateData);
        // Show success snackbar
        setSnackbar({
            open: true,
            message: 'Privacy settings updated successfully!',
            severity: 'success',
        });
    };

    /**
     * State to manage snackbar notifications.
     */
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success', // 'success' | 'error' | 'warning' | 'info'
    });

    /**
     * Handler to close the snackbar notification.
     * 
     * @param {Object} event - The event object.
     * @param {string} reason - The reason for closing the snackbar.
     */
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar((prev) => ({
            ...prev,
            open: false,
        }));
    };

    return (
        <Box sx={{ width: '100%', p: { xs: 2, md: 4 } }}>
            <Typography variant="h4" gutterBottom>
                Settings
            </Typography>
            <Paper elevation={3} sx={{ mb: 4 }}>
                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    aria-label="settings tabs"
                    variant="scrollable"
                    scrollButtons="auto"
                    indicatorColor="primary"
                    textColor="primary"
                >
                    {/* Adjusted Tabs: Removed the Account Tab and added Select Language & Privacy Settings */}
                    <Tab label="Preferences" {...a11yProps(0)} />
                    <Tab label="Theme" {...a11yProps(1)} />
                    <Tab label="Notifications" {...a11yProps(2)} />
                    <Tab label="Select Language" {...a11yProps(3)} />
                    <Tab label="Privacy Settings" {...a11yProps(4)} />
                </Tabs>
            </Paper>

            {/* Preferences Tab */}
            <TabPanel value={tabIndex} index={0}>
                <Paper elevation={2} sx={{ p: 3, maxWidth: 600 }}>
                    <Typography variant="h6" gutterBottom>
                        User Preferences
                    </Typography>
                    <Box component="form" onSubmit={handlePreferencesSubmit} sx={{ mt: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.emailNotifications}
                                    onChange={handlePreferencesChange}
                                    name="emailNotifications"
                                    color="primary"
                                />
                            }
                            label="Enable Email Notifications"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.smsNotifications}
                                    onChange={handlePreferencesChange}
                                    name="smsNotifications"
                                    color="primary"
                                />
                            }
                            label="Enable SMS Notifications"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.pushNotifications}
                                    onChange={handlePreferencesChange}
                                    name="pushNotifications"
                                    color="primary"
                                />
                            }
                            label="Enable Push Notifications"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.inAppNotifications}
                                    onChange={handlePreferencesChange}
                                    name="inAppNotifications"
                                    color="primary"
                                />
                            }
                            label="Enable In-App Notifications"
                        />
                        <TextField
                            select
                            label="Language"
                            name="language"
                            value={preferences.language}
                            onChange={handlePreferencesChange}
                            SelectProps={{
                                native: true,
                            }}
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            {/* Add more languages as needed */}
                        </TextField>
                        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} fullWidth>
                            Update Preferences
                        </Button>
                    </Box>
                </Paper>
            </TabPanel>

            {/* Theme Tab */}
            <TabPanel value={tabIndex} index={1}>
                <Paper elevation={2} sx={{ p: 3, maxWidth: 600 }}>
                    <Typography variant="h6" gutterBottom>
                        Theme Settings
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={themeMode === 'dark'}
                                    onChange={handleThemeToggle}
                                    name="darkMode"
                                    color="primary"
                                />
                            }
                            label="Enable Dark Mode"
                        />
                        {/* Add more theme-related settings as needed */}
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body1" gutterBottom>
                            Choose your preferred color theme:
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Button
                                    variant={themeMode === 'light' ? 'contained' : 'outlined'}
                                    fullWidth
                                    onClick={() => {
                                        setThemeMode('light')
                                        const themeChangeData = {
                                            theme: 'light',
                                            timestamp: new Date().toISOString(),
                                        }
                                        mediator.publish('settings', 'themeChanged', themeChangeData)
                                        console.log(
                                            `SettingContent (${name}) published 'themeChanged' event with data:`,
                                            themeChangeData
                                        )
                                        setSnackbar({
                                            open: true,
                                            message: 'Light theme activated!',
                                            severity: 'success',
                                        })
                                    }}
                                >
                                    Light Theme
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    variant={themeMode === 'dark' ? 'contained' : 'outlined'}
                                    fullWidth
                                    onClick={() => {
                                        setThemeMode('dark')
                                        const themeChangeData = {
                                            theme: 'dark',
                                            timestamp: new Date().toISOString(),
                                        }
                                        mediator.publish('settings', 'themeChanged', themeChangeData)
                                        console.log(
                                            `SettingContent (${name}) published 'themeChanged' event with data:`,
                                            themeChangeData
                                        )
                                        setSnackbar({
                                            open: true,
                                            message: 'Dark theme activated!',
                                            severity: 'success',
                                        })
                                    }}
                                >
                                    Dark Theme
                                </Button>
                            </Grid>
                            {/* Add more theme options if available */}
                        </Grid>
                    </Box>
                </Paper>
            </TabPanel>

            {/* Notifications Tab */}
            <TabPanel value={tabIndex} index={2}>
                <Paper elevation={2} sx={{ p: 3, maxWidth: 600 }}>
                    <Typography variant="h6" gutterBottom>
                        Notification Settings
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.pushNotifications}
                                    onChange={handlePreferencesChange}
                                    name="pushNotifications"
                                    color="primary"
                                />
                            }
                            label="Enable Push Notifications"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.inAppNotifications}
                                    onChange={handlePreferencesChange}
                                    name="inAppNotifications"
                                    color="primary"
                                />
                            }
                            label="Enable In-App Notifications"
                        />
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body1" gutterBottom>
                            Manage how you receive notifications:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="Email Notifications" />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={preferences.emailNotif}
                                            onChange={handlePreferencesChange}
                                            name="emailNotif"
                                            color="primary"
                                        />
                                    }
                                    label=""
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="SMS Notifications" />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={preferences.smsNotif}
                                            onChange={handlePreferencesChange}
                                            name="smsNotif"
                                            color="primary"
                                        />
                                    }
                                    label=""
                                />
                            </ListItem>
                            {/* Add more notification options as needed */}
                        </List>
                    </Box>
                </Paper>
            </TabPanel>

            {/* Select Language Tab */}
            <TabPanel value={tabIndex} index={3}>
                <Paper elevation={2} sx={{ p: 3, maxWidth: 600 }}>
                    <Typography variant="h6" gutterBottom>
                        Select Language
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleLanguageChange({ target: { value: language } })
                        }}
                        sx={{ mt: 2 }}
                    >
                        <TextField
                            select
                            label="Choose Language"
                            name="language"
                            value={language}
                            onChange={handleLanguageChange}
                            SelectProps={{
                                native: true,
                            }}
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="zh">Chinese</option>
                            {/* Add more languages as needed */}
                        </TextField>
                        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} fullWidth>
                            Save Language Preference
                        </Button>
                    </Box>
                </Paper>
            </TabPanel>

            {/* Privacy Settings Tab */}
            <TabPanel value={tabIndex} index={4}>
                <Paper elevation={2} sx={{ p: 3, maxWidth: 600 }}>
                    <Typography variant="h6" gutterBottom>
                        Privacy Settings
                    </Typography>
                    <Box component="form" onSubmit={handlePrivacySubmit} sx={{ mt: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={privacySettings.profileVisibility === 'friends_only'}
                                    onChange={(e) => {
                                        handlePrivacyChange({
                                            target: {
                                                name: 'profileVisibility',
                                                value: e.target.checked ? 'friends_only' : 'public',
                                            },
                                        })
                                    }}
                                    name="profileVisibility"
                                    color="primary"
                                />
                            }
                            label="Make my profile visible to friends only"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={privacySettings.dataSharing}
                                    onChange={handlePrivacyChange}
                                    name="dataSharing"
                                    color="primary"
                                />
                            }
                            label="Allow data sharing with third parties"
                        />
                        {/* Add more privacy settings as needed */}
                        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} fullWidth>
                            Update Privacy Settings
                        </Button>
                    </Box>
                </Paper>
            </TabPanel>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

/**
 * Define PropTypes for type checking.
 * Ensures that the component receives the correct types of props.
 */
SettingContent.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the SettingContent instance
    code: PropTypes.string.isRequired, // The unique code identifier for the SettingContent
    description: PropTypes.string.isRequired, // A brief description of the SettingContent
    extendedPublishSpec: PropTypes.object, // Extended publication specifications for additional events
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications for additional events
};

/**
 * Wraps the SettingContent component with React.memo to prevent unnecessary re-renders.
 * This optimization enhances performance, especially when the component receives stable props.
 */
export default React.memo(SettingContent);
