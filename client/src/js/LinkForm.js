import { useState } from 'react';

function LinkForm({ uploadLink }) {
    const [formData, setFormData] = useState({
        anchoringText: '',
        outgoingUrl: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleLinkSubmit = (e) => {
        e.preventDefault();
        if (formData.anchoringText.length === 0 || formData.outgoingUrl.length === 0) {
            // TODO beautify error
            console.error("Required fields not filled");
        } else {
            uploadLink(formData);
        }
    }

    return (
        <form id="link-form" onSubmit={handleLinkSubmit}>
            <label htmlFor="anchoringText"></label>
            <input
                type="text"
                id="anchoringText"
                name="anchoringText"
                value={formData.text}
                onChange={handleInputChange}
                placeholder="text" />
            <label htmlFor="outgoingUrl"></label>
            <input
                type="text"
                id="outgoingUrl"
                name="outgoingUrl"
                value={formData.outgoingUrl}
                onChange={handleInputChange}
                placeholder="outgoing url" />
            <button id="loginButton">Submit</button>
        </form>
    )

}

export default LinkForm;