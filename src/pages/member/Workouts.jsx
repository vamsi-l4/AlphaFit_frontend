import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function Workouts() {
    const [workouts, setWorkouts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [muscles, setMuscles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [filterCat, setFilterCat] = useState('');
    const [filterMusc, setFilterMusc] = useState('');

    useEffect(() => {
        const fetchWorkouts = async () => {
            setLoading(true);
            try {
                const catRes = await api.get('/workout/categories');
                const cats = catRes.data.data || [];
                setCategories(cats);

                let allWorkouts = [];
                let allMuscles = [];

                for (const cat of cats) {
                    const mRes = await api.get(`/workout/muscles/${cat.id}`);
                    const fetchedMuscles = mRes.data.data || [];
                    allMuscles = [...allMuscles, ...fetchedMuscles];

                    for (const m of fetchedMuscles) {
                        const smRes = await api.get(`/workout/submuscles/${m.id}`);
                        const subMuscles = smRes.data.data || [];
                        for (const sm of subMuscles) {
                            const exRes = await api.get(`/workout/exercises/${sm.id}`);
                            const exercises = exRes.data.data || [];
                            exercises.forEach(ex => {
                                allWorkouts.push({
                                    ...ex,
                                    categoryId: cat.id,
                                    categoryName: cat.name,
                                    muscleId: m.id,
                                    muscleName: m.name
                                });
                            });
                        }
                    }
                }
                setMuscles(allMuscles);
                setWorkouts(allWorkouts);
            } catch (err) {
                console.error('Failed to fetch workouts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkouts();
    }, []);

    const availableMuscles = filterCat
        ? muscles.filter(m => m.categoryId.toString() === filterCat)
        : muscles;

    // Auto-reset muscle if category changes and the old muscle isn't in it
    useEffect(() => {
        if (filterCat && filterMusc) {
            if (!availableMuscles.find(m => m.id.toString() === filterMusc)) {
                setFilterMusc('');
            }
        }
    }, [filterCat, filterMusc, availableMuscles]);

    const filteredWorkouts = workouts.filter(w => {
        if (filterCat && w.categoryId.toString() !== filterCat) return false;
        if (filterMusc && w.muscleId.toString() !== filterMusc) return false;
        return true;
    });

    return (
        <div className="layout-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Workouts</h1>
                    <div className="page-subtitle">Browse all gym exercises</div>
                </div>
            </div>

            {/* Clean Dropdown Filters */}
            <div className="card" style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label className="form-label">Category</label>
                    <select className="form-input" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label className="form-label">Muscle Group</label>
                    <select className="form-input" value={filterMusc} onChange={e => setFilterMusc(e.target.value)} disabled={!filterCat && availableMuscles.length === 0}>
                        <option value="">All Muscles</option>
                        {availableMuscles.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Grid of Read-Only Workouts */}
            {loading ? (
                <div className="card py-10 text-center text-muted"><div className="loading">Loading workouts...</div></div>
            ) : filteredWorkouts.length === 0 ? (
                <div className="card text-center text-muted py-10">No workouts found.</div>
            ) : (
                <div className="grid">
                    {filteredWorkouts.map(w => (
                        <div key={w.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                    {w.categoryName} {w.muscleName ? `• ${w.muscleName}` : ''}
                                </span>
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{w.name}</h3>
                            <div className="text-muted text-sm" style={{ marginBottom: '12px' }}><strong>Equipment:</strong> {w.equipment || 'None'}</div>
                            {w.steps && (
                                <div className="text-sm" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                                    <strong>Steps:</strong> {w.steps}
                                </div>
                            )}
                            {w.videoUrl && (
                                <a href={w.videoUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', color: 'var(--accent)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                                    ▶ Watch Video
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}