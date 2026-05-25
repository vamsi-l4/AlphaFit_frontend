import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function Workouts() {
    const [workouts, setWorkouts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    useEffect(() => {
        const fetchWorkouts = async () => {
            setLoading(true);
            try {
                const res = await api.get('/workout/v2/all');
                const data = res.data.data || [];
                setWorkouts(data);
                
                // Dynamically extract unique categories from the backend data
                const uniqueCats = ['All', ...new Set(data.map(w => w.category).filter(Boolean))];
                setCategories(uniqueCats);
            } catch (err) {
                console.error('Failed to fetch workouts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkouts();
    }, []);

    const filteredWorkouts = workouts.filter(w => {
        const matchesCat = activeCategory === 'All' || w.category === activeCategory;
        const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (w.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    const getImageUrl = (url, isModal = false) => {
        const fallback = isModal ? 'https://via.placeholder.com/800x450?text=Alpha+Fit' : 'https://via.placeholder.com/400x250?text=Alpha+Fit';
        if (!url) return fallback;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        
        let normalizedUrl = url.replace(/\\/g, '/'); // Fixes Windows backslashes
        
        // Smart folder detection: If you only typed the image name, auto-route it to the media folder!
        if (!normalizedUrl.startsWith('/uploads/') && !normalizedUrl.startsWith('/media/')) {
            normalizedUrl = normalizedUrl.startsWith('/') ? `/media${normalizedUrl}` : `/media/${normalizedUrl}`;
        }
        
        // Tap directly into the working Axios configuration to guarantee connection!
        let backendUrl = (api.defaults && api.defaults.baseURL) || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        if (backendUrl.endsWith('/')) {
            backendUrl = backendUrl.slice(0, -1);
        }
        
        const cleanUrl = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
        // Route through the /api tunnel so Vercel proxies the image perfectly
        return `${backendUrl}${encodeURI(cleanUrl)}`;
    };

    return (
        <div className="workouts-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Workouts</h1>
                    <div className="page-subtitle">Alpha Fit Exclusive Training</div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="search-container">
                <input 
                    type="text" 
                    className="glass-input" 
                    placeholder="Search workouts..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Category Pills */}
            <div className="category-pills-container">
                {categories.map(cat => (
                    <button 
                        key={cat} 
                        className={`pill-btn ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Workouts Grid */}
            {loading ? (
                <div className="loading-state" style={{color: '#aaa', textAlign: 'center', marginTop: '40px'}}>Loading cinematic workouts...</div>
            ) : filteredWorkouts.length === 0 ? (
                <div className="empty-state" style={{color: '#aaa', textAlign: 'center', marginTop: '40px'}}>No workouts found.</div>
            ) : (
                <div className="cinematic-grid">
                    {filteredWorkouts.map(w => (
                        <div key={w.id} className="glass-card" onClick={() => setSelectedWorkout(w)}>
                            <div className="card-image-wrapper">
                                <img src={getImageUrl(w.thumbnailUrl)} alt={w.name} className="card-thumbnail" />
                                <span className="card-category-badge">{w.category}</span>
                            </div>
                            <div className="card-content">
                                <h3>{w.name}</h3>
                                <div className="card-meta">
                                    <span className={`difficulty-dot ${w.difficulty?.toLowerCase()}`}></span>
                                    {w.difficulty || 'All Levels'}
                </div>
                                <p className="card-description">{w.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedWorkout && (
                <div className="modal-overlay" onClick={() => setSelectedWorkout(null)}>
                    <div className="glass-modal workout-detail-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedWorkout(null)}>✕</button>
                        
                        {selectedWorkout.videoUrl ? (
                            <div className="video-container">
                                <iframe 
                                    src={getYouTubeEmbedUrl(selectedWorkout.videoUrl)} 
                                    title={selectedWorkout.name}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            <img src={getImageUrl(selectedWorkout.thumbnailUrl, true)} alt="Thumbnail" className="modal-thumbnail" />
                        )}

                        <div className="modal-body">
                            <div className="modal-header-info">
                                <h2>{selectedWorkout.name}</h2>
                                <span className="modal-category">{selectedWorkout.category}</span>
                            </div>
                            
                            <p className="modal-desc">{selectedWorkout.description}</p>
                            
                            <div className="stats-grid">
                                <div className="stat-box">
                                    <span className="stat-label">Sets</span>
                                    <span className="stat-value">{selectedWorkout.sets || '-'}</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-label">Reps</span>
                                    <span className="stat-value">{selectedWorkout.reps || '-'}</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-label">Rest</span>
                                    <span className="stat-value">{selectedWorkout.restTime || '-'}</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-label">Difficulty</span>
                                    <span className={`stat-value difficulty-${selectedWorkout.difficulty?.toLowerCase()}`}>{selectedWorkout.difficulty || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .workouts-container { padding: 20px; max-width: 1200px; margin: 0 auto; color: #fff; }
                .search-container { margin-bottom: 20px; }
                .glass-input {
                    width: 100%; padding: 14px 20px; border-radius: 50px;
                    background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white; font-size: 16px; backdrop-filter: blur(10px); transition: all 0.3s ease;
                }
                .glass-input:focus { outline: none; border-color: rgba(255, 255, 255, 0.5); background: rgba(255, 255, 255, 0.1); }
                
                .category-pills-container {
                    display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 24px;
                    scrollbar-width: none;
                }
                .category-pills-container::-webkit-scrollbar { display: none; }
                .pill-btn {
                    padding: 8px 20px; border-radius: 50px; background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1); color: #aaa; white-space: nowrap;
                    cursor: pointer; transition: all 0.3s ease; font-weight: 500;
                }
                .pill-btn.active, .pill-btn:hover { background: #fff; color: #000; border-color: #fff; }
                
                .cinematic-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
                .glass-card {
                    background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px; overflow: hidden; cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease;
                    backdrop-filter: blur(10px);
                }
                .glass-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); border-color: rgba(255, 255, 255, 0.15); }
                
                .card-image-wrapper { position: relative; height: 180px; width: 100%; }
                .card-thumbnail { width: 100%; height: 100%; object-fit: cover; }
                .card-category-badge {
                    position: absolute; top: 12px; left: 12px; background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px); padding: 4px 10px; border-radius: 8px;
                    font-size: 12px; font-weight: 600; color: #fff; border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .card-content { padding: 16px; }
                .card-content h3 { margin: 0 0 8px 0; font-size: 18px; color: #fff; }
                .card-meta { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #aaa; margin-bottom: 12px; }
                .difficulty-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; }
                .difficulty-dot.beginner { background: #4caf50; }
                .difficulty-dot.intermediate { background: #ff9800; }
                .difficulty-dot.advanced { background: #f44336; }
                .card-description {
                    font-size: 14px; color: #888; display: -webkit-box; -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical; overflow: hidden; margin: 0;
                }

                .modal-overlay {
                    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(10px);
                    display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px;
                }
                .glass-modal {
                    background: #111; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px;
                    width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; position: relative;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                }
                .modal-close {
                    position: absolute; top: 15px; right: 15px; background: transparent;
                    border: none; color: white; font-size: 22px;
                    cursor: pointer; z-index: 10; padding: 4px;
                }
                .video-container { position: relative; padding-bottom: 56.25%; height: 0; }
                .video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-top-left-radius: 20px; border-top-right-radius: 20px; }
                .modal-thumbnail { width: 100%; height: 250px; object-fit: cover; border-top-left-radius: 20px; border-top-right-radius: 20px; }
                .modal-body { padding: 24px; }
                .modal-header-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                .modal-header-info h2 { margin: 0; font-size: 24px; }
                .modal-category { background: rgba(255, 255, 255, 0.1); padding: 4px 12px; border-radius: 50px; font-size: 13px; }
                .modal-desc { color: #bbb; line-height: 1.6; margin-bottom: 24px; }
                
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: rgba(255, 255, 255, 0.03); padding: 16px; border-radius: 12px; }
                .stat-box { display: flex; flex-direction: column; align-items: center; text-align: center; }
                .stat-label { font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 4px; }
                .stat-value { font-size: 16px; font-weight: 600; color: #fff; }
                .stat-value.difficulty-beginner { color: #4caf50; }
                .stat-value.difficulty-intermediate { color: #ff9800; }
                .stat-value.difficulty-advanced { color: #f44336; }
                @media (max-width: 600px) { .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
            `}</style>
        </div>
    );
}