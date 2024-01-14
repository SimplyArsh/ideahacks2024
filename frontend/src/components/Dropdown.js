import React from 'react'
import Dropdown from 'react-bootstrap/Dropdown';
import '../index.css'

const Dropdown = () => {

    const handleOneItem = () => {

    }

    const handleTwoItems = () => {

    }

    const handleThreeItems = () => {

    }

    return (
        <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
            Item Count
        </Dropdown.Toggle>

        <Dropdown.Menu>
            <Dropdown.Item onClick={handleOneItem}>1</Dropdown.Item>
            <Dropdown.Item onClick={handleTwoItems}>2</Dropdown.Item>
            <Dropdown.Item onClick={handleThreeItems}>3</Dropdown.Item>
        </Dropdown.Menu>
        </Dropdown>
    )
}
export default Dropdown