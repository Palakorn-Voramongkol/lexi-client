import React, { useState, useEffect } from 'react'
import { Toolbar, Item } from 'devextreme-react/toolbar'
import TabPanel from 'devextreme-react/tab-panel'
import 'devextreme/dist/css/dx.light.css'
import { Padding } from '@mui/icons-material'
import { getvuTaxCategory } from '../../services/apiendpoint/TaxCategoryActiveAction'

const Content1 = () => {
    const [width, setWidth] = useState('auto')
    const [showNavigation, setShowNavigation] = useState(false)
    const [activeVendorInfoTab, setActiveVendorInfoTab] = useState(0)

    const handleTabVendorInfoChange = (e) => {
        setActiveVendorInfoTab(e.component.option('selectedIndex'))
    }
    //console.log(getvuTaxCategory)

    const handleClick = (action) => {
        // console.log(`${action} clicked`)
       
        // ดึงข้อมูลเป็น Array
        const selectedRowsArray = JSON.parse(localStorage.getItem('selectedRows')) || []

        // ดึงข้อมูลเป็น String
        const selectedRowsString = selectedRowsArray.join(',')
         alert(`pkOrig: ${action} clicked and array of pkObj_LineItem (${selectedRowsArray}) will process on spuLineItem_set_ManualTaxCat`)
    }

    const [jsonData, setJsonData] = useState([])
    // ดึงข้อมูลเมื่อคอมโพเนนต์โหลดครั้งแรก
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getvuTaxCategory()
                setJsonData(data) // อัปเดตข้อมูลใน state
            } catch (error) {
                console.error('Error fetching tax categories:', error)
            }
        }
        fetchData()
    }, [])

    const labelTemplate = (iconName) => {
        return function template(data) {
            return (
                <div>
                    <i className={`dx-icon dx-icon-${iconName}`}></i>
                    {data.text}
                </div>
            )
        }
    }
    return (
        <div>
            <div style={{ padding: '5px' }}>
                <TabPanel>
                    {jsonData
                        .reduce((groups, item) => {
                            if (!groups.includes(item.taxCategoryGroup)) {
                                groups.push(item.taxCategoryGroup)
                            }
                            return groups
                        }, [])
                        .map((group) => (
                            <Item key={group} title={group}>
                                <Toolbar>
                                    {jsonData
                                        .filter((item) => item.taxCategoryGroup === group)
                                        .map((item) => (
                                            <Item
                                                key={item.pkOrig}
                                                location="before"
                                                widget="dxButton"
                                                options={{
                                                    icon: item.icon,
                                                    hint: item.taxCategory,
                                                    onClick: () => handleClick(item.pkOrig),
                                                }}
                                            />
                                        ))}
                                </Toolbar>
                            </Item>
                        ))}
                </TabPanel>
            </div>
        </div>
    )
}

export default Content1
