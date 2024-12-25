import React, { useState, useEffect } from 'react'
import Rating from '@mui/material/Rating'
import { Box } from '@mui/material'
import TextBox from 'devextreme-react/text-box'
import { Form, GroupItem } from 'devextreme-react/form'
import TextArea from 'devextreme-react/text-area'

const VendorFormIndex = ({ vendor }) => {
    // State สำหรับ Rating
    const [ratingValue, setRatingValue] = useState(0)

    useEffect(() => {
        if (vendor?.Rating !== undefined) {
            setRatingValue(vendor.Rating)
            console.log('Updated Rating:', vendor.Rating)
        }
    }, [vendor])

    // ฟังก์ชันฟอร์แมตตัวเลข
    const formatNumber = (value) => {
        return value?.toLocaleString('en-US') || ''
    }

    return (
        <Form colCount={24} formData={vendor}>
            <GroupItem colSpan={20}>
                <TextBox value={vendor?.Pods || ''} label="pods" labelMode="outside" />
                <TextArea
                    value={vendor?.Notes || ''}
                    label="Analyst Notes"
                    labelMode="outside"
                    autoResizeEnabled={true}
                    height={120}
                />
            </GroupItem>

            <GroupItem colSpan={4}>
                <TextBox
                    value={formatNumber(vendor?.LineItem)}
                    label="line Items"
                    labelMode="outside"
                    inputAttr={{ style: { textAlign: 'right' } }}
                    buttons={[
                        {
                            name: 'customIcon',
                            location: 'after',
                            options: {
                                icon: 'tags',
                                type: 'success',
                                stylingMode: 'text',
                                cssClass: 'custom-icon',
                                onClick: () => alert('Icon clicked!'),
                            },
                        },
                    ]}
                />
               
                <TextBox
                    value={formatNumber(vendor?.AmountPaid)}
                    label="amount Paid"
                    labelMode="outside"
                    inputAttr={{ style: { textAlign: 'right' } }}
                />

                <Box sx={{ '& > legend': { mt: 2 } }}>
                    <Rating
                        name="simple-controlled"
                        value={ratingValue}
                        onChange={(event, newValue) => {
                            setRatingValue(newValue || 0)
                            console.log('New Rating Value:', newValue)
                        }}
                    />
                </Box>
            </GroupItem>
        </Form>
    )
}

export default VendorFormIndex
