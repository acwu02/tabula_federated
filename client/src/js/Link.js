import { useState, useEffect } from 'react';
import DraggableComponent from './DraggableComponent';

function Link({ text, outgoing, onSet, id, x, y, user, isDeleted }) {

    useEffect(() => {
        console.log("DELETED");
      }, [isDeleted]);

    const parseOutgoingUrl = (outgoingUrl) => {
        if (outgoingUrl.match('https://')) {
            return outgoingUrl;
        } else {
            return `https://${outgoingUrl}`;
        }
    };

    return (
        <DraggableComponent onSet={onSet} id={id} x={x} y={y} user={user} isDeleted={isDeleted}>
            <a href={parseOutgoingUrl(outgoing)}>{text}</a>
        </DraggableComponent>
    )
}

export default Link;