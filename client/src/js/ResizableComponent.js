import React, { useState, useEffect } from 'react';
import { Resizable, ResizableBox } from 'react-resizable';
import '../css/Resizable.css';

function ResizableComponent({ children, componentSize, updateImgSize }) {
    const [size, setSize] = useState(componentSize);

    const handleResize = (event, { size }) => {
        setSize(size);
        updateImgSize(size);
    };

    return (
        <ResizableBox
            height={size.height}
            width={size.width}
            onResize={handleResize}
            lockAspectRatio={true}
        >
            <div id="resizableWrapper">
                {children}
            </div>
        </ResizableBox>
    );
}

export default ResizableComponent;
