// src/theme.js
import { createTheme } from '@mui/material/styles'

/**
 * Custom MUI Theme Configuration
 *
 * This theme configuration defines the color palette and component-specific style overrides
 * to ensure consistency and adaptability across the application. By leveraging MUI's theming
 * capabilities, components like LoginDialog can dynamically respond to theme changes without
 * relying on hard-coded color values.
 */
const theme = createTheme({
    /**
     * 1. Palette Configuration
     *
     * Defines the color schemes used throughout the application. The palette includes primary,
     * secondary, success, and error colors, as well as custom palettes for specific UI elements
     * like the menu and resizable footer.
     */
    palette: {
        primary: {
            main: '#247070', // Primary color used for main UI elements
            light: '#5ec5c5', // Lighter variant of the primary color
            dark: '#004c4c', // Darker variant of the primary color
            contrastText: '#ffffff', // Text color that contrasts with the primary color
            iconColor: '#ffffff', // Icon color within the menu
        },
        secondary: {
            main: '#ff0000', // Secondary color used for accents and highlights
            light: '#ff4d4d', // Lighter variant of the secondary color
            dark: '#cc0000', // Darker variant of the secondary color
            contrastText: '#ffffff', // Text color that contrasts with the secondary color
            iconColor: '#ffffff', // Icon color within the menu
        },
        success: {
            main: '#4caf50', // Success color used for positive actions and indicators
            light: '#80e27e', // Lighter variant of the success color
            dark: '#087f23', // Darker variant of the success color
            contrastText: '#ffffff', // Text color that contrasts with the success color
            iconColor: '#ffffff', // Icon color within the menu
        },
        error: {
            main: '#f44336', // Error color used for negative actions and indicators
            light: '#e57373', // Lighter variant of the error color
            dark: '#ba000d', // Darker variant of the error color
            contrastText: '#ffffff', // Text color that contrasts with the error color
            iconColor: '#ffffff', // Icon color within the menu
        },
        /**
         * Custom Palette
         */
        custom: {
            menuBackground: '#247070', // Background color for the LeftMenu drawer
            menuText: '#ffffff', // Text color for menu items
            menuHover: '#1e6a6a', // Hover background color for menu items
            iconColor: '#ffffff', // Icon color within the menu
            refreshBackground: '#ff0000', // Background color for the refresh button
            refreshHover: '#cc0000', // Hover background color for the refresh button
        },
        /**
         * Menu Palette
         *
         * Defines additional color properties specific to the LeftMenu component. This ensures
         * that the menu adheres to the application's overall theme while maintaining its unique
         * styling requirements.
         */
        menu: {
            menuBackground: '#247070', // Background color for the LeftMenu drawer
            menuText: '#ffffff', // Text color for menu items
            menuHover: '#1e6a6a', // Hover background color for menu items
            submenuIconColor: '#B0BEC5', // Lighter submenu icon color
            submenuText: '#B0BEC5', // Lighter submenu text color
            submenuBackground: '#2E7D7D', // Lighter background color for submenu items
            submenuHoverBackground: '#3A8F8F', // Background color on hover
            iconColor: '#ffffff', // Icon color within the menu
            refreshBackground: '#ff0000', // Background color for the refresh button
            refreshHover: '#cc0000', // Hover background color for the refresh button
        },

        /**
         * Additional Palette Customizations (Optional)
         *
         * If your application requires more specific color definitions, you can extend the palette
         * with additional properties here. For example, you might add `background` or `text` properties
         * to further refine component styling.
         */
        background: {
            paper: '#f5f5f5', // Default background color for paper components
            default: '#fafafa', // Default background color for the main content area
        },
        text: {
            primary: '#000000', // Default primary text color
            secondary: '#555555', // Default secondary text color
        },
        action: {
            hover: 'rgba(0, 0, 0, 0.08)', // Default hover color for actionable elements
            selected: 'rgba(0, 0, 0, 0.16)', // Default selected color for actionable elements
        },
        /**
         * 1.a. Custom Text Input Colors
         *
         * Defines text colors specifically for input fields. This allows you to customize
         * the text color within input components without affecting other text elements.
         */
        textInput: {
            primary: '#000000', // User-typed text color
            secondary: '#ffffff', // Additional color if needed
        },
    },

    /**
     * 2. Component-Specific Style Overrides
     *
     * Overrides default MUI component styles to align with the application's theme. This ensures
     * that components like Drawer, ListItemButton, IconButton, TextField, and others adhere to the defined
     * color schemes and styling conventions without relying on hard-coded values.
     */
    components: {
        /**
         * MuiDrawer
         *
         * Customizes the Drawer component's appearance to match the theme's background and text colors.
         */
        MuiDrawer: {
            styleOverrides: {
                paper: ({ theme }) => ({
                    backgroundColor: theme.palette.menu.menuBackground, // Use custom menu background color
                    color: theme.palette.menu.menuText, // Use custom menu text color
                    width: theme.drawerWidth.expanded, // Dynamic width based on theme
                }),
            },
        },
        /**
         * MuiListItemButton
         *
         * Adjusts the ListItemButton component to use theme-based hover colors and ensures text alignment
         * based on the drawer's open state.
         */
        MuiListItemButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '&:hover': {
                        backgroundColor: theme.palette.menu.menuHover, // Use custom menu hover color
                    },
                    // Additional styles can be added here if needed
                }),
            },
        },
        /**
         * MuiIconButton
         *
         * Sets the default color for IconButton components to ensure consistency across the application.
         */
        MuiIconButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: theme.palette.menu.iconColor, // Use custom icon color
                }),
            },
        },
        /**
         * MuiListItemIcon
         *
         * Ensures that icons within list items adhere to the theme's text color.
         */
        MuiListItemIcon: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: theme.palette.menu.iconColor, // Use custom icon color
                }),
            },
        },
        /**
         * MuiListItemText
         *
         * Adjusts the text color within list items to align with the theme.
         */
        MuiListItemText: {
            styleOverrides: {
                primary: ({ theme }) => ({
                    color: theme.palette.menu.menuText, // Use custom menu text color
                }),
            },
        },
        /**
         * MuiButton
         *
         * Customizes Button components to use theme-based colors for background and hover states.
         */
        MuiButton: {
            styleOverrides: {
                contained: ({ theme }) => ({
                    backgroundColor: theme.palette.primary.main, // Use primary color for contained buttons
                    color: theme.palette.primary.contrastText, // Ensure text color contrasts with the primary background
                    '&:hover': {
                        backgroundColor: theme.palette.primary.dark || theme.palette.action.hover, // Darker primary or default hover color
                    },
                }),
                outlined: ({ theme }) => ({
                    borderColor: theme.palette.secondary.main, // Use secondary color for outlined buttons
                    color: theme.palette.secondary.main, // Use secondary color for text
                    '&:hover': {
                        borderColor: theme.palette.secondary.dark || theme.palette.action.hover, // Darker secondary or default hover color
                        backgroundColor: theme.palette.action.hover, // Default hover background
                    },
                }),
            },
        },
        /**
         * MuiTextField
         *
         * Ensures that TextField components adhere to the theme's input text colors and border styles.
         */
        MuiTextField: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: theme.palette.primary.main, // Primary color for the border
                        },
                        '&:hover fieldset': {
                            borderColor: theme.palette.primary.dark, // Darker primary on hover
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main, // Maintain primary color when focused
                        },
                        '&.Mui-error fieldset': {
                            borderColor: theme.palette.error.main, // Error border color
                        },
                        '&.Mui-error:hover fieldset': {
                            borderColor: theme.palette.error.dark, // Darker error on hover
                        },
                        '&.Mui-error.Mui-focused fieldset': {
                            borderColor: theme.palette.error.main, // Error border color on focus
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: theme.palette.text.primary, // Text color for the label
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                        color: theme.palette.primary.main, // Label color when focused
                    },
                }),
            },
        },
    },

    /**
     * 3. Drawer Width Configuration
     *
     * Defines custom properties like drawer width within the theme for easy access and consistency.
     * This ensures that components relying on these values can dynamically adjust based on the theme.
     */
    drawerWidth: {
        expanded: 230, // Width when the drawer is expanded
        collapsed: 0, // Width when the drawer is collapsed
    },

    navBar: {
        height: 40,
    },

    footer: {
        drawer: {
            height: {
                min: 40
            }
        }
    }
})

export default theme
