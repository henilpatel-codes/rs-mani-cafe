import React from 'react';
import Navbar from '../../components/Navbar';

export default function ProfilePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fdf6ec',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <Navbar />

      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        <h1
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '28px',
            fontWeight: 700,
            color: '#1a0f05',
          }}
        >
          My Profile
        </h1>

        <div
          style={{
            marginTop: '20px',
            background: '#fff',
            border: '1px solid #e8d5c0',
            borderRadius: '16px',
            padding: '20px',
          }}
        >
          Profile Page Working 🚀
        </div>
      </div>
    </div>
  );
}