import React, { useRef, useEffect, useState } from 'react';
import apiRequest from '../api/clientRequest';
import Board from './Board';
import Image from './Image';
import LinkForm from './LinkForm';
import ReturnHome from './ReturnHome';
import Explore from './Explore';
import '../css/App.css';

function Content({ user, onSetUser }) {

    const fileInputRef = useRef(null);
    const [images, setImage] = useState([]);
    const [texts, setText] = useState([]);
    const [links, setLink] = useState([]);
    const [imageHeight, setImageHeight] = useState(0);
    const [imageWidth, setImageWidth] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showOverlay, setShowOverlay] = useState(false);
    const [isUploadingLink, setIsUploadingLink] = useState(false);
    const [isAtHome, setIsAtHome] = useState(true);

    useEffect(() => {

        if (fileInputRef.current) {
            fileInputRef.current.addEventListener('change', handleFileSelect);
        }

        if (user) {
            fetchContent(user);
        }

        uploadImage(selectedFile);

        return () => {
            if (fileInputRef.current) {
                fileInputRef.current.removeEventListener('change', handleFileSelect);
            }
        };

    }, [user, imageHeight, imageWidth]);

    const handleTextClick = () => {
        const newText = "";
        uploadText(newText);
    }

    const handleImageClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    const handleLinkClick = async () => {
        setIsUploadingLink(true);
        setShowOverlay(true);
    }

    // TODO implement more robust checking
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            readFile(e, file);
            // uploadImage(selectedFile);
        } else {
            console.error('No file selected');
        }
    }

    const readFile = (e, selectedFile, setDimensions) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataURL = e.target.result;
            getImageDimensions(dataURL);
        }
        reader.readAsDataURL(selectedFile);
    }

    const getImageDimensions = (dataURL) => {
        const img = new window.Image();
        img.onload = () => {
            const height = img.naturalHeight;
            const width = img.naturalWidth;
            setImageHeight(height);
            setImageWidth(width);
        };
        img.src = dataURL;
    }

    const uploadImage = async (newImage) => {
        if (!selectedFile) return;
        const metadata = new FormData();
        metadata.append("file", newImage);
        metadata.append("height", imageHeight);
        metadata.append("width", imageWidth);
        await apiRequest('POST', `${port}/content/upload/image`, metadata);
        setSelectedFile(null);
        fetchContent();
    }

    const uploadText = async (text) => {
        await apiRequest('POST', `${port}/content/upload/text`, { text: text });
        fetchContent();
    }

    const uploadLink = async (data) => {
        await apiRequest('POST', `${port}/content/upload/link`, { data: data });
        setShowOverlay(false);
        setIsUploadingLink(false);
        fetchContent();
    }

    // TODO decompose
    const fetchContent = async () => {
        const port = user.service[0].serviceEndpoint;
        console.log(port);
        const updatedContent = await apiRequest('GET', `${port}/content`);
        const newImages = updatedContent.response.images.map(image => ({
            x: image.x,
            y: image.y,
            filename: image.filename,
            id: image.image_id,
            height: image.height,
            width: image.width
        }));
        setImage(newImages);
        const newTexts = updatedContent.response.texts.map(text => ({
            x: text.x,
            y: text.y,
            content: text.content,
            id: text.text_id,
            height: text.height,
            width: text.width
        }));
        setText(newTexts);
        const newLinks = updatedContent.response.links.map(link => ({
            x: link.x,
            y: link.y,
            id: link.link_id,
            anchoring: link.anchoring,
            outgoing: link.outgoing
        }));
        setLink(newLinks);
    }

    const onSetImage = async (coords, filename) => {
        // TODO use id instead of filename?
        await apiRequest('PUT', `/content/${user.id}/image/update-position/${filename}`, { newCoords: coords });
    }

    const onSetText = async (coords, textID) => {
        await apiRequest('PUT', `/content/${user.id}/text/update-position/${textID}`, { newCoords: coords });
    }

    const updateTextContent = async (newText, textID) => {
        await apiRequest('PUT', `/content/${user.id}/text/update-content/${textID}`, { newText: newText });
    }

    const onResizeImage = async (newSize, filename) => {
        await apiRequest('PUT', `/content/${user.id}/image/update-size/${filename}`, { newSize: newSize });
    }

    const onResizeText = async (newSize, textID) => {
        await apiRequest('PUT', `/content/${user.id}/text/update-size/${textID}`, { newSize: newSize });
    }

    const onSetLink = async (newCoords, linkID) => {
        await apiRequest('PUT', `/content/${user.id}/link/update-position/${linkID}`, { newCoords: newCoords });
    }

    const onReturnHome = () => {
        alert("Returning home");
        setIsAtHome(true);
    }

    const onExplore = () => {
        alert("Exploring");
        setIsAtHome(false);
    }

    return (
        <div>
            {showOverlay && (
                <div className="overlay"></div>
            )}
            {isUploadingLink && (
                <LinkForm uploadLink={uploadLink} />
            )}
            {!isAtHome && (
                <ReturnHome onReturnHome={onReturnHome} />
            )}
            {isAtHome && (
                <Explore onExplore={onExplore} />
            )}
            {isAtHome &&
                <div id="sidebar">
                    <button id="text" onClick={handleTextClick}>Text</button>
                    <form id="uploadFile" encType="multipart/form-data">
                        <input type="file" name="file" id="fileInput" ref={fileInputRef} hidden />
                    </form>
                    <button id="image" onClick={handleImageClick}>Image</button>
                    <button id="link" onClick={handleLinkClick}>Link</button>
                </div>
            }
            <div id="content">
                <Board
                    images={images}
                    texts={texts}
                    links={links}
                    onSetImage={onSetImage}
                    onSetText={onSetText}
                    updateTextContent={updateTextContent}
                    onResizeImage={onResizeImage}
                    onResizeText={onResizeText}
                    onSetLink={onSetLink}
                    user={user}
                />
            </div>
        </div>
    );
}

export default Content;