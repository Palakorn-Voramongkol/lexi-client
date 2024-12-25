import React, { useState } from 'react'
import Tabs from 'devextreme-react/tabs'
import VendorForm from '../VendorForm/FormIndex'

import { vendorInfoTabsText } from '../datajson/tab_master'

const Cintent1 = () => {
    const [width, setWidth] = useState('auto')
    const [showNavigation, setShowNavigation] = useState(false)
    const [activeVendorInfoTab, setActiveVendorInfoTab] = useState(0)
    const handleTabVendorInfoChange = (e) => {
        setActiveVendorInfoTab(e.component.option('selectedIndex'))
    }
    const handleClick = (action) => {
        alert(`You clicked ${action}`);
    };
    return (
        <div style={{ padding: '10px' }}>
            <Tabs
                id="withText"
                width={width}
                defaultSelectedIndex={0}
                dataSource={vendorInfoTabsText}
                showNavButtons={showNavigation}
                selectedIndex={activeVendorInfoTab}
                //onSelectionChanged={handleTabVendorInfoChange}
            />
            {activeVendorInfoTab === 0 && <VendorForm />}
            {activeVendorInfoTab === 1 && (
                <div>
                    555
                    {/* <div style={{ width: '300px', margin: '20px auto', textAlign: 'center' }}>
                        <form>
                            <label htmlFor="message" style={{ display: 'block', marginBottom: '10px' }}>
                                Message:
                            </label>
                            <TextArea
                                id="message"
                                defaultValue=""
                                height={100}
                                style={{ marginBottom: '15px' }}
                                placeholder="Type your message here..."
                            />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Button icon="save" text="Save" hint="Save" onClick={() => handleClick('Save')} />

                                <Button
                                    icon="upload"
                                    text="Upload"
                                    hint="Upload"
                                    onClick={() => handleClick('Upload')}
                                />

                                <Button
                                    icon="trash"
                                    text="Delete"
                                    hint="Delete"
                                    onClick={() => handleClick('Delete')}
                                />
                            </div>
                        </form>
                    </div> */}
                </div>
            )}
            {activeVendorInfoTab === 2 && <div>This is the content of websites</div>}
        </div>
    )
}

export default Cintent1
