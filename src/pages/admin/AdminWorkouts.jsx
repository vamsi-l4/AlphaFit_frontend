import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function AdminWorkouts() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [workouts, setWorkouts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [form, setForm] = useState({
        categoryId: '',
        newCategory: '',
        name: '',
        equipment: '',
        steps: '',
        videoUrl: ''
    });

    const fetchWorkouts = async () => {
        setLoading(true);
        try {
            const catRes = await api.get('/workout/categories');
            const cats = catRes.data.data || [];
            setCategories(cats);

            let all = [];
            // Fetch deeply to construct the flat list safely over existing API
            for (const cat of cats) {
                const mRes = await api.get(`/workout/muscles/${cat.id}`);
                const muscles = mRes.data.data || [];
                for (const m of muscles) {
                    const smRes = await api.get(`/workout/submuscles/${m.id}`);
                    const subMuscles = smRes.data.data || [];
                    for (const sm of subMuscles) {
                        const exRes = await api.get(`/workout/exercises/${sm.id}`);
                        const exercises = exRes.data.data || [];
                        exercises.forEach(ex => {
                            all.push({
                                ...ex,
                                categoryId: cat.id,
                                categoryName: cat.name,
                                muscleId: m.id,
                                subMuscleId: sm.id
                            });
                        });
                    }
                }
            }
            setWorkouts(all);
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
            setForm({
                categoryId: workout.categoryId.toString(),
                newCategory: '',
                name: workout.name,
                equipment: workout.equipment || '',
                steps: workout.steps || '',
                videoUrl: workout.videoUrl || ''
            });
        } else {
            setEditingWorkout(null);
            setForm({ categoryId: '', newCategory: '', name: '', equipment: '', steps: '', videoUrl: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let catId = form.categoryId;
            // 1. Resolve Category
            if (!catId && form.newCategory) {
                const cRes = await api.post('/workout/categories', { name: form.newCategory });
                catId = cRes.data.data.id;
            }
            if (!catId) return alert('Please select or enter a category');

            // 2. Resolve "General" Muscle under category
            const mRes = await api.get(`/workout/muscles/${catId}`);
            let muscle = (mRes.data.data || []).find(m => m.name === 'General');
            if (!muscle) {
                const cmRes = await api.post('/workout/muscles', { name: 'General', categoryId: parseInt(catId) });
                muscle = cmRes.data.data;
            }

            // 3. Resolve "General" SubMuscle under muscle
            const smRes = await api.get(`/workout/submuscles/${muscle.id}`);
            let subMuscle = (smRes.data.data || []).find(sm => sm.name === 'General');
            if (!subMuscle) {
                const csmRes = await api.post('/workout/submuscles', { name: 'General', muscleId: muscle.id });
                subMuscle = csmRes.data.data;
            }

            // 4. Save Exercise
            const payload = {
                name: form.name,
                equipment: form.equipment,
                steps: form.steps,
                videoUrl: form.videoUrl,
                subMuscleId: subMuscle.id
            };

            if (editingWorkout) {
                // Delete old and create new to simulate an update across potentially new categories!
                await api.delete(`/workout/exercises/${editingWorkout.id}`).catch(() => {});
                await api.post('/workout/exercises', payload);
            } else {
                await api.post('/workout/exercises', payload);
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
            await api.delete(`/workout/exercises/${id}`);
            fetchWorkouts();
        } catch (err) {
            alert('Error deleting workout');
        }
    };

    const content = (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '20px', margin: '0 0 4px 0' }}>{isAdmin ? 'Workout Management' : 'Workouts'}</h1>
                    <div className="page-subtitle" style={{ fontSize: '13px' }}>{isAdmin ? 'Add and manage all gym exercises' : 'Browse gym exercises'}</div>
                </div>
                {isAdmin && (
                    <button className="btn-primary" onClick={() => handleOpenModal()} style={{ whiteSpace: 'nowrap' }}>+ Add Workout</button>
                )}
            </div>

            {loading ? (
                <div className="card py-10 text-center text-muted">
                    <div className="loading">Loading workouts...</div>
                </div>
            ) : workouts.length === 0 ? (
                <div className="card text-center text-muted py-10">No workouts found.</div>
            ) : (
                <div className="grid">
                    {workouts.map(w => (
                        <div key={w.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{w.categoryName}</span>
                                {isAdmin && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleOpenModal(w)}>Edit</button>
                                        <button className="btn-ghost text-red" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleDelete(w.id)}>Delete</button>
                                    </div>
                                )}
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{w.name}</h3>
                            <div className="text-muted text-sm" style={{ marginBottom: '12px' }}><strong>Equipment:</strong> {w.equipment || 'None'}</div>
                            {w.steps && (
                                <div className="text-sm" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                                    <strong>Steps:</strong> {w.steps}
                                </div>
                            )}
                            {w.videoUrl && (
                                <a href={w.videoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                                    ▶ Watch Video
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showModal && isAdmin && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>{editingWorkout ? 'Edit Workout' : 'Add Workout'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select 
                                    className="form-input" 
                                    value={form.categoryId} 
                                    onChange={e => setForm({...form, categoryId: e.target.value, newCategory: ''})}
                                >
                                    <option value="">-- Select Existing Category --</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            {!form.categoryId && (
                                <div className="form-group">
                                    <label className="form-label">Or Create New Category</label>
                                    <input type="text" className="form-input" placeholder="e.g., Strength, Cardio" value={form.newCategory} onChange={e => setForm({...form, newCategory: e.target.value})} />
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label className="form-label">Exercise Name</label>
                                <input type="text" className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Equipment</label>
                                <input type="text" className="form-input" value={form.equipment} onChange={e => setForm({...form, equipment: e.target.value})} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Steps/Instructions</label>
                                <textarea className="form-input" rows="3" value={form.steps} onChange={e => setForm({...form, steps: e.target.value})}></textarea>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Video URL</label>
                                <input type="url" className="form-input" placeholder="https://youtube.com/..." value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingWorkout ? 'Update' : 'Save'}</button>
                                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    // If the user is an admin, wrap with the AdminLayout navigation sidebar.
    // If the user is a member, return the naked content (App.jsx already handles Member Layout!).
    return isAdmin ? <AdminLayout>{content}</AdminLayout> : content;
}