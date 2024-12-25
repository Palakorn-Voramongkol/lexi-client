// src/components/HomeContent.js
import React, { useEffect, useState } from 'react'
import { Toolbar, Item } from 'devextreme-react/toolbar'
import TabPanel from 'devextreme-react/tab-panel'
import { TextArea } from 'devextreme-react/text-area'
import { Button } from 'devextreme-react/button'
import TopActionToolbar from '../../components/TopActionToolbar/Index'
import Rating from '@mui/material/Rating'
import { Box } from '@mui/material'
import ProductListboxSlide from '../../components/ProductListItem/ProductListboxSlide'

import { Form, SimpleItem, EmptyItem, GroupItem } from 'devextreme-react/form'
import MainTab1 from '../../components/MainTab1/Index'
import MainTab2 from '../../components/MainTab2/Index'
import MainTab3 from '../../components/MainTab3/Index'

import { simpleProducts, vendorsData } from '../../components/datajson/data'

import VendorFormIndex from '../../components/VendorForm/FormIndex'
import FormWebInfo from '../../components/VendorForm/FormWebInfo'
import FormSite from '../../components/VendorForm/FormSite'
import CheckBox from 'devextreme-react/check-box'
import 'devextreme-react/text-area'

import 'devextreme/dist/css/dx.light.css'
import PropTypes from 'prop-types'

import { useMediator } from '../../../systems/contexts/MediatorContext' // Hook to access mediator via Context

import { mergeSubscriptionSpecs, mergePublicationSpecs } from '../../../systems/components/BaseComponent/mergeSpec' // Utility functions to merge specs
import { SelectBox } from 'devextreme-react/select-box'
import { useTheme } from '@mui/material/styles' // Hook to access MUI theme
import Tabs from 'devextreme-react/tabs'
import Splitter from 'devextreme-react/splitter'

/**
 * HomeContent Functional Component
 *
 * Displays the home page content and integrates with the mediator for event-driven communication.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.name - The unique name of the HomeContent instance.
 * @param {string} props.code - The unique code identifier for the HomeContent.
 * @param {string} props.description - A brief description of the HomeContent.
 * @param {Object} [props.extendedSubscriptionSpec={}] - Extended subscription specifications for additional events.
 * @param {Object} [props.extendedPublishSpec={}] - Extended publication specifications for additional events.
 * @returns {JSX.Element} The rendered HomeContent component.
 */
const HomeContent = ({ name, code, description, extendedSubscriptionSpec = {}, extendedPublishSpec = {} }) => {
    const mediator = useMediator() // Access mediator via Context
    const theme = useTheme() // Access MUI theme for styling

    // State to manage responsive layout
    const [isMobile, setIsMobile] = useState(false)

    /**
     * Define initial subscription specifications.
     * HomeContent subscribes to 'system:start', 'system:stop', and 'ui:windowSizeChange' events.
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
        ],
    }

    /**
     * Define publication specifications.
     * Currently, HomeContent does not publish any events, but the structure is in place
     * for future event publications.
     */
    const publicationSpec = {
        publications: [
            // Example: Uncomment and define events if HomeContent needs to publish any.
            // {
            //     channel: "home",
            //     event: "init",
            //     description: "Publishes an init event when HomeContent initializes.",
            //     condition: "When HomeContent mounts.",
            //     dataFormat: {
            //         timestamp: "string (ISO 8601 format)",
            //     },
            //     exampleData: {
            //         timestamp: "2024-05-01T12:00:00Z",
            //     },
            // },
        ],
    }

    /**
     * Merge the subscription and publication specifications with any extended specs.
     */
    const mergedSubscriptionSpec = mergeSubscriptionSpecs(initialSubscriptionSpec, extendedSubscriptionSpec)
    const mergedPublicationSpec = mergePublicationSpecs(publicationSpec, extendedPublishSpec)

    /**
     * Define custom event handlers specific to HomeContent.
     * The keys are in the format 'channel:event' to match incoming events.
     */
    const eventHandlers = {
        'system:start': handleSystemStart,
        'system:stop': handleSystemStop,
        'ui:windowSizeChange': handleWindowSizeChange, // Newly added handler
    }

    const calculateSelectedRow = (options) => {
        if (options.name === 'SelectedRowsSummary') {
            if (options.summaryProcess === 'start') {
                options.totalValue = 0
            }
            const isRowSelected = options.component.isRowSelected(options.value?.ID)
            if (options.summaryProcess === 'calculate' && isRowSelected) {
                options.totalValue += options.value.SaleAmount
            }
        }
    }

    const onSelectionChanged = (e) => e.component.refresh(true)

    /**
     * Handler for 'system:start' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStart(data) {
        console.log(`HomeContent (${data.accountName}) received 'system:start' event with data:`, data.data)
        // Implement additional logic for handling the start event if needed
    }
    /**
     * Handler for 'system:stop' event.
     *
     * @param {Object} data - The data associated with the event.
     */
    function handleSystemStop(data) {
        console.log(`HomeContent (${data.accountName}) received 'system:stop' event with data:`, data.data)
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
        const { windowSize } = data.data
        const { width } = windowSize

        console.log(`HomeContent (${data.componentName}) received 'ui:windowSizeChange' event with width: ${width}px`)

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
        console.log(`HomeContent: Received event '${handlerKey}' with data:`, JSON.stringify(data, null, 2))
        if (typeof eventHandlers[handlerKey] === 'function') {
            eventHandlers[handlerKey]({ componentName, componentCode, channel, event, data, timestamp })
        } else {
            console.warn(`No handler implemented for event '${event}' on channel '${channel}' in HomeContent.`)
        }
    }

    /**
     * Registers event handlers with the mediator upon component mount.
     * Also fetches initial data or performs any initialization logic.
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
                console.log(`HomeContent (${name}) initialized.`)
                // Publish an initialization event if needed
                // Example: mediator.publish(name, code, 'home', 'init', { timestamp: new Date().toISOString() }, Date.now());
            },
            destroy: () => {
                console.log(`HomeContent (${name}) destroyed.`)
                // Perform any necessary cleanup here
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
                handleEvent, // Ensure to pass the same handleEvent for unregistration
                getComponentFullSpec: () => ({
                    name,
                    code,
                    description,
                    subscriptionSpec: mergedSubscriptionSpec,
                    publicationSpec: mergedPublicationSpec,
                }),
                initialize: () => {
                    console.log(`HomeContent (${name}) initialized.`)
                },
                destroy: () => {
                    console.log(`HomeContent (${name}) destroyed.`)
                },
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Empty dependency array ensures this runs once on mount and cleans up on unmount

    /**
     * Example function to publish an event.
     * This can be triggered based on specific actions within the component.
     * Currently unused but structured for future use.
     */
    const triggerWelcome = () => {
        mediator.publish(name, code, 'home', 'welcome', { message: 'Hello from HomeContent!' }, Date.now())
    }

    /**
     * Determines the typography variant based on the current layout (mobile or desktop).
     *
     * @returns {string} The typography variant.
     */
    const [width] = useState('auto')
    const [showNavigation, setShowNavigation] = useState(false)

    const [activeVendorInfoTab, setActiveVendorInfoTab] = useState(0)
    const [selectedVendor, setSelectedVendor] = useState(null)

    const handleTabVendorInfoChange = (e) => {
        setActiveVendorInfoTab(e.component.option('selectedIndex'))
    }
    const handleClick = (action) => {
        alert(`You clicked ${action}`)
    }
    // ตั้งค่า vendor ตัวแรก
    useEffect(() => {
        const initialVendor = vendorsData[0]
        if (initialVendor) {
            setSelectedVendor(initialVendor)
        }
    }, [])
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopActionToolbar />

            {/* <ProductListboxSlide onSelectVendor={(vendor) => setSelectedVendor(vendor)} /> */}

            <Splitter id="splitter">
                <Item
                    resizable={true}
                    size="25%"
                    minSize="10%"
                    // render={() => (
                    //     <div>
                    //         <TabPanel>
                    //             {/* <Item title="Vendor">
                    //                 <div style={{ padding: '20px', backgroundColor: '#fff' }}>
                    //                     <VendorFormIndex vendor={selectedVendor} />
                    //                 </div>
                    //             </Item>
                    //             <Item title="Web Info">
                    //                 <div style={{ padding: '20px', backgroundColor: '#fff' }}>
                    //                     <FormWebInfo vendor={selectedVendor} />
                    //                 </div>
                    //             </Item>
                    //             <Item title="Websites">
                    //                 <div style={{ padding: '20px', backgroundColor: '#fff' }}>
                    //                     <FormSite vendor={selectedVendor} />
                    //                 </div>
                    //             </Item> */}
                    //         </TabPanel>
                    //     </div>
                    // )}
                />
                <Item
                    resizable={true}
                    collapsible={true}
                    size="75%"
                    minSize="30%"
                    render={() => (
                        <div>
                            <MainTab2 />
                        </div>
                    )}
                />
            </Splitter>

            <div style={{ marginBottom: '50px' }}>
                <MainTab3 />
            </div>
        </div>
    )
}
/**
 * Define PropTypes for type checking.
 */
HomeContent.propTypes = {
    name: PropTypes.string.isRequired, // The unique name of the HomeContent instance
    code: PropTypes.string.isRequired, // The unique code identifier for the HomeContent
    description: PropTypes.string.isRequired, // A brief description of the HomeContent
    extendedPublishSpec: PropTypes.object, // Extended publication specifications for additional events
    extendedSubscriptionSpec: PropTypes.object, // Extended subscription specifications for additional events
}

export default React.memo(HomeContent)
