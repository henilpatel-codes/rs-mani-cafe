// pages/customer/MenuPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, Minus, Plus, Search, ShoppingBag, SlidersHorizontal, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['All', 'Dosas', 'Idli', 'Beverages', 'Combos', 'Snacks', 'Rice', 'Breads', 'Sweets'];

const CATEGORY_ALIASES = {
  Dosas: ['Dosas', 'Dosa'],
  Idli: ['Idli', 'Idlis'],
  Beverages: ['Beverages', 'Beverage', 'Drinks', 'Drink'],
  Combos: ['Combos', 'Combo'],
  Snacks: ['Snacks', 'Snack'],
  Rice: ['Rice'],
  Breads: ['Breads', 'Bread'],
  Sweets: ['Sweets', 'Sweet', 'Desserts', 'Dessert'],
};

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function matchesCategory(itemCategory, activeCategory) {
  if (activeCategory === 'All') return true;
  return (CATEGORY_ALIASES[activeCategory] || [activeCategory]).includes(itemCategory);
}

function MenuItemCard({
  item,
  onAdd,
  qty,
  onInc,
  onDec,
  isFavorite,
  onToggleFavorite,
  favoriteBusy,
}) {
  const isVeg = item.isVeg !== false;

  return (
    <article className="menu-card">
      <div className="menu-card-media" style={{ position: 'relative' }}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="menu-card-placeholder">🍽️</div>
        )}

        <button
          type="button"
          onClick={() => onToggleFavorite(item)}
          disabled={favoriteBusy}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.75)',
            background: isFavorite ? '#fff1f2' : 'rgba(255,255,255,0.92)',
            color: isFavorite ? '#e11d48' : '#7c5c3e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: favoriteBusy ? 'not-allowed' : 'pointer',
            opacity: favoriteBusy ? 0.7 : 1,
            zIndex: 3,
            boxShadow: '0 8px 22px rgba(0,0,0,0.15)',
          }}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        <span className={`rs-badge ${isVeg ? 'rs-badge-veg' : 'rs-badge-nonveg'} menu-card-badge`}>
          {isVeg ? '● VEG' : '● NON-VEG'}
        </span>

        {!item.isAvailable && <div className="menu-card-overlay">UNAVAILABLE</div>}
      </div>

      <div className="menu-card-body">
        <div className="menu-card-top">
          <h3>{item.name}</h3>
          <span className="menu-price">₹{item.price}</span>
        </div>

        {item.description && <p className="menu-desc">{item.description}</p>}

        {Number(item.avgRating) > 0 && (
          <div className="menu-rating">
            <Star size={14} fill="#f5a623" color="#f5a623" />
            <span>{item.avgRating} {item.reviewCount ? `(${item.reviewCount})` : ''}</span>
          </div>
        )}

        {qty > 0 ? (
          <div className="qty-control" aria-label={`${item.name} quantity`}>
            <button type="button" onClick={onDec} aria-label="Decrease quantity">
              <Minus size={16} />
            </button>
            <span>{qty}</span>
            <button type="button" onClick={onInc} aria-label="Increase quantity">
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="menu-add"
            onClick={() => onAdd(item)}
            disabled={!item.isAvailable}
          >
            <ShoppingBag size={17} /> {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
          </button>
        )}
      </div>
    </article>
  );
}

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteBusyId, setFavoriteBusyId] = useState(null);

  const [searchParams] = useSearchParams();
  const { addItem, updateQty, items: cartItems } = useCart();
  const { user, isCustomer } = useAuth();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    setLoading(true);

    api.get('/menu')
      .then((res) => {
        if (mounted) setItems(normalizeList(res.data));
      })
      .catch((err) => {
        console.error(err);
        toast.error('Unable to load menu right now');
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user?._id || !isCustomer) {
      setFavoriteIds([]);
      return;
    }

    let mounted = true;

    api.get('/users/me')
      .then((res) => {
        if (!mounted) return;

        const favorites = Array.isArray(res.data?.favorites)
          ? res.data.favorites
          : [];

        setFavoriteIds(favorites.map((fav) => String(fav?._id || fav)));
      })
      .catch(() => {
        const localFavorites = Array.isArray(user?.favorites)
          ? user.favorites
          : [];

        setFavoriteIds(localFavorites.map((fav) => String(fav?._id || fav)));
      });

    return () => {
      mounted = false;
    };
  }, [user?._id, isCustomer]);

  const getQty = (id) => cartItems.find((i) => i._id === id)?.quantity || 0;

  const handleAdd = (item) => {
    addItem(item);
    toast.success(`${item.name} added!`, { duration: 1500 });
  };

  const handleToggleFavorite = async (item) => {
    if (!item?._id) {
      toast.error('Invalid menu item');
      return;
    }

    if (!user?._id || !isCustomer) {
      toast.error('Please login as customer to use favorites');
      return;
    }

    setFavoriteBusyId(item._id);

    try {
      const res = await api.put(`/users/${user._id}/favorites/${item._id}`);

      const favorites = Array.isArray(res.data?.favorites)
        ? res.data.favorites
        : [];

      setFavoriteIds(favorites.map((fav) => String(fav?._id || fav)));

      toast.success(
        res.data?.isFavorite
          ? `${item.name} added to favorites`
          : `${item.name} removed from favorites`,
        { duration: 1400 }
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update favorites');
    } finally {
      setFavoriteBusyId(null);
    }
  };

  const handleInc = (item) => updateQty(item._id, getQty(item._id) + 1);
  const handleDec = (item) => updateQty(item._id, getQty(item._id) - 1);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchCat = matchesCategory(item.category, activeCategory);
      const matchSearch =
        !term ||
        [item.name, item.description, item.category].some((value) =>
          String(value || '').toLowerCase().includes(term)
        );

      return matchCat && matchSearch;
    });
  }, [items, activeCategory, search]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
  }, [filtered]);

  const visibleCategories =
    activeCategory === 'All' ? Object.entries(grouped) : [[activeCategory, filtered]];

  return (
    <div className="rs-page">
      <Navbar />

      <header className="menu-page-hero">
        <div className="rs-container menu-page-head">
          <div>
            <span
              className="rs-eyebrow"
              style={{
                color: '#ffd28a',
                background: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.14)',
              }}
            >
              <SlidersHorizontal size={15} /> Freshly prepared menu
            </span>
            <h1 className="rs-section-title" style={{ color: '#fff8ef', marginTop: 12 }}>
              Our Menu
            </h1>
            <p className="rs-section-subtitle" style={{ color: '#c9aa8b' }}>
              Search, filter and add your favourite café dishes to cart.
            </p>
          </div>

          <div className="menu-search-box">
            <Search size={18} />
            <input
              className="menu-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, drinks, combos..."
              aria-label="Search menu items"
            />
          </div>
        </div>
      </header>

      <div className="menu-toolbar">
        <div className="rs-container">
          <div className="category-tabs" role="tablist" aria-label="Menu categories">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-tab ${activeCategory === cat ? 'category-tab-active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="rs-section" style={{ paddingTop: 8 }}>
        <div className="rs-container">
          <div className="menu-results-meta">
            <span>
              {loading
                ? 'Loading fresh items...'
                : `${filtered.length} item${filtered.length === 1 ? '' : 's'} available`}
            </span>
            {search && <span>Search: “{search}”</span>}
          </div>

          {loading ? (
            <div className="menu-results-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="rs-skeleton"
                  style={{ height: 360, borderRadius: 24 }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rs-empty">
              <div className="rs-empty-icon">
                <Search size={34} />
              </div>
              <h3>No items found</h3>
              <p>Try another search term or switch category.</p>
              <button
                type="button"
                className="rs-btn rs-btn-primary"
                onClick={() => {
                  setSearch('');
                  setActiveCategory('All');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            visibleCategories.map(([category, categoryItems]) => (
              <section key={category} className="category-block">
                {activeCategory === 'All' && (
                  <div className="category-heading">
                    <h2>{category}</h2>
                    <span
                      className="rs-badge"
                      style={{ background: '#fff3e5', color: '#a94a16' }}
                    >
                      {categoryItems.length} items
                    </span>
                  </div>
                )}

                <div className="menu-results-grid">
                  {categoryItems.map((item) => (
                    <MenuItemCard
                      key={item._id || item.name}
                      item={item}
                      onAdd={handleAdd}
                      qty={getQty(item._id)}
                      onInc={() => handleInc(item)}
                      onDec={() => handleDec(item)}
                      isFavorite={favoriteIds.includes(String(item._id))}
                      onToggleFavorite={handleToggleFavorite}
                      favoriteBusy={favoriteBusyId === item._id}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>
    </div>
  );
}