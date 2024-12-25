import React, { useState } from 'react'
import { simpleProducts, vendorsData } from '../../components/datajson/data'
import { SelectBox } from 'devextreme-react/select-box'

const ProductListboxSlide = ({ onSelectVendor }) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const handleSelect = (vendor) => {
        onSelectVendor(vendor)
    }

    const handleNext = () => {
        setSelectedIndex((prevIndex) => (prevIndex + 1) % simpleProducts.length)
        handleSelect(vendorsData[(selectedIndex + 1) % simpleProducts.length])
    }

    const handlePrevious = () => {
        setSelectedIndex((prevIndex) => (prevIndex - 1 + simpleProducts.length) % simpleProducts.length)
        handleSelect(vendorsData[(selectedIndex - 1 + simpleProducts.length) % simpleProducts.length])
    }

    return (
        <div className="dx-field">
            <div className="custom-select-box-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                <button
                    onClick={handlePrevious}
                    style={{
                        padding: '10px',
                        marginRight: '5px',
                        cursor: 'pointer',
                        border: 'none',
                        background: '#8e44ad',
                        color: 'white',
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        height: '32px',
                    }}
                >
                    <i className="dx-icon dx-icon-chevronleft"></i>
                </button>

                <SelectBox
                    items={simpleProducts}
                    width={400}
                    value={simpleProducts[selectedIndex]}
                    onValueChanged={(e) => {
                        const index = simpleProducts.indexOf(e.value)
                        if (index !== -1) {
                            setSelectedIndex(index)
                            // เมื่อเลือกผลิตภัณฑ์ใหม่ หา vendor ที่สอดคล้องกันจาก vendorsData
                            const selectedVendor = vendorsData[index]
                            handleSelect(selectedVendor)
                        } 
                    }}
                />

                <button
                    onClick={handleNext}
                    style={{
                        padding: '10px',
                        marginLeft: '5px',
                        cursor: 'pointer',
                        border: 'none',
                        background: '#8e44ad',
                        color: 'white',
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        height: '32px',
                    }}
                >
                    <i className="dx-icon dx-icon-chevronright"></i>
                </button>
            </div>
        </div>
    )
}

export default ProductListboxSlide
