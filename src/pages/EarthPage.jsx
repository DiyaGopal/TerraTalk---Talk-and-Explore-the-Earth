import React from "react";
import { Link } from "react-router-dom";
import Earth from "../components/Earth";
import VoiceController from "../components/VoiceController"; // Re-import VoiceController remains

// Data for the voice command showcase panels
const featureCommands = [
    { title: "Voice Activated Search", command: "Navigate to Bangalore Via Mysore", icon: "🗺️" },
    { title: "Real Time Map", command: "Start journey and Stop Journey", icon: "📍" },
    { title: "Map Control", command: "Change the map to satellite view", icon: "🛰️" },
];

const EarthPage = () => {
    // Handler for the CTA button
    const handleStartExploring = () => {
        console.log("Start Exploring clicked! Initiating world view.");
        // Navigation logic is handled by <Link to="/map?zoomTo=world">
    };

    return (
        <div style={styles.container}>
            {/* 1. Background Earth Component */}
            <Earth />

            {/* 2. Overlaid Content (Title, CTA, and Showcase) */}
            <div style={styles.overlay}>
                
                {/* Main Heading Panel - Top Aligned */}
                <header style={styles.header}>
                    <h1 style={styles.title}>TerraTalk: Talk and Explore the Earth</h1>
                    <p style={styles.taglineHighlight}>
                        Speak your destination, explore the world.
                    </p>
                </header>

                {/* ⭐ NEW SPACER: This flex-grow element pushes the content below it down */}
                <div style={styles.spacer}></div> 

                {/* MOVED CTA BUTTON: Now positioned between the spacer and the showcase */}
                <Link 
                    to="/map?zoomTo=world" 
                    style={styles.ctaButton}
                    onClick={handleStartExploring} // Optional: Keep handler if needed
                >
                    START EXPLORING NOW
                </Link>

                {/* Voice Command Showcase - Bottom Aligned */}
                <section style={styles.showcaseContainer}>
                    {featureCommands.map((item, index) => (
                        <div key={index} style={styles.showcaseCard}>
                            <div style={styles.cardIcon}>{item.icon}</div>
                            <h3 style={styles.cardTitle}>{item.title}</h3>
                            <p style={styles.cardCommand}>"{item.command}"</p>
                        </div>
                    ))}
                </section>
                
            </div>
        </div>
    );
};

// =========================================================
// === STYLING FOR THE PAGE ===
// =========================================================

const styles = {
    container: { 
        height: "100vh", 
        width: "100vw", 
        backgroundColor: "black",
        position: 'relative',
        fontFamily: "'Orbitron', sans-serif"
    },
    
    overlay: { 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        // ⭐ KEY CHANGE: Changed from 'space-between' to 'flex-start' 
        // to allow the spacer to control the vertical positioning
        justifyContent: 'flex-start',
        alignItems: 'center',
        pointerEvents: 'none'
    },
    
    // ⭐ NEW SPACER STYLE
    spacer: {
        flexGrow: 1, // Takes up all available space between the header and the button
        minHeight: '20vh', // Ensure a minimum space, even if content above/below changes
    },
    
    header: { 
        textAlign: 'center', 
        color: 'white', 
        paddingTop: '0.1vh', 
        pointerEvents: 'auto', 
        marginBottom: '20px' // Space below tagline
    },
    title: { 
        fontSize: '3.0em', 
        marginBottom: '10px',
        textShadow: '0 0 10px rgba(44, 132, 255, 0.5)'
    },
    taglineHighlight: { 
        color: '#2c84ff', 
        fontSize: '1.2em', 
        fontWeight: 'bold',
        marginBottom: '0px',
        textShadow: '0 0 8px #2c84ff80',
    },
    subtitle: { 
        fontSize: '1.4em', 
        marginBottom: '40px', 
        color: '#ccc' 
    },
    ctaButton: { 
        padding: '10px 40px', 
        backgroundColor: '#2c84ff', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '1.2em',
        transition: 'background-color 0.3s, transform 0.1s',
        boxShadow: '0 5px 15px rgba(44, 132, 255, 0.4)',
        pointerEvents: 'auto',
        // Margin below the button to space it from the feature cards
        marginBottom: '3px', 
        '&:hover': {
            backgroundColor: '#005bb5',
            transform: 'scale(1.05)'
        }
    },
    showcaseContainer: {
        marginBottom: '40px', 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '30px',
        pointerEvents: 'auto'
    },
    showcaseCard: { 
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: '5px', 
        borderRadius: '12px', 
        color: 'white', 
        width: '280px',
        textAlign: 'center',
        border: '1px solid #2c84ff55',
        boxShadow: '0 0 15px rgba(44, 132, 255, 0.2)'
    },
    cardIcon: { 
        fontSize: '2.5em', 
        marginBottom: '10px' 
    },
    cardTitle: { 
        margin: '0 0 5px 0', 
        color: '#2c84ff' 
    },
    cardCommand: { 
        margin: 0, 
        fontStyle: 'italic', 
        color: '#aaa',
        fontSize: '0.9em'
    },
    micContainer: {
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        pointerEvents: 'auto'
    }

    
};

export default EarthPage;

