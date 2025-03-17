import React, { useState, useEffect, useRef } from 'react';
import DraggableComponent from './DraggableComponent';

function Text({ onSet, updateTextContent, x, y, id, textContent, onResize, height, width, user, isDeleted }) {
    const [text, setText] = useState(textContent);
    const [textSize, setTextSize] = useState({ height: height, width: width });
    const textareaRef = useRef(null);

    useEffect(() => {
        console.log(textSize);
        const textarea = textareaRef.current;
        let resizeObserver;

        if (textarea && 'ResizeObserver' in window) {
            resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    handleResize(entry.target);
                }
            });

            resizeObserver.observe(textarea);
        }

        console.log("DELETED");

        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    }, [isDeleted]);

    const handleResize = (element) => {
        const width = element.clientWidth;
        const height = element.clientHeight;
        setTextSize({ height, width });
        onResize({ height, width }, id);
    };

    const handleBlur = () => {
        updateTextContent(text, id);
    };

    const handleChange = (e) => {
        setText(e.target.value);
    };

    return (
        <DraggableComponent onSet={onSet} id={id} x={x} y={y} user={user} isDeleted={isDeleted}>
            <textarea
                ref={textareaRef}
                style={{
                    height: textSize.height,
                    width: textSize.width,
                    boxSizing: 'border-box',
                    border: 'none',
                }}
                value={text}
                onBlur={handleBlur}
                onChange={handleChange}
            />
        </DraggableComponent>
    );
}

export default Text;
