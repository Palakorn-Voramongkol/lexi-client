import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import TabPanel from 'devextreme-react/tab-panel'
import CheckBox from 'devextreme-react/check-box'
import { vendorLineItem } from '../datajson/simulated_line_items'
import Button from 'devextreme-react/button'
import {
    getvuLineItem_Queue,
    getvuLineItem_Done,
    getvuLineItem_ALL,
} from '../../services/apiendpoint/LineItemServiceApi'

import { Item } from 'devextreme-react/form'
import { Popup } from 'devextreme-react/popup'
import DataGrid, {
    Column,
    Selection,
    Paging,
    Summary,
    Pager,
    TotalItem,
    Grouping,
    GroupPanel,
    SearchPanel,
    MasterDetail,
    Editing,
    Lookup,
    FilterRow,
    Form,
    StateStoring,
    Popup as DxPopup,
} from 'devextreme-react/data-grid'

const Content3 = () => {
    const pageSizes = [10, 25, 50, 100]

    const allowedPageSizes = [10, 25, 50]
    const onRefreshClick = () => {
        window.location.reload()
    }
    // const onAutoExpandAllChanged = useCallback(() => {
    //     setAutoExpandAll((previousAutoExpandAll) => !previousAutoExpandAll)
    // }, [])

    // const handleTabProductChange = (e) => {
    //     setActiveProductTab(e.component.option('selectedIndex'))
    // }

    const onContentReady = (e) => {
        if (!e.component.getSelectedRowKeys().length) {
            e.component.selectRowsByIndexes([0])
        }
    }
    const onSelectionrowChanged = (e) => {
        e.component.collapseAll(-1)
        e.component.expandRow(e.currentSelectedRowKeys[0])
        e.component.refresh(true)
    }

    const [queueData, setQueueData] = useState([])
    const [doneData, setDoneData] = useState([])
    const [allData, setAllData] = useState([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        // ฟังก์ชันโหลดข้อมูลจาก API
        const fetchData = async () => {
            try {
                setLoading(true)

                const [queue, done, all] = await Promise.all([
                    getvuLineItem_Queue(),
                    getvuLineItem_Done(),
                    getvuLineItem_ALL(),
                ])

                setQueueData(queue)
                setDoneData(done)
                setAllData(all)
            } catch (error) {
                //console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const dataGridRef = useRef(null)
    const onStateResetClick = useCallback(() => {
        dataGridRef.current.instance().state(null)
    }, [])

    const [allMode, setAllMode] = useState('allPages')

    const [checkBoxesMode] = useState('always')

    const onAllModeChanged = useCallback(({ value }) => {
        setAllMode(value)
    }, [])

    const [popupVisible, setPopupVisible] = useState(false)
    const [selectedRowData, setSelectedRowData] = useState(null)

    // ฟังก์ชันเปิด Popup และบันทึกข้อมูลแถวที่เลือก
    const handleFileClick = (e) => {
        const rowData = e.row.data
        setSelectedRowData(rowData)
        setPopupVisible(true)
    }
    // ฟังก์ชันปิด Popup
    const handleClosePopup = () => {
        setPopupVisible(false)
        setSelectedRowData({})
    }
    const handleLineItemFileClick = (e) => {
        const rowData = e.row.data
        setSelectedRowData(rowData)
        setPopupVisible(true)
    }
    const renderDetail = (props) => {
        const { productName, productDescription, GMDN } = props.data.itemDescription || {}

        return (
            <div
                style={{
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    padding: '15px',
                    marginTop: '10px',
                    backgroundColor: '#fdfdfd',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <b style={{ width: '150px', color: '#333' }}>Line Item:</b>
                    <span style={{ color: '#257070', fontWeight: 'bold' }}>{props.data.lineItem}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <b style={{ width: '150px', color: '#333' }}>Product Name:</b>
                    <span style={{ color: '#257070', fontWeight: 'bold' }}>{productName}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <b style={{ width: '150px', color: '#333' }}>Product Description:</b>
                    <span>{productDescription}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <b style={{ width: '150px', color: '#333' }}>GMDN:</b>
                    <span>{GMDN}</span>
                </div>
            </div>
        )
    }

    const [activeTab, setActiveTab] = useState('working')

    const filteredData = useMemo(() => {
        const filteredItems =
            activeTab === 'all'
                ? vendorLineItem
                : vendorLineItem.filter((item) => item.status.toLowerCase() === activeTab.toLowerCase())

        console.log(`Filtering for tab: ${activeTab}`)
        console.log(`Total items: ${filteredItems.length}`)
        return filteredItems
    }, [activeTab, vendorLineItem])

    const CustomDataGrid = ({ dataSource, onRowExpand, handleFileClick, renderDetail }) => (
        <div className="lineItem-datagrid">
            {/* <CustomDataGrid
                            dataSource={filteredData}
                            onRowExpand={onRowExpand}
                            handleFileClick={handleFileClick}
                            renderDetail={renderDetail}
                        /> */}
            <DataGrid
                dataSource={filteredData}
                keyExpr="lineItem"
                width="100%"
                showBorders={true}
                rowAlternationEnabled={true}
                highlightChanges={true}
                searchPanel={false}
            >
                <Paging enabled={false} />
                <Selection mode="multiple" selectAllMode={allMode} showCheckBoxesMode={checkBoxesMode} />
                <Paging enabled={true} />
                <SearchPanel visible={true} />
                <Paging defaultPageSize={10} />
                <Pager visible={true} allowedPageSizes={pageSizes} showPageSizeSelector={true} />

                <Column
                    type="buttons"
                    caption="Actions"
                    buttons={[
                        {
                            hint: 'Toggle Details',
                            icon: 'add',
                            onClick: onRowExpand,
                        },
                        {
                            hint: 'Open Modal',
                            icon: 'file',
                            onClick: handleFileClick,
                        },
                    ]}
                />

                <Column dataField="clientName" caption="Client" />
                <Column dataField="itemDescription.productName" caption="Item Description" />
                <Column dataField="amount" format="currency" caption="Amount" />
                <Column dataField="taxCate" caption="Tax Category" />

                <Summary>
                    <TotalItem column="amount" summaryType="sum" valueFormat="currency" />
                </Summary>
                <MasterDetail enabled={false} render={renderDetail} />
            </DataGrid>
            <Popup
                visible={popupVisible}
                onHiding={handleClosePopup}
                dragEnabled={true}
                showTitle={true}
                title="Row Details"
                width={600}
                height={350}
            >
                <div style={{ padding: '20px', lineHeight: '1.8' }}>
                    <p>
                        <b>line item:</b> {selectedRowData?.lineItem}
                    </p>
                    <p>
                        <b>Client:</b> {selectedRowData?.clientName}
                    </p>
                    <p>
                        <b>Amount:</b> ${selectedRowData?.amount?.toFixed(2)}
                    </p>
                    <p>
                        <b>Tax category:</b> {selectedRowData?.taxCate}
                    </p>
                    {/* <p>
                <b>Original Item Desc:</b> {selectedRowData?.OriginalItemDesc}
            </p>
            <p>
                <b>Amount:</b> ${selectedRowData?.Amount?.toFixed(2)}
            </p>
            <p>
                <b>GL:</b> {selectedRowData?.GL}
            </p>
            <p>
                <b>Score:</b> {selectedRowData?.Score}
            </p>
            <p>
                <b>Rule:</b> {selectedRowData?.Rule}
            </p>
            <p>
                <b>AiGPT:</b> {selectedRowData?.AiGPT}
            </p>
            <p>
                <b>AiML:</b> {selectedRowData?.AiML}
            </p> */}
                </div>
            </Popup>
        </div>
    )
    const onRowExpand = (e) => {
        const dataGrid = e.component
        const isExpanded = dataGrid.isRowExpanded(e.row.key)
        if (isExpanded) {
            dataGrid.collapseRow(e.row.key)
        } else {
            dataGrid.expandRow(e.row.key)
        }
    }
    const renderDetailLineItem = (props) => {
        return (
            <div
                style={{
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    padding: '15px',
                    marginTop: '10px',
                    backgroundColor: '#fdfdfd',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <b style={{ width: '150px', color: '#333' }}>Item Number:</b>
                    <span style={{ color: '#257070', fontWeight: 'bold' }}>{props.data.itemNum}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <b style={{ width: '150px', color: '#333' }}>Item Description:</b>
                    <span style={{ color: '#257070', fontWeight: 'bold' }}>{props.data.itemDescription}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <b style={{ width: '150px', color: '#333' }}>Client GL:</b>
                    <span>{props.data.clientGL}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <b style={{ width: '150px', color: '#333' }}>State:</b>
                    <span>{props.data.state}</span>
                </div>
            </div>
        )
    }
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const onSelectionChanged = useCallback(({ selectedRowKeys: changedRowKeys }) => {
        setSelectedRowKeys(changedRowKeys) // อัปเดตค่าแถวที่เลือก
        const selectedAsString = changedRowKeys.join(',') // แปลงเป็น string คั่นด้วย comma
        localStorage.setItem('selectedRows', JSON.stringify(changedRowKeys)) // เก็บใน Local Storage
    }, [])
    const renderDataGrid = (dataSource) => (
        <div style={{ padding: '10px', backgroundColor: '#fff' }}>
            <Button text="Reset" type="default" stylingMode="text" onClick={onStateResetClick} />
            <div style={{ padding: '5px', backgroundColor: '#fff' }}>
                <DataGrid
                    dataSource={dataSource}
                    allowColumnResizing={true}
                    allowColumnReordering={true}
                    width="100%"
                    showBorders={true}
                    keyExpr="pkObj_LineItem"
                    ref={dataGridRef}
                    showRowLines={true}
                    rowAlternationEnabled={true}
                    onSelectionChanged={onSelectionChanged}
                >
                    <Selection mode="multiple" />
                    <Paging defaultPageSize={10} />
                    <FilterRow visible={true} />
                    <GroupPanel visible={true} />
                    <StateStoring enabled={true} type="localStorage" storageKey="storage" />
                    <Pager visible={true} showPageSizeSelector={true} allowedPageSizes={allowedPageSizes} />
                    <Column
                        type="buttons"
                        buttons={[
                            {
                                hint: 'Toggle Details',
                                icon: 'add',
                                onClick: onRowExpand,
                            },
                            {
                                hint: 'Open Modal',
                                icon: 'file',
                                onClick: handleLineItemFileClick,
                            },
                        ]}
                    />

                    <Column dataField="clientCode" caption="Client" width={130} />
                    <Column dataField="genericVD" caption="Generic VD" />
                    <Column dataField="invoiceNum" caption="Invoice" />
                    <Column dataField="genericGLs" caption="Generic GLs" />
                    <Column dataField="amountPaid" alignment="right" format="currency" />
                    <Summary>
                        <TotalItem column="amountPaid" summaryType="sum" valueFormat="currency" />
                    </Summary>
                    <MasterDetail enabled={false} render={renderDetailLineItem} />
                </DataGrid>
                <Popup
                    visible={popupVisible}
                    onHiding={handleClosePopup}
                    dragEnabled={true}
                    showTitle={true}
                    title="Line Item Details"
                    width={650}
                    height={500}
                >
                    <div style={{ padding: '20px', lineHeight: '1.5' }}>
                        {selectedRowData ? (
                            <>
                                <p>
                                    <b>Client Code:</b> {selectedRowData.clientCode}
                                </p>

                                <p>
                                    <b>Invoice Number:</b> {selectedRowData.invoiceNum}
                                </p>
                                <p>
                                    <b>GL Description:</b> {selectedRowData.genericGLs}
                                </p>
                                <p>
                                    <b>Amount Paid:</b> ${selectedRowData.amountPaid?.toFixed(2)}
                                </p>
                                <p>
                                    <b>Item Number:</b> {selectedRowData.itemNum}
                                </p>
                                <p>
                                    <b>Item Description:</b> {selectedRowData.itemDescription}
                                </p>

                                <p>
                                    <b>Last Updated:</b> {selectedRowData.lastUpdated}
                                </p>

                                <p>
                                    <b>Batch:</b> {selectedRowData.batch}
                                </p>
                                <p>
                                    <b>Client GL:</b> {selectedRowData.clientGL}
                                </p>
                                <p>
                                    <b>State:</b> {selectedRowData.state}
                                </p>
                            </>
                        ) : (
                            <p>No data selected.</p>
                        )}
                    </div>
                </Popup>
            </div>
        </div>
    )

    return (
        <div>
            <TabPanel onSelectionChanged={(e) => setActiveTab(e.addedItems[0].title.toLowerCase())}>
                <Item title="Queue">{renderDataGrid(queueData)}</Item>
                <Item title="Done">{renderDataGrid(doneData)}</Item>
                <Item title="All">{renderDataGrid(allData)}</Item>
            </TabPanel>
        </div>
    )
}

export default Content3
