import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { BookmarkPlusAltIcon } from '../../components/Icons';

export default function AdminWorkouts() {
    const { user } = useAuth();
    const location = useLocation();
    const isAdmin = user?.role === 'admin';
    const isManageMode = isAdmin && new URLSearchParams(location.search).get('manage') === 'true';

    const [workouts, setWorkouts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    
    // Modal state
    const [selectedWorkout, setSelectedWorkout] = useState(null); // For cinematic popup
    const [showModal, setShowModal] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [form, setForm] = useState({
        name: '',
        category: '',
        description: '',
        sets: '',
        reps: '',
        restTime: '',
        difficulty: 'Beginner',
        videoUrl: '',
        thumbnailUrl: ''
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);

    const fetchWorkouts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/workout/v2/all');
            const data = res.data.data || [];
            setWorkouts(data);
            const uniqueCats = ['All', ...new Set(data.map(w => w.category).filter(Boolean))];
            setCategories(uniqueCats);
        } catch (err) {
            console.error('Failed to fetch workouts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const handleOpenModal = (workout = null) => {
        if (workout) {
            setEditingWorkout(workout);
            setForm({ ...workout });
        } else {
            setEditingWorkout(null);
            setForm({ name: '', category: '', description: '', sets: '', reps: '', restTime: '', difficulty: 'Beginner', videoUrl: '', thumbnailUrl: '' });
        }
        setThumbnailFile(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => {
                if (form[key] !== null && form[key] !== undefined) {
                    formData.append(key, form[key]);
                }
            });

            if (thumbnailFile) {
                formData.append('photo', thumbnailFile); // Maps perfectly to backend upload middleware
            }

            if (editingWorkout) {
                await api.put(`/workout/v2/${editingWorkout.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('/workout/v2', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            setShowModal(false);
            fetchWorkouts();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving workout');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this workout?')) return;
        try {
            await api.delete(`/workout/v2/${id}`);
            fetchWorkouts();
        } catch (err) {
            alert('Error deleting workout');
        }
    };

    const filteredWorkouts = workouts.filter(w => {
        const matchesCat = activeCategory === 'All' || w.category === activeCategory;
        const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (w.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

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

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    const content = (
        <div className="workouts-container">
            <div className="admin-header">
                <div>
                    <h1 className="page-title">{isManageMode ? 'Manage Workouts' : 'Workouts'}</h1>
                    <div className="page-subtitle">{isManageMode ? 'Alpha Fit Database' : 'Alpha Fit Exclusive Training'}</div>
                </div>
                {isManageMode && (
                    <button className="add-btn" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookmarkPlusAltIcon width={20} height={20} /> Add Workout
                    </button>
                )}
            </div>

            <div className="search-container">
                <input 
                    type="text" 
                    className="glass-input" 
                    placeholder="Search database..." 
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

            {loading ? (
                <div className="loading-state" style={{color: '#aaa', textAlign: 'center', marginTop: '40px'}}>Loading cinematic database...</div>
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
                                {isManageMode && (
                                    <div className="admin-card-actions" onClick={e => e.stopPropagation()}>
                                        <button className="action-btn edit" onClick={() => handleOpenModal(w)}>Edit</button>
                                        <button className="action-btn delete" onClick={() => handleDelete(w.id)}>Delete</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal (Same as Member side) */}
            {selectedWorkout && (
                <div className="modal-overlay" onClick={() => setSelectedWorkout(null)}>
                    <div className="glass-modal workout-detail-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedWorkout(null)}>✕</button>
                        
                        {selectedWorkout.videoUrl ? (
                            <div className="video-container">
                                <iframe src={getYouTubeEmbedUrl(selectedWorkout.videoUrl)} title={selectedWorkout.name} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
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
                                <div className="stat-box"><span className="stat-label">Sets</span><span className="stat-value">{selectedWorkout.sets || '-'}</span></div>
                                <div className="stat-box"><span className="stat-label">Reps</span><span className="stat-value">{selectedWorkout.reps || '-'}</span></div>
                                <div className="stat-box"><span className="stat-label">Rest</span><span className="stat-value">{selectedWorkout.restTime || '-'}</span></div>
                                <div className="stat-box"><span className="stat-label">Difficulty</span><span className={`stat-value difficulty-${selectedWorkout.difficulty?.toLowerCase()}`}>{selectedWorkout.difficulty || '-'}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showModal && isManageMode && (
                <div className="modal-overlay">
                    <div className="glass-modal form-modal">
                        <h2>{editingWorkout ? 'Edit Workout' : 'Add New Workout'}</h2>
                        <form onSubmit={handleSubmit} className="workout-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Workout Name</label>
                                    <input type="text" className="glass-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Category (e.g., Chest, Cardio)</label>
                                    <input type="text" className="glass-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="glass-input" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                            </div>

                            <div className="form-row triplet">
                                <div className="form-group">
                                    <label>Sets</label>
                                    <input type="text" className="glass-input" placeholder="e.g. 4" value={form.sets} onChange={e => setForm({...form, sets: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Reps</label>
                                    <input type="text" className="glass-input" placeholder="e.g. 10-12" value={form.reps} onChange={e => setForm({...form, reps: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Rest Time</label>
                                    <input type="text" className="glass-input" placeholder="e.g. 60s" value={form.restTime} onChange={e => setForm({...form, restTime: e.target.value})} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Difficulty</label>
                                <select className="glass-input" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>YouTube URL</label>
                                    <input type="url" className="glass-input" placeholder="https://youtube.com/..." value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Thumbnail Image</label>
                                    <input type="file" className="glass-input" accept="image/*" onChange={e => setThumbnailFile(e.target.files[0])} style={{ padding: '9px 16px' }} />
                                    {form.thumbnailUrl && !thumbnailFile && <small style={{ color: '#aaa', display: 'block', marginTop: '4px' }}>Current: {form.thumbnailUrl.split('/').pop()}</small>}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="action-btn cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="action-btn save">{editingWorkout ? 'Update' : 'Save Workout'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .workouts-container { padding: 20px; max-width: 1200px; margin: 0 auto; color: white; }
                .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .page-title { font-size: 28px; margin: 0 0 4px 0; }
                .page-subtitle { color: #888; font-size: 14px; margin-bottom: 12px; }
                .add-btn { background: #fff; color: #000; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
                .add-btn:hover { transform: scale(1.05); }
                
                .search-container { margin-bottom: 20px; }
                .glass-input { width: 100%; padding: 12px 16px; border-radius: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: white; font-size: 15px; }
                .glass-input:focus { outline: none; border-color: rgba(255,255,255,0.4); }
                select.glass-input option { background: #111; color: #fff; }
                
                .category-pills-container { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 24px; scrollbar-width: none; }
                .category-pills-container::-webkit-scrollbar { display: none; }
                .pill-btn { padding: 8px 20px; border-radius: 50px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #aaa; white-space: nowrap; cursor: pointer; transition: all 0.3s ease; font-weight: 500; }
                .pill-btn.active, .pill-btn:hover { background: #fff; color: #000; border-color: #fff; }

                .cinematic-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
                .glass-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; overflow: hidden; cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease; backdrop-filter: blur(10px); }
                .glass-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); border-color: rgba(255, 255, 255, 0.15); }
                .card-image-wrapper { position: relative; height: 180px; width: 100%; }
                .card-thumbnail { width: 100%; height: 100%; object-fit: cover; }
                .card-category-badge { position: absolute; top: 12px; left: 12px; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); }
                .card-content { padding: 16px; }
                .card-content h3 { margin: 0 0 8px 0; font-size: 18px; color: #fff; }
                .card-meta { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #aaa; margin-bottom: 12px; }
                .difficulty-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; }
                .difficulty-dot.beginner { background: #4caf50; }
                .difficulty-dot.intermediate { background: #ff9800; }
                .difficulty-dot.advanced { background: #f44336; }
                .card-description { font-size: 14px; color: #888; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0; }

                .admin-card-actions { display: flex; gap: 10px; margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; }
                .action-btn { padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
                .action-btn.edit { background: rgba(255,255,255,0.1); color: white; }
                .action-btn.delete { background: rgba(244, 67, 54, 0.1); color: #f44336; }
                .action-btn.cancel { background: transparent; color: white; border: 1px solid rgba(255,255,255,0.2); }
                .action-btn.save { background: white; color: black; }
                
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px; }
                .form-modal { background: #111; padding: 30px; border-radius: 16px; width: 100%; max-width: 600px; border: 1px solid rgba(255,255,255,0.1); max-height: 90vh; overflow-y: auto; }
                .form-modal h2 { margin-top: 0; margin-bottom: 24px; }
                
                .glass-modal { background: #111; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .modal-close { position: absolute; top: 15px; right: 15px; background: transparent; border: none; color: white; font-size: 22px; cursor: pointer; z-index: 10; padding: 4px; }
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

                .form-row { display: flex; gap: 16px; margin-bottom: 16px; }
                .form-row > * { flex: 1; }
                .form-group { margin-bottom: 16px; }
                .form-group label { display: block; margin-bottom: 8px; font-size: 13px; color: #aaa; }
                .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
                @media (max-width: 600px) { .form-row { flex-direction: column; gap: 0; } .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
            `}</style>
        </div>
    );

    return isAdmin ? <AdminLayout>{content}</AdminLayout> : content;
}