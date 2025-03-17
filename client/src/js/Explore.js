import { useState } from 'react';

function Explore({ onExplore }) {

    return (
        <button id="explore" onClick={onExplore}>Explore</button>
    )
}

export default Explore;