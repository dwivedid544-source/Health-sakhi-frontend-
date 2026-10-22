import React from 'react';
import { Navigate } from 'react-router-dom';

const MeditationScreen = () => {
  return <Navigate to="/app/books" replace />;
};

export default MeditationScreen;
