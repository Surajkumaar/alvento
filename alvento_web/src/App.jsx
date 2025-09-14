import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Work from './pages/Work';

// A simple layout component to wrap pages with the Navbar
function Layout() {
  return (
    <>
      <Outlet /> {/* This will render the matched route's component */}
      <Navbar />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="work" element={<Work />} />
      </Route>
    </Routes>
  );
}

export default App;
