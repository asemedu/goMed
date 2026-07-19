import React from 'react';
// Importing this registers the <model-viewer> HTML tag
import '@google/model-viewer';

export default function ARApp() {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f0f0f0' }}>

      {/* Title Area */}
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'sans-serif', margin: 0 }}>First Aid AR</h1>
        <p style={{ fontFamily: 'sans-serif', color: '#555' }}>Study the CPR movement.</p>
      </div>

      {/*
        Google's Web Component.
        It handles the OS-level camera API for both Apple and Android natively!
      */}
      <model-viewer
        src="/assets/New-CPR-dummy.glb"           // What Android uses
        ios-src="/assets/New-CPR-dummy.usdz"      // What iPhone uses
        ar                             // Tells the browser to enable AR capabilities
        ar-modes="webxr scene-viewer quick-look" // The fallback order for different phones
        camera-controls                // Lets the user rotate it on screen before entering AR
        autoplay                       // Automatically plays your Mixamo animation!
        shadow-intensity="1"
        style={{ width: '100%', flex: 1 }}
      >
        {/* The custom button the user taps to open the camera */}
        <button
          slot="ar-button"
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '15px 30px',
            fontSize: '18px',
            borderRadius: '8px',
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          View Dummy on Floor (AR)
        </button>
      </model-viewer>

    </div>
  );
}