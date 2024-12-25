import React, { useState, useEffect } from 'react'
import Rating from '@mui/material/Rating'
import { Box } from '@mui/material'
import TextBox from 'devextreme-react/text-box'
import { Form, GroupItem } from 'devextreme-react/form'
import TextArea from 'devextreme-react/text-area'
import { Button } from 'devextreme-react/button'

const FormSite = ({ vendor }) => {
    const [buttonType, setButtonType] = useState('danger')

    useEffect(() => {
        if (vendor?.IsVerified) {
            setButtonType('danger')
        } else {
            setButtonType('normal')
        }
    }, [vendor])

    const formatNumber = (value) => {
        return value?.toLocaleString('en-US') || ''
    }
    const handleClick = (action) => {
        alert(`You clicked ${action}`)
    }
    return (
        <Form colCount={24} formData={vendor}>
            <GroupItem colSpan={22}>
                <TextArea
                    value={vendor.Notes3 || ''}
                    label="notes"
                    labelMode="outside"
                    autoResizeEnabled={true}
                    height={160}
                    style={{ width: '100%', padding: '0px', borderRadius: '5px' }}
                />
            </GroupItem>

            <GroupItem colSpan={2}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '7px',
                        marginTop: '32px',
                    }}
                >
                    <Button
                        width={50}
                        height={40}
                        icon="refresh"
                        type="normal"
                        stylingMode="text"
                        hint="Refresh"
                        onClick={() => handleClick('Refresh')}
                    />
                    <Button
                        width={50}
                        height={40}
                        icon="like"
                        type={buttonType}
                        stylingMode="text"
                        hint="Like"
                        onClick={() => handleClick('Like')}
                    />

                    <label style={{ marginTop: '8px', fontSize: '16px', color: '#666' }}>{vendor.Dayleft}d</label>
                </div>
            </GroupItem>
        </Form>
    )
}

export default FormSite
