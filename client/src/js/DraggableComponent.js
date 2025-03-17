import React, { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import apiRequest from '../api/clientRequest';

const DraggableComponent = ({ children, onSet, id, x, y, height, width, user }) => {

    const [position, setPosition] = useState({ x: x, y: y });
    const [size, setSize] = useState({ height: height, width: width });
    const nodeRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const innerDivClassName = isHovered ? "hover-border" : "hidden-border";
    const deleteClassName = isHovered ? "hidden" : null;
    const [isDeleted, setIsDeleted] = useState(null);

    const handleMouseEnter = (e) => {
        setSize(size);
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleDrag = (e, ui) => {
        if (isHovered) {
            const { x, y } = ui;
            setPosition({ x, y });
        }
    };

    const handleChildEnter = () => {
        setIsHovered(false);
    }

    const handleChildLeave = () => {
        setIsHovered(true);
    }

    const handleStop = () => {
        onSet(position, id);
    }

    // TODO figure out API route for deletion?
    const onDelete = () => {
        setIsDeleted(true);
    }

    // TODO fix wack jsx
    return (
        <Draggable
            nodeRef={nodeRef}
            onDrag={handleDrag}
            onStop={handleStop}
            position={position}
            disabled={!isHovered}
            cancel={".react-resizable-handle"}
            height={size.height}
            width={size.width}>
            <div ref={nodeRef}
                className={innerDivClassName}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                height={size.height}
                width={size.width}>
                <div id="draggableWrapper"
                    onMouseEnter={handleChildEnter}
                    onMouseLeave={handleChildLeave}
                    height={size.height}
                    width={size.width}>
                    <div id="delete-button" className={deleteClassName} onClick={onDelete}>
                        x
                    </div>
                    {React.Children.map(children, (child) => {
                        return React.cloneElement(child, {
                            isDeleted: isDeleted
                        });
                    })}
                </div>
            </div>
        </Draggable >
    );
};

export default DraggableComponent;
