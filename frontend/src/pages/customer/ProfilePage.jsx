import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';

const styles = {
  page: {
    minHeight: '100vh',
    background: '#fdf6ec',
    fontFamily: 'DM Sans, sans-serif',
  },
  container: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '40px 20px 60px',
  },
  pageTitle: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '30px',
    fontWeight: 700,
    color: '#1a0f05',
    marginBottom: '8px',
    letterSpacing: '-0.3px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#9e7b5a',
    marginBottom: '32px',
    fontWeight: 400,
  },
  card: {
    background: '#fff',
    border: '1px solid #ecdec8',
    borderRadius: '20px',
    padding: '28px 28px',
    boxShadow: '0 4px 20px rgba(90,50,10,0.07)',
    marginBottom: '24px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    color: '#c47c3a',
    marginBottom: '16px',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
  },
  profileField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  profileFieldLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#b08060',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  profileFieldValue: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#1a0f05',
  },
  avatarWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #f0e4d0',
  },
  avatar: {
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #c47c3a 0%, #8b4a1c 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: 700,
    color: '#fff',
    fontFamily: 'Playfair Display, serif',
    flexShrink: 0,
  },
  avatarName: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '20px',
    fontWeight: 700,
    color: '#1a0f05',
    marginBottom: '2px',
  },
  avatarEmail: {
    fontSize: '13px',
    color: '#9e7b5a',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #f0e4d0',
    margin: '24px 0',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '16px',
  },
  formGridFull: {
    gridColumn: '1 / -1',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  inputLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#b08060',
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #e6d2b8',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1a0f05',
    background: '#fdf8f2',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #c47c3a 0%, #9c5c20 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer',
    letterSpacing: '0.2px',
    transition: 'opacity 0.2s, transform 0.1s',
    boxShadow: '0 3px 10px rgba(160,80,20,0.25)',
  },
  btnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'transparent',
    color: '#c47c3a',
    border: '1.5px solid #c47c3a',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
  },
  btnDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'transparent',
    color: '#b94040',
    border: '1.5px solid #e8b8b8',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
  },
  addressCard: {
    border: '1.5px solid #ecdec8',
    borderRadius: '14px',
    padding: '18px 20px',
    marginBottom: '14px',
    background: '#fffcf8',
    transition: 'box-shadow 0.2s',
    position: 'relative',
  },
  addressCardDefault: {
    border: '1.5px solid #c47c3a',
    background: '#fff8f0',
  },
  addressCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  addressLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 700,
    color: '#1a0f05',
    background: '#f2e8da',
    padding: '4px 10px',
    borderRadius: '20px',
  },
  defaultBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#9c5c20',
    background: 'linear-gradient(135deg, #fde8cc 0%, #f8d4a8 100%)',
    border: '1px solid #e8b87a',
    padding: '4px 10px',
    borderRadius: '20px',
    letterSpacing: '0.3px',
  },
  addressText: {
    fontSize: '14px',
    color: '#4a3020',
    lineHeight: '1.55',
    marginBottom: '4px',
  },
  addressMeta: {
    fontSize: '13px',
    color: '#9e7b5a',
    marginBottom: '14px',
  },
  addressActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 20px',
    color: '#b08060',
  },
  emptyIcon: {
    fontSize: '36px',
    marginBottom: '10px',
  },
  emptyText: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#9e7b5a',
    marginBottom: '4px',
  },
  emptySubtext: {
    fontSize: '13px',
    color: '#c4a882',
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  skeletonLine: {
    height: '16px',
    background: 'linear-gradient(90deg, #f0e6d6 25%, #e8d8c4 50%, #f0e6d6 75%)',
    backgroundSize: '200% 100%',
    borderRadius: '6px',
    animation: 'shimmer 1.4s infinite',
  },
};

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getLabelIcon = (label) => {
  const l = label?.toLowerCase();
  if (l === 'home') return '🏠';
  if (l === 'work' || l === 'office') return '💼';
  return '📍';
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [focusedInput, setFocusedInput] = useState(null);

  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    fullAddress: '',
    city: '',
    state: '',
    pincode: '',
  });

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

  const handleAddAddress = async () => {
    try {
      if (!addressForm.fullAddress.trim()) {
        alert('Please enter address');
        return;
      }

      const { data } = await api.post('/users/addresses', addressForm);

      setProfile((prev) => ({
        ...prev,
        addresses: data,
      }));

      setAddressForm({
        label: 'Home',
        fullAddress: '',
        city: '',
        state: '',
        pincode: '',
      });
    } catch (err) {
      console.error('Add address error:', err);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const { data } = await api.delete(`/users/addresses/${addressId}`);

      setProfile((prev) => ({
        ...prev,
        addresses: data,
      }));
    } catch (err) {
      console.error('Delete address error:', err);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const { data } = await api.put(`/users/addresses/${addressId}/default`);

      setProfile((prev) => ({
        ...prev,
        addresses: data,
      }));
    } catch (err) {
      console.error('Set default address error:', err);
    }
  };

  const inputStyle = (name) => ({
    ...styles.input,
    ...(focusedInput === name
      ? { borderColor: '#c47c3a', boxShadow: '0 0 0 3px rgba(196,124,58,0.12)' }
      : {}),
  });

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @media (max-width: 560px) {
          .form-grid { grid-template-columns: 1fr !important; }
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={styles.page}>
        <Navbar />

        <div style={styles.container}>
          <h1 style={styles.pageTitle}>My Profile</h1>
          <p style={styles.pageSubtitle}>Manage your account details and saved addresses</p>

          {/* ── Account Details Card ── */}
          <div style={styles.card}>
            <p style={styles.sectionLabel}>Account</p>

            {loading ? (
              <div style={styles.loadingWrap}>
                <div style={{ ...styles.skeletonLine, width: '40%' }} />
                <div style={{ ...styles.skeletonLine, width: '60%' }} />
                <div style={{ ...styles.skeletonLine, width: '35%' }} />
              </div>
            ) : (
              <>
                <div style={styles.avatarWrap}>
                  <div style={styles.avatar}>{getInitials(profile?.name)}</div>
                  <div>
                    <div style={styles.avatarName}>{profile?.name}</div>
                    <div style={styles.avatarEmail}>{profile?.email}</div>
                  </div>
                </div>

                <div
                  className="profile-grid"
                  style={styles.profileGrid}
                >
                  <div style={styles.profileField}>
                    <span style={styles.profileFieldLabel}>Full Name</span>
                    <span style={styles.profileFieldValue}>{profile?.name || '—'}</span>
                  </div>
                  <div style={styles.profileField}>
                    <span style={styles.profileFieldLabel}>Email Address</span>
                    <span style={styles.profileFieldValue}>{profile?.email || '—'}</span>
                  </div>
                  <div style={styles.profileField}>
                    <span style={styles.profileFieldLabel}>Phone Number</span>
                    <span style={styles.profileFieldValue}>
                      {profile?.phone || (
                        <span style={{ color: '#c4a882', fontStyle: 'italic', fontWeight: 400 }}>
                          Not added
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Add New Address Card ── */}
          <div style={styles.card}>
            <p style={styles.sectionLabel}>Add New Address</p>

            <div
              className="form-grid"
              style={styles.formGrid}
            >
              {/* Label */}
              <div style={{ ...styles.inputGroup, ...styles.formGridFull }}>
                <label style={styles.inputLabel}>Address Label</label>
                <input
                  type="text"
                  placeholder="e.g. Home, Work, Other"
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  onFocus={() => setFocusedInput('label')}
                  onBlur={() => setFocusedInput(null)}
                  style={inputStyle('label')}
                />
              </div>

              {/* Full Address */}
              <div style={{ ...styles.inputGroup, ...styles.formGridFull }}>
                <label style={styles.inputLabel}>Full Address</label>
                <input
                  type="text"
                  placeholder="Building, street, area..."
                  value={addressForm.fullAddress}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, fullAddress: e.target.value })
                  }
                  onFocus={() => setFocusedInput('fullAddress')}
                  onBlur={() => setFocusedInput(null)}
                  style={inputStyle('fullAddress')}
                />
              </div>

              {/* City */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>City</label>
                <input
                  type="text"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  onFocus={() => setFocusedInput('city')}
                  onBlur={() => setFocusedInput(null)}
                  style={inputStyle('city')}
                />
              </div>

              {/* State */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>State</label>
                <input
                  type="text"
                  placeholder="State"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  onFocus={() => setFocusedInput('state')}
                  onBlur={() => setFocusedInput(null)}
                  style={inputStyle('state')}
                />
              </div>

              {/* Pincode */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Pincode</label>
                <input
                  type="text"
                  placeholder="6-digit pincode"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                  onFocus={() => setFocusedInput('pincode')}
                  onBlur={() => setFocusedInput(null)}
                  style={inputStyle('pincode')}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddAddress}
              style={styles.btnPrimary}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <span>＋</span> Save Address
            </button>
          </div>

          {/* ── Saved Addresses Card ── */}
          <div style={styles.card}>
            <p style={styles.sectionLabel}>
              Saved Addresses
              {profile?.addresses?.length > 0 && (
                <span
                  style={{
                    marginLeft: '8px',
                    background: '#f2e8da',
                    color: '#9c5c20',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    verticalAlign: 'middle',
                  }}
                >
                  {profile.addresses.length}
                </span>
              )}
            </p>

            {loading ? (
              <div style={styles.loadingWrap}>
                <div style={{ ...styles.skeletonLine, width: '100%', height: '80px', borderRadius: '14px' }} />
                <div style={{ ...styles.skeletonLine, width: '100%', height: '80px', borderRadius: '14px' }} />
              </div>
            ) : profile?.addresses?.length === 0 || !profile?.addresses ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🗺️</div>
                <p style={styles.emptyText}>No saved addresses yet</p>
                <p style={styles.emptySubtext}>Add an address above for faster checkout</p>
              </div>
            ) : (
              profile.addresses.map((address) => (
                <div
                  key={address._id}
                  style={{
                    ...styles.addressCard,
                    ...(address.isDefault ? styles.addressCardDefault : {}),
                  }}
                >
                  <div style={styles.addressCardHeader}>
                    <span style={styles.addressLabel}>
                      {getLabelIcon(address.label)} {address.label}
                    </span>
                    {address.isDefault && (
                      <span style={styles.defaultBadge}>★ Default</span>
                    )}
                  </div>

                  <p style={styles.addressText}>{address.fullAddress}</p>
                  <p style={styles.addressMeta}>
                    {[address.city, address.state, address.pincode].filter(Boolean).join(', ')}
                  </p>

                  <div style={styles.addressActions}>
                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(address._id)}
                        style={styles.btnOutline}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fdf0e4';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        ☆ Set as Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(address._id)}
                      style={styles.btnDanger}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fff0f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      🗑 Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}