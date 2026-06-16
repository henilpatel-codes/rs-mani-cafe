import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');

        setProfile(data);
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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

          {loading && <p>Loading profile...</p>}

          <p>
            <strong>Name:</strong> {profile?.name || 'Loading...'}
          </p>

          <p>
            <strong>Email:</strong> {profile?.email || 'Loading...'}
          </p>

          <p>
            <strong>Phone:</strong> {profile?.phone || 'Not Added'}
          </p>

          <hr style={{ margin: '20px 0' }} />

          <h3>Saved Addresses</h3>

          {profile?.addresses?.length === 0 ? (
            <p>No saved addresses yet.</p>
          ) : (
            profile?.addresses?.map((address) => (
              <div
                key={address._id}
                style={{
                  border: '1px solid #e8d5c0',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '12px',
                }}
              >
                <strong>{address.label}</strong>

                {address.isDefault && (
                  <span
                    style={{
                      marginLeft: '10px',
                      color: 'green',
                      fontWeight: 'bold',
                    }}
                  >
                    Default
                  </span>
                )}

                <p>{address.fullAddress}</p>

                <p>
                  {address.city} {address.state} {address.pincode}
                </p>
              </div>
            ))
          )}

        </div>
      </div>
    </div>
  );
}