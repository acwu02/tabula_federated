import { useState } from 'react';

function ReturnHome({ onReturnHome }) {

    return (
        <button id="return-home" onClick={onReturnHome}>Return Home</button>
    )
}

export default ReturnHome;