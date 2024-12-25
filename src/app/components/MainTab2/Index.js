import React, { useState, useEffect, useCallback } from 'react'
import Tabs from 'devextreme-react/tabs'
import { DataGrid, Column, Toolbar, Item, TotalItem, Summary, Pager, Paging } from 'devextreme-react/data-grid'
import { statisticsTabsText } from '../datajson/tab_master'
import { statisticsData } from '../datajson/data.js'
import TabPanel from 'devextreme-react/tab-panel'
import { Button } from 'devextreme-react/button'
import {
    getvuLineItem_ALL_gbClientCode,
    getvuLineItem_ALL_gbManualTaxCat,
} from '../../services/apiendpoint/StatServiceApi'

const Content2 = () => {
    const allowedPageSizes = [5, 10, 'all']
    const [width, setWidth] = useState('auto')

    const [showInfo, setShowInfo] = useState(true)
    const [showPageSizeSelector, setShowPageSizeSelector] = useState(true)
    const [showNavButtons, setShowNavButtons] = useState(true)

    const showPageSizeSelectorChange = useCallback((value) => {
        setShowPageSizeSelector(value)
    }, [])
    const showInfoChange = useCallback((value) => {
        setShowInfo(value)
    }, [])
    const showNavButtonsChange = useCallback((value) => {
        setShowNavButtons(value)
    }, [])

    const [activeVendorInfoTab, setActiveVendorInfoTab] = useState(0)
    const handleTabVendorInfoChange = (e) => {
        setActiveVendorInfoTab(e.component.option('selectedIndex'))
    }
    const [activeStatTab, setActiveStatTab] = useState(0)
    const handleTabStatChange = (e) => {
        setActiveStatTab(e.component.option('selectedIndex'))
    }
    const [gbClientCode, setgbClientCode] = useState([])
    const [gbManualTaxCat, setgbManualTaxCat] = useState([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        // ฟังก์ชันโหลดข้อมูลจาก API
        const fetchData = async () => {
            try {
                setLoading(true)

                const [clients, taxs] = await Promise.all([
                    getvuLineItem_ALL_gbClientCode(),
                    getvuLineItem_ALL_gbManualTaxCat(),
                ])

                setgbClientCode(clients)
                setgbManualTaxCat(taxs)
            } catch (error) {
                //console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div>
            <TabPanel>
                <Item title="by clients">
                    <div style={{ padding: '10px', backgroundColor: '#fff' }}>
                        <div className="statiscs-datagrid">
                            <DataGrid
                                dataSource={gbClientCode}
                                showBorders={true}
                                rowAlternationEnabled={true}
                                highlightChanges={true}
                                className="dx-datagrid-headers"
                            >
                                <Paging defaultPageSize={10} />
                                <Pager
                                    visible={true}
                                    allowedPageSizes={allowedPageSizes}
                                    showInfo={showInfo}
                                    showPageSizeSelector={showPageSizeSelector}
                                    showNavigationButtons={showNavButtons}
                                />
                                <Column dataField="clientCode" caption="Client Code" allowSorting={false} />
                                <Column
                                    dataField="pcDone"
                                    dataType="number"
                                    format={{ type: 'fixedPoint', precision: 2 }}
                                    caption="PC Done"
                                    width={150}
                                    allowSorting={false}
                                />
                                <Column dataField="qtyDone" caption="Qty Done" width={150} allowSorting={false} />
                                <Column
                                    dataField="amtDone"
                                    caption="Amt Done"
                                    width={150}
                                    allowSorting={false}
                                    dataType="number"
                                    format={{ type: 'currency', currency: 'USD' }}
                                />
                                <Column
                                    dataField="qtyQueue"
                                    caption="Qty Queue"
                                    width={150}
                                    dataType="number"
                                    format={{ type: 'fixedPoint', precision: 0 }}
                                    allowSorting={false}
                                />

                                <Column
                                    dataField="amtQueue"
                                    caption="Amt Queue"
                                    width={250}
                                    allowSorting={false}
                                    dataType="number"
                                    format={{ type: 'currency', currency: 'USD' }}
                                />
                                <Summary>
                                    <TotalItem
                                        column="pcDone"
                                        summaryType="sum"
                                        displayFormat="Total: {0}"
                                        valueFormat={{ type: 'fixedPoint', precision: 2 }}
                                    />

                                    <TotalItem
                                        column="qtyDone"
                                        summaryType="sum"
                                        displayFormat="Total: {0}"
                                        valueFormat="decimal" // ฟอร์แมตตัวเลข
                                        dataType="number"
                                    />
                                    <TotalItem
                                        column="amtDone"
                                        summaryType="sum"
                                        displayFormat="Total: {0}" // แสดงผลรวมเงิน
                                        valueFormat={{ type: 'currency', currency: 'USD' }} // ฟอร์แมตเงินดอลลาร์
                                        dataType="number"
                                    />
                                    <TotalItem
                                        column="qtyQueue"
                                        summaryType="sum"
                                        displayFormat="Total: {0}"
                                        dataType="number"
                                        valueFormat={{ type: 'fixedPoint', precision: 0 }} // ฟอร์แมตตัวเลขพร้อมกำหนดทศนิยม 2 ตำแหน่ง
                                    />
                                    <TotalItem
                                        column="amtQueue"
                                        summaryType="sum"
                                        displayFormat="Total: {0}" // แสดงผลรวมเงิน
                                        valueFormat={{ type: 'currency', currency: 'USD' }} // ฟอร์แมตเงินดอลลาร์
                                        dataType="number"
                                    />
                                </Summary>
                            </DataGrid>
                        </div>
                    </div>
                </Item>
                <Item title="by tax cats">
                    <div style={{ padding: '10px', backgroundColor: '#fff' }}>
                        <div className="statiscs-datagrid">
                            <DataGrid
                                dataSource={gbManualTaxCat}
                                showBorders={true}
                                rowAlternationEnabled={true}
                                highlightChanges={true}
                                className="dx-datagrid-headers"
                            >
                                <Paging defaultPageSize={10} />
                                <Pager
                                    visible={true}
                                    allowedPageSizes={allowedPageSizes}
                                    showInfo={showInfo}
                                    showPageSizeSelector={showPageSizeSelector}
                                    showNavigationButtons={showNavButtons}
                                />
                                <Column dataField="taxCategory" caption="Tax Category" allowSorting={false} />
                                <Column
                                    dataField="pcCnt"
                                    format={{ type: 'fixedPoint', precision: 0 }}
                                    caption="PC Count"
                                    width={150}
                                    allowSorting={false}
                                />
                                <Column
                                    dataField="cnt"
                                    format={{ type: 'fixedPoint', precision: 0 }}
                                    caption="Count"
                                    width={150}
                                    allowSorting={false}
                                />
                                <Column
                                    dataField="pcAmt"
                                    caption="PC Amount"
                                    width={150}
                                    allowSorting={false}
                                    dataType="number"
                                    format={{ type: 'currency', currency: 'USD' }} // ฟอร์แมตรูปแบบเงิน
                                />
                                <Column
                                    dataField="amt"
                                    caption="Amount"
                                    width={250}
                                    allowSorting={false}
                                    dataType="number"
                                    format={{ type: 'currency', currency: 'USD' }} // ฟอร์แมตรูปแบบเงิน
                                />
                                <Summary>
                                    <TotalItem
                                        column="pcCnt"
                                        summaryType="sum"
                                        displayFormat="Total: {0}" // แสดงผลรวม
                                        valueFormat={{ type: 'fixedPoint', precision: 0 }} // ฟอร์แมตตัวเลข
                                    />
                                    <TotalItem
                                        column="cnt"
                                        summaryType="sum"
                                        displayFormat="Total: {0}" // แสดงผลรวม
                                        valueFormat={{ type: 'fixedPoint', precision: 0 }} // ฟอร์แมตตัวเลข
                                    />
                                    <TotalItem
                                        column="pcAmt"
                                        summaryType="sum"
                                        displayFormat="Total: {0}" // แสดงผลรวมเงิน
                                        valueFormat={{ type: 'currency', currency: 'USD' }} // ฟอร์แมตเงิน
                                    />
                                    <TotalItem
                                        column="amt"
                                        summaryType="sum"
                                        displayFormat="Total: {0}" // แสดงผลรวมเงิน
                                        valueFormat={{ type: 'currency', currency: 'USD' }} // ฟอร์แมตเงิน
                                    />
                                </Summary>
                            </DataGrid>
                        </div>
                    </div>
                </Item>
            </TabPanel>
        </div>
    )
}

export default Content2

// <div style={{ padding: '10px' }}>
// <Tabs
//     id="withText"
//     width={width}
//     defaultSelectedIndex={0}
//     dataSource={statisticsTabsText}
//     showNavButtons={showNavigation}
//     selectedIndex={activeStatTab}
//     onSelectionChanged={handleTabStatChange}
// />
// {activeStatTab === 0 && (
// <div style={{ position: 'relative', paddingTop: '50px' }}>
//     {/* <DataGrid
//         dataSource={summaryRow}
//         //showBorders={true}
//         rowAlternationEnabled={true}
//         highlightChanges={true}
//         showColumnHeaders={false}
//     >
//         <Column dataField="TaxCategory" cellRender={() => null} width={300} />
//         <Column
//             cellRender={() => (
//                 <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//                     <button className="btn-icon btn-icon-red">
//                         <i className="dx-icon dx-icon-refresh"></i>
//                     </button>
//                 </div>
//             )}
//         />
//         <Column
//             cellRender={() => (
//                 <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//                     <button className="btn-icon btn-icon-green">
//                         <i className="dx-icon dx-icon-sortup"></i>
//                     </button>
//                     <button className="btn-icon btn-icon-orange">
//                         <i className="dx-icon dx-icon-sortdown"></i>
//                     </button>
//                 </div>
//             )}
//         />
//         <Column
//             cellRender={() => (
//                 <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//                     <button className="btn-icon btn-icon-green">
//                         <i className="dx-icon dx-icon-sortup"></i>
//                     </button>
//                     <button className="btn-icon btn-icon-orange">
//                         <i className="dx-icon dx-icon-sortdown"></i>
//                     </button>
//                 </div>
//             )}
//         />
//         <Column
//             cellRender={() => (
//                 <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//                     <button className="btn-icon btn-icon-green">
//                         <i className="dx-icon dx-icon-sortup"></i>
//                     </button>
//                     <button className="btn-icon btn-icon-orange">
//                         <i className="dx-icon dx-icon-sortdown"></i>
//                     </button>
//                 </div>
//             )}
//         />
//         <Column
//             cellRender={() => (
//                 <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//                     <button className="btn-icon btn-icon-green">
//                         <i className="dx-icon dx-icon-sortup"></i>
//                     </button>
//                     <button className="btn-icon btn-icon-orange">
//                         <i className="dx-icon dx-icon-sortdown"></i>
//                     </button>
//                 </div>
//             )}
//         />
//         <Column
//             cellRender={() => (
//                 <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//                     <button className="btn-icon btn-icon-green">
//                         <i className="dx-icon dx-icon-sortup"></i>
//                     </button>
//                     <button className="btn-icon btn-icon-orange">
//                         <i className="dx-icon dx-icon-sortdown"></i>
//                     </button>
//                 </div>
//             )}
//         />
//     </DataGrid> */}

//     <DataGrid
//         dataSource={combinedData}
//         showBorders={true}
//         rowAlternationEnabled={true}
//         highlightChanges={true}
//         className="dx-datagrid-headers"
//     >
//         {/* <Column dataField="id" caption="ID" width={50} /> */}
//         <Column dataField="TaxCategory" width={300} />
//         <Column dataField="Score" />
//         <Column dataField="Rule" />
//         <Column dataField="Manual" />
//         <Column dataField="AiGPT" />
//         <Column dataField="AiClaude" />
//         <Column dataField="AiML" />

//         {/* <Toolbar>

//             <Item
//                 location="before"
//                 widget="dxButton"
//                 options={{
//                     text: 'Reset to Defaults',
//                     onClick: handleResetDefaults,
//                 }}
//             />

//             <Item
//                 location="after"
//                 widget="dxButton"
//                 options={{
//                     text: '(+5%)',
//                     onClick: () => modifyWeights('increase'),
//                 }}
//             />

//             <Item
//                 location="after"
//                 widget="dxButton"
//                 options={{
//                     text: '(-5%)',
//                     onClick: () => modifyWeights('decrease'),
//                 }}
//             />
//         </Toolbar> */}
//     </DataGrid>
//     </div>
// )}
// {activeStatTab === 1 && <div>This is the content of ...</div>}
// </div>
