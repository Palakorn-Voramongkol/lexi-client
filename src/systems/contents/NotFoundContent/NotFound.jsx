import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css'; // Add styles for the 404 page

const NotFound = () => {
    return (
        <div className="error-page">
            <div className="error-content">
                <div className="error-icon">
                    <span role="img" aria-label="Sad face">😔</span>
                </div>
                <h1>404</h1>
                <h2>Page not found</h2>
                <p>The resource requested could not be found on the server!</p>
                <Link to="/" className="home-button">Go to the homepage</Link>
            </div>
        </div>
    );
};

export default NotFound;
