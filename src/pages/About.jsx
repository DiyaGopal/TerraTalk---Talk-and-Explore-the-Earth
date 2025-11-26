import React from 'react';
import { Link } from 'react-router-dom';
import './About.css'; // We will create this CSS file next

const About = () => {
  return (
    <div className="about-container">
      {/* This sidebar matches your app's theme */}
      <div className="about-sidebar">
        <Link to="/">Home</Link>
        <Link to="/features">Features</Link>
        <Link to="/about" className="active">About</Link> 
      </div>

      <div className="about-content">
        <h1>About TerraTalk</h1>
        <p className="about-intro">
          TerraTalk is a voice-first geospatial application designed to
          redefine how you interact with the world. Built for accessibility 
          and ease of use, it allows you to navigate, explore, and get 
          real-time information, all hands-free.
        </p>
        
        <h2>Our Mission</h2>
        <p>
          Our mission is to create a seamless and intuitive navigation 
          experience, making geospatial data accessible to everyone, 
          everywhere, simply by speaking.
        </p>
        
        <h2>Meet the Team</h2>
        <p>
          We are a team of passionate student developers from 
          St. Joseph Engineering College, Mangaluru.
        </p>
        
        <div className="team-grid">
          <div className="team-member">Diya Gopal</div>
          <div className="team-member">Manvish M K</div>
          <div className="team-member">Rijish A G</div>
          <div className="team-member">Akshay Bangera</div>
        </div>
        
      </div>
    </div>
  );
};

export default About;
