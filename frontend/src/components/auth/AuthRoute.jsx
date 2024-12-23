import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AuthRoute = ({ children }) => {
    const { user } = useSelector(store => store.auth);
    
    if (!user) {
        return <Navigate to="/login" replace={true} />;
    }
    
    // Pass userId to children
    return React.cloneElement(children, { userId: user._id });
};

export default AuthRoute;