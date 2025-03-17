import React, { useRef, useState, useEffect } from 'react';
import DraggableComponent from './DraggableComponent';
import ResizableComponent from './ResizableComponent';

const Image = ({ source, id, onSet, x, y, height, width, onResize, isDeleted, user }) => {
  const [imgSize, setImgSize] = useState({ height: height, width: width });
  const nodeRef = useRef(null);

  const url = new URL(source);
  const pathname = url.pathname;
  const filename = pathname.split('/').pop();

  // TODO fix deletion
  useEffect(() => {
    console.log("DELETED");
  }, [isDeleted]);

  const updateImgSize = (newSize) => {
    setImgSize(newSize);
    onResize(newSize, filename);
  };

  return (
      <DraggableComponent
        onSet={onSet}
        id={filename}
        x={x}
        y={y}
        height={imgSize.height}
        width={imgSize.width}
        user={user}
        isDeleted={isDeleted}
        style={{
          height: imgSize.height,
          width: imgSize.width
        }}
        >
        <ResizableComponent
          componentSize={imgSize}
          style={{
            height: imgSize.height,
            width: imgSize.width
          }}
          updateImgSize={updateImgSize}>
          <img
            ref={nodeRef}
            className="image"
            src={source}
            alt="Image"
            draggable="false"
            style={{
              height: imgSize.height,
              width: imgSize.width
            }}
          />
        </ResizableComponent>
      </DraggableComponent>
  );
};

export default Image;
