// src/components/AccountContent.js

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
 * @param {number} props.index - The index of this TabPanel.
 * @returns {JSX.Element} The rendered TabPanel component.
 */
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      )}
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
    id: `account-tab-${index}`,
    'aria-controls': `account-tabpanel-${index}`,
  };
}

/**
 * AccountContent Functional Component
 * 
 * Displays the user account page content and integrates with the mediator for event-driven communication.
 * Features a tabbed interface for organizing different account-related settings and information.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.name - The unique name of the AccountContent instance.
 * @param {string} props.code - The unique code identifier for the AccountContent.
 * @param {string} props.description - A brief description of the AccountContent.
 * @param {Object} [props.extendedSubscriptionSpec={}] - Extended subscription specifications for additional events.
 * @param {Object} [props.extendedPublishSpec={}] - Extended publication specifications for additional events.
 * @returns {JSX.Element} The rendered AccountContent component.
 */
const AccountContent = ({
  name,
  code,
  description,
  extendedSubscriptionSpec = {},
  extendedPublishSpec = {},
}) => {
  const mediator = useMediator(); // Access mediator via Context

  /**
   * Define initial subscription specifications.
   * Currently, AccountContent subscribes to 'account:profileUpdate' and 'account:passwordChange' events.
   */
  const initialSubscriptionSpec = {
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
          }
        ]
      },
      {
        channel: "ui", // Channel name for UI-related events
        events: [
          {
            name: "windowSizeChange", // Event name indicating a window size change
            description: "Handles the application window size change.",
            dataFormat: {
              windowSize: {
                width: "integer",
                height: "integer",
              },
            },
          },
        ],
      },
    ],
  };

  /**
   * Define publication specifications.
   * AccountContent publishes events when a user updates their profile or changes their password.
   */
  const publicationSpec = {
    publications: [
      {
        channel: "account", // Channel name for account-related events
        event: "profileUpdated", // Event name indicating a profile update
        description: "Publishes an event when the user updates their profile.",
        condition: "When the user successfully updates their profile.",
        dataFormat: {
          userId: "string",
          updatedFields: "array of strings",
          timestamp: "string (ISO 8601 format)",
        },
        exampleData: {
          userId: "user-12345",
          updatedFields: ["email", "username"],
          timestamp: "2024-05-01T12:00:00Z",
        },
      },
      {
        channel: "account", // Channel name for account-related events
        event: "passwordChanged", // Event name indicating a password change
        description: "Publishes an event when the user changes their password.",
        condition: "When the user successfully changes their password.",
        dataFormat: {
          userId: "string",
          timestamp: "string (ISO 8601 format)",
        },
        exampleData: {
          userId: "user-12345",
          timestamp: "2024-05-01T12:05:00Z",
        },
      },
      {
        channel: "account", // Channel name for account-related events
        event: "addressAdded", // Event name indicating an address addition
        description: "Publishes an event when a new address is added.",
        condition: "When the user successfully adds a new address.",
        dataFormat: {
          userId: "string",
          address: "object", // Address object containing address details
          timestamp: "string (ISO 8601 format)",
        },
        exampleData: {
          userId: "user-12345",
          address: {
            street: "123 Main St",
            city: "Anytown",
            state: "Anystate",
            zipCode: "12345",
            country: "USA",
          },
          timestamp: "2024-05-01T12:10:00Z",
        },
      },
      {
        channel: "account", // Channel name for account-related events
        event: "addressUpdated", // Event name indicating an address update
        description: "Publishes an event when an existing address is updated.",
        condition: "When the user successfully updates an address.",
        dataFormat: {
          userId: "string",
          addressId: "string",
          updatedFields: "object",
          timestamp: "string (ISO 8601 format)",
        },
        exampleData: {
          userId: "user-12345",
          addressId: "addr-67890",
          updatedFields: {
            street: "456 Elm St",
            city: "Newtown",
          },
          timestamp: "2024-05-01T12:15:00Z",
        },
      },
      {
        channel: "account", // Channel name for account-related events
        event: "addressDeleted", // Event name indicating an address deletion
        description: "Publishes an event when an address is deleted.",
        condition: "When the user successfully deletes an address.",
        dataFormat: {
          userId: "string",
          addressId: "string",
          timestamp: "string (ISO 8601 format)",
        },
        exampleData: {
          userId: "user-12345",
          addressId: "addr-67890",
          timestamp: "2024-05-01T12:20:00Z",
        },
      },
    ],
  };

  /**
   * Merge the subscription and publication specifications with any extended specs.
   */
  const mergedSubscriptionSpec = mergeSubscriptionSpecs(initialSubscriptionSpec, extendedSubscriptionSpec);
  const mergedPublicationSpec = mergePublicationSpecs(publicationSpec, extendedPublishSpec);

  /**
   * Define custom event handlers specific to AccountContent.
   * The keys are in the format 'channel:event' to match incoming events.
   */
  const eventHandlers = {
    'system:start': handleSystemStart,
    'system:stop': handleSystemStop,
    'ui:windowSizeChange': handleWindowSizeChange,
    'account:profileUpdate': handleProfileUpdate,
    'account:passwordChange': handlePasswordChange,
    'account:addressAdded': handleAddressAdded,
    'account:addressUpdated': handleAddressUpdated,
    'account:addressDeleted': handleAddressDeleted,
  };



  /**
   * Handler for 'system:start' event.
   * 
   * @param {Object} data - The data associated with the event.
   */
  function handleSystemStart(data) {
    console.log(`AccountContent (${data.accountName}) received 'system:start' event with data:`, data.data);
    // Implement additional logic for handling the start event if needed
  }

  /**
   * Handler for 'system:stop' event.
   * 
   * @param {Object} data - The data associated with the event.
   */
  function handleSystemStop(data) {
    console.log(`AccountContent (${data.accountName}) received 'system:stop' event with data:`, data.data);
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
    console.log(`AccountContent (${data.accountName}) received 'ui:windowSizeChange' event with data:`, data.data);
    // Implement additional logic for handling window size changes if needed
  }


  /**
   * Handler for 'account:profileUpdate' event.
   * 
   * @param {Object} data - The data associated with the event.
   */
  function handleProfileUpdate(data) {
    console.log(`AccountContent (${data.accountName}) received 'account:profileUpdate' event with data:`, data.data);
    // Implement additional logic for handling the profile update event
    // For example, updating the UI or notifying the user
  }

  /**
   * Handler for 'account:passwordChange' event.
   * 
   * @param {Object} data - The data associated with the event.
   */
  function handlePasswordChange(data) {
    console.log(`AccountContent (${data.accountName}) received 'account:passwordChange' event with data:`, data.data);
    // Implement additional logic for handling the password change event
    // For example, logging the user out or displaying a success message
  }

  /**
   * Handler for 'account:addressAdded' event.
   * 
   * @param {Object} data - The data associated with the event.
   */
  function handleAddressAdded(data) {
    console.log(`AccountContent (${data.accountName}) received 'account:addressAdded' event with data:`, data.data);
    // Implement additional logic for handling the address addition
    // For example, updating the local address list
    setAddresses((prevAddresses) => [...prevAddresses, { id: generateUniqueId(), ...data.data.address }]);
    // Show success snackbar
    setSnackbar({
      open: true,
      message: 'Address added successfully!',
      severity: 'success',
    });
  }

  /**
   * Handler for 'account:addressUpdated' event.
   * 
   * @param {Object} data - The data associated with the event.
   */
  function handleAddressUpdated(data) {
    console.log(`AccountContent (${data.accountName}) received 'account:addressUpdated' event with data:`, data.data);
    // Implement additional logic for handling the address update
    // For example, updating the specific address in the local address list
    setAddresses((prevAddresses) =>
      prevAddresses.map((address) =>
        address.id === data.data.addressId ? { ...address, ...data.data.updatedFields } : address
      )
    );
    // Show success snackbar
    setSnackbar({
      open: true,
      message: 'Address updated successfully!',
      severity: 'success',
    });
  }

  /**
   * Handler for 'account:addressDeleted' event.
   * 
   * @param {Object} data - The data associated with the event.
   */
  function handleAddressDeleted(data) {
    console.log(`AccountContent (${data.accountName}) received 'account:addressDeleted' event with data:`, data.data);
    // Implement additional logic for handling the address deletion
    // For example, removing the specific address from the local address list
    setAddresses((prevAddresses) => prevAddresses.filter((address) => address.id !== data.data.addressId));
    // Show success snackbar
    setSnackbar({
      open: true,
      message: 'Address deleted successfully!',
      severity: 'success',
    });
  }

  /**
   * Registers event handlers with the mediator upon component mount.
   * Also performs any initialization logic, such as fetching user data.
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
      console.log(`AccountContent: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2));
      if (typeof eventHandlers[handlerKey] === 'function') {
        eventHandlers[handlerKey]({ componentName, componentCode, channel, event, data, timestamp });
      } else {
        console.warn(`AccountContent: No handler implemented for event '${event}' on channel '${channel}'`);
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
        console.log(`AccountContent (${name}) initialized.`);
        // Perform any additional initialization logic here
        // Example: Fetch initial user account data
        // mediator.publish(name, code, 'account', 'fetchUserData', { userId: code, timestamp: Date.now() });
      },
      destroy: () => {
        console.log(`AccountContent (${name}) destroyed.`);
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
          console.log(`AccountContent (${name}) initialized.`);
        },
        destroy: () => {
          console.log(`AccountContent (${name}) destroyed.`);
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
   * State to manage form inputs for profile information.
   */
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
  });

  /**
   * State to manage password change inputs.
   */
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  /**
   * State to manage user addresses.
   */
  const [addresses, setAddresses] = useState([
    // Example initial address
    // {
    //     id: 'addr-1',
    //     street: '123 Main St',
    //     city: 'Anytown',
    //     state: 'Anystate',
    //     zipCode: '12345',
    //     country: 'USA',
    // },
  ]);

  /**
   * State to manage dialog for editing an address.
   */
  const [editDialog, setEditDialog] = useState({
    open: false,
    address: null,
  });

  /**
   * State to manage form inputs for editing an address.
   */
  const [editAddressData, setEditAddressData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  /**
   * State to manage snackbar notifications.
   */
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'warning' | 'info'
  });

  /**
   * Utility function to generate a unique ID for addresses.
   * In a real application, this might be handled by the backend.
   * 
   * @returns {string} A unique ID string.
   */
  const generateUniqueId = () => {
    return `addr-${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Handler for profile form input changes.
   * 
   * @param {Object} event - The change event.
   */
  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  /**
   * Handler for password form input changes.
   * 
   * @param {Object} event - The change event.
   */
  const handlePasswordChangeInput = (event) => {
    const { name, value } = event.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  /**
   * Handler for submitting the profile update form.
   */
  const handleProfileSubmit = (event) => {
    event.preventDefault();
    // Validate inputs as needed
    // Example: Ensure email is in correct format
    const updatedFields = Object.keys(profileData).filter(
      (key) => profileData[key] !== ''
    );
    const profileUpdateData = {
      userId: code, // Assuming 'code' represents the user ID
      updatedFields,
      timestamp: new Date().toISOString(),
    };
    mediator.publish(name, code, 'account', 'profileUpdated', profileUpdateData, Date.now());
    console.log(`AccountContent (${name}) published 'profileUpdated' event with data:`, profileUpdateData);
    // Show success snackbar
    setSnackbar({
      open: true,
      message: 'Profile updated successfully!',
      severity: 'success',
    });
    // Reset form fields if needed
    setProfileData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
    });
  };

  /**
   * Handler for submitting the password change form.
   */
  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New passwords do not match!',
        severity: 'error',
      });
      return;
    }
    // Publish a 'passwordChanged' event via mediator
    const passwordChangeData = {
      userId: code, // Assuming 'code' represents the user ID
      timestamp: new Date().toISOString(),
    };
    mediator.publish(name, code, 'account', 'passwordChanged', passwordChangeData, Date.now());
    console.log(`AccountContent (${name}) published 'passwordChanged' event with data:`, passwordChangeData);
    // Show success snackbar
    setSnackbar({
      open: true,
      message: 'Password changed successfully!',
      severity: 'success',
    });
    // Reset form fields
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

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

  /**
   * Handler to open the edit address dialog.
   * 
   * @param {Object} address - The address object to edit.
   */
  const handleOpenEditDialog = (address) => {
    setEditAddressData({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    });
    setEditDialog({
      open: true,
      address: address,
    });
  };

  /**
   * Handler to close the edit address dialog.
   */
  const handleCloseEditDialog = () => {
    setEditDialog({
      open: false,
      address: null,
    });
  };

  /**
   * Handler for editing an address.
   * Publishes an 'addressUpdated' event via mediator.
   */
  const handleEditAddressSubmit = () => {
    const { address } = editDialog;
    const updatedFields = Object.keys(editAddressData).filter(
      (key) => editAddressData[key] !== ''
    );
    const addressUpdateData = {
      userId: code, // Assuming 'code' represents the user ID
      addressId: address.id,
      updatedFields: editAddressData,
      timestamp: new Date().toISOString(),
    };
    mediator.publish(name, code, 'account', 'addressUpdated', addressUpdateData, Date.now());
    console.log(`AccountContent (${name}) published 'addressUpdated' event with data:`, addressUpdateData);
    // Close dialog
    handleCloseEditDialog();
    // Show success snackbar
    setSnackbar({
      open: true,
      message: 'Address updated successfully!',
      severity: 'success',
    });
  };

  /**
   * Handler for deleting an address.
   * Publishes an 'addressDeleted' event via mediator.
   * 
   * @param {string} addressId - The ID of the address to delete.
   */
  const handleDeleteAddress = (addressId) => {
    const addressDeleteData = {
      userId: code, // Assuming 'code' represents the user ID
      addressId: addressId,
      timestamp: new Date().toISOString(),
    };
    mediator.publish(name, code, 'account', 'addressDeleted', addressDeleteData, Date.now());
    console.log(`AccountContent (${name}) published 'addressDeleted' event with data:`, addressDeleteData);
    // Show success snackbar
    setSnackbar({
      open: true,
      message: 'Address deleted successfully!',
      severity: 'success',
    });
  };

  /**
   * Handler for adding a new address.
   * Publishes an 'addressAdded' event via mediator.
   * 
   * @param {Object} event - The form submission event.
   */
  const handleAddAddress = (event) => {
    event.preventDefault();
    // Assuming form validation is handled
    const form = event.target;
    const newAddress = {
      street: form.street.value,
      city: form.city.value,
      state: form.state.value,
      zipCode: form.zipCode.value,
      country: form.country.value,
    };
    const addressAddData = {
      userId: code, // Assuming 'code' represents the user ID
      address: newAddress,
      timestamp: new Date().toISOString(),
    };
    mediator.publish(name, code, 'account', 'addressAdded', addressAddData, Date.now());
    console.log(`AccountContent (${name}) published 'addressAdded' event with data:`, addressAddData);
    // Show success snackbar
    setSnackbar({
      open: true,
      message: 'Address added successfully!',
      severity: 'success',
    });
    // Reset form fields
    form.reset();
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>
      <Paper elevation={3} sx={{ mb: 4 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label="account settings tabs"
          variant="scrollable"
          scrollButtons="auto"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Profile" {...a11yProps(0)} />
          <Tab label="Security" {...a11yProps(1)} />
          <Tab label="Preferences" {...a11yProps(2)} />
          <Tab label="Address" {...a11yProps(3)} />
        </Tabs>
      </Paper>

      {/* Profile Tab */}
      <TabPanel value={tabIndex} index={0}>
        <Grid container spacing={4}>
          {/* Profile Information */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Box component="form" onSubmit={handleProfileSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  margin="normal"
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  margin="normal"
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  margin="normal"
                  variant="outlined"
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Update Profile
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Profile Picture Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Profile Picture
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mt: 2,
                }}
              >
                <Box
                  component="img"
                  src="/path-to-profile-picture.jpg" // Replace with actual image source
                  alt="Profile"
                  sx={{
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    mb: 2,
                  }}
                />
                <Button variant="outlined" color="primary">
                  Change Picture
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={tabIndex} index={1}>
        <Paper elevation={2} sx={{ p: 3, maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>
          <Box component="form" onSubmit={handlePasswordSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChangeInput}
              margin="normal"
              required
              variant="outlined"
            />
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChangeInput}
              margin="normal"
              required
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChangeInput}
              margin="normal"
              required
              variant="outlined"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              fullWidth
            >
              Change Password
            </Button>
          </Box>
        </Paper>
      </TabPanel>

      {/* Preferences Tab */}
      <TabPanel value={tabIndex} index={2}>
        <Paper elevation={2} sx={{ p: 3, maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            Preferences
          </Typography>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={false} // Replace with actual state if needed
                  onChange={(e) => console.log('Notifications toggled:', e.target.checked)}
                  name="notificationsToggle"
                  color="primary"
                />
              }
              label="Enable Email Notifications"
            />
            <Divider sx={{ my: 2 }} />
            {/* Add more preference settings as needed */}
            <FormControlLabel
              control={
                <Switch
                  checked={false} // Replace with actual state if needed
                  onChange={(e) => console.log('Dark mode toggled:', e.target.checked)}
                  name="darkModeToggle"
                  color="primary"
                />
              }
              label="Enable Dark Mode"
            />
          </Box>
        </Paper>
      </TabPanel>

      {/* Address Management Tab */}
      <TabPanel value={tabIndex} index={3}>
        <Grid container spacing={4}>
          {/* Add New Address */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Add New Address
              </Typography>
              <Box component="form" onSubmit={handleAddAddress} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street"
                      name="street"
                      margin="normal"
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      margin="normal"
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="State"
                      name="state"
                      margin="normal"
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Zip Code"
                      name="zipCode"
                      margin="normal"
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="country"
                      margin="normal"
                      required
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Add Address
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* List of Existing Addresses */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, maxHeight: 400, overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Your Addresses
              </Typography>
              {addresses.length === 0 ? (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  No addresses added yet.
                </Typography>
              ) : (
                <List>
                  {addresses.map((address) => (
                    <ListItem
                      key={address.id}
                      secondaryAction={
                        <>
                          <Tooltip title="Edit Address">
                            <IconButton
                              edge="end"
                              aria-label="edit"
                              onClick={() => handleOpenEditDialog(address)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Address">
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      }
                    >
                      <ListItemText
                        primary={`${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Dialog for Editing Address */}
        <Dialog open={editDialog.open} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
          <DialogTitle>Edit Address</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street"
                    name="street"
                    value={editAddressData.street}
                    onChange={(e) => setEditAddressData({ ...editAddressData, street: e.target.value })}
                    margin="normal"
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={editAddressData.city}
                    onChange={(e) => setEditAddressData({ ...editAddressData, city: e.target.value })}
                    margin="normal"
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State"
                    name="state"
                    value={editAddressData.state}
                    onChange={(e) => setEditAddressData({ ...editAddressData, state: e.target.value })}
                    margin="normal"
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Zip Code"
                    name="zipCode"
                    value={editAddressData.zipCode}
                    onChange={(e) => setEditAddressData({ ...editAddressData, zipCode: e.target.value })}
                    margin="normal"
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="country"
                    value={editAddressData.country}
                    onChange={(e) => setEditAddressData({ ...editAddressData, country: e.target.value })}
                    margin="normal"
                    required
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleEditAddressSubmit} variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

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
      </TabPanel>
    </Box>
  )
}

/**
 * Define PropTypes for type checking.
 */
AccountContent.propTypes = {
  name: PropTypes.string.isRequired,                      // The unique name of the AccountContent instance
  code: PropTypes.string.isRequired,                      // The unique code identifier for the AccountContent
  description: PropTypes.string.isRequired,               // A brief description of the AccountContent
  extendedPublishSpec: PropTypes.object,                  // Extended publication specifications for additional events
  extendedSubscriptionSpec: PropTypes.object,             // Extended subscription specifications for additional events
};

export default React.memo(AccountContent);
