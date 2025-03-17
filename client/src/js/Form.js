import React, { useRef, useEffect, useState } from 'react';
import apiRequest from '../api/clientRequest';
import { generateKeyPair } from '../api/crypto';
import bcrypt from 'bcryptjs';
import '../css/App.css';

function Form({ onLogin, loginUser }) {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        // TODO implement checking
        const [username, password] = [formData.username, formData.password];
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const handle = `${username}@tabula.com`;
        if (username.length === 0 || password.length === 0) {
            // TODO beautify error
            console.error("Required fields not filled");
        } else {
            let request = await apiRequest('POST', `${process.env.REACT_APP_BOOTSTRAP_URL}/users/login`, { handle: handle, username: username, hash: hash });
            if (request.response === "incorrectPassword") {
                alert("Incorrect password");
                return;
            }
            const user = request.did;
            onLogin(user);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const [username, password] = [formData.username, formData.password];
        if (password.length < 8) {
            alert("Password must be at least 8 characters long");
            return;
        }
        if (password.length > 72) {
            alert("Password must be less than 72 characters long");
            return;
        }
        if (password.includes(' ') || username.includes(' ')) {
            alert("Username and password must not contain spaces");
            return
        }
        // TODO if password.length === 0, then self-hosting
        console.log(process.env);
        console.log(process.env.REACT_APP_BOOTSTRAP_URL);

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const { publicKey, privateKey } = await generateKeyPair();
        const handle = `${username}@tabula.com`;
        let request = await apiRequest('POST', `${process.env.REACT_APP_BOOTSTRAP_URL}/users/register`, { handle: handle, publicKey: publicKey, hash: hash });
        if (request.success) {
            const user = JSON.parse(request.did);
            const port = user.service[0].serviceEndpoint;
            alert("Registered successfully");
            alert(`Your PDS is running on ${port}`);
            localStorage.setItem('privateKey', JSON.stringify(privateKey));
            onLogin(user);
        } else {
            alert("Registration failed");
        }
    }


    return (
        <form id="login" onSubmit={handleLoginSubmit}>
            <label for="username"></label>
            <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="username" />
            <label for="password"></label>
            <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="password" />
            <button id="loginButton">Login</button>
            <button id="registerButton" onClick={handleRegisterSubmit}>Register</button>
        </form>
    );
}

export default Form;