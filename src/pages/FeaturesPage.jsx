import React from 'react';
import { Link } from 'react-router-dom'; // Use Link for navigation
import './FeaturesPage.css'; 

const Features = () => {
  return (
    <div className="features-container">
      {/* This sidebar matches your app's home page */}
      <div className="features-sidebar">
        <Link to="/">Home</Link>
        <Link to="/features" className="active">Features</Link>
        <Link to="/settings">About</Link> 
      </div>

      <div className="features-content">
        <h1>About TerraTalk</h1>
        <p className="features-intro">
          TerraTalk is a next-generation, voice-activated geospatial application. 
          Speak your destination, explore the world, and get real-time information, all hands-free.
        </p>
        
        <h2>Voice Commands</h2>
        <p>Here are some of the commands you can use. Just click anywhere and speak!</p>
        
        <CommandCategory title="Navigation">
          <Command>"Go to Hyderabad by car"</Command>
          <Command>"Cycle to Goa"</Command>
          <Command>"Go to Mumbai via Pune"</Command>
        </CommandCategory>
        
        <CommandCategory title="Zoom">
          <Command>"Zoom to Chennai"</Command>
          <Command>"Zoom in" / "Zoom out"</Command>
          <Command>"Zoom to my current location"</Command>
          <Command>"Zoom to destination"</Command>
        </CommandCategory>
        
        <CommandCategory title="Map Layers">
          <Command>"Change the map to satellite view"</Command>
          <Command>"Show transport map"</Command>
          <Command>"Show rail map"</Command>
          <Command>"Change map to topographic"</Command>
          <Command>"Add labels to the map"</Command>
        </CommandCategory>

        <CommandCategory title="Map Control & Info">
          <Command>"Move up" / "Go left"</Command>
          <Command>"What is the distance between Delhi and Mumbai?"</Command>
          <Command>"ETA from Mangalore to Bangalore"</Command>
        </CommandCategory>

        
        <CommandCategory title="Sharing & Favourites">
          <Command>"Share my location"</Command>
          <Command>"Send my location to Suhas"</Command>
          <Command>"Save this as a favourite"</Command>
          <Command>"Show my favourites"</Command>
        </CommandCategory>
      </div>
    </div>
  );
};

// Helper components for styling
const CommandCategory = ({ title, children }) => (
  <div className="command-category">
    <h3>{title}</h3>
    <div className="commands-list">
      {children}
    </div>
  </div>
);

const Command = ({ children }) => (
  <div className="command-example">{children}</div>
);

export default Features;
