import React from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

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
            padding: '24px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          }}
        >
          <h2
            style={{
              marginBottom: '20px',
              color: '#1a0f05',
            }}
          >
            Account Details
          </h2>

          <p>
            <strong>Name:</strong> {user?.name || 'Not Available'}
          </p>

          <p>
            <strong>Email:</strong> {user?.email || 'Not Available'}
          </p>

          <p>
            <strong>Phone:</strong> {user?.phone || 'Not Added'}
          </p>

          <p>
            <strong>Role:</strong> {user?.role || 'Customer'}
          </p>
        </div>
      </div>
    </div>
  );
}