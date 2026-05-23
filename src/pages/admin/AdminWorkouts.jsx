import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';

export default function AdminWorkouts() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI State for drill-down
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [muscles, setMuscles] = useState([]);
    
    const [selectedMuscle, setSelectedMuscle] = useState(null);
    const [subMuscles, setSubMuscles] = useState([]);
    
    const [selectedSubMuscle, setSelectedSubMuscle] = useState(null);
    const [exercises, setExercises] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/workout/categories');
            setCategories(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMuscles = async (categoryId) => {
        try {
            const res = await api.get(`/workout/muscles/${categoryId}`);
            setMuscles(res.data.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchSubMuscles = async (muscleId) => {
        try {
            const res = await api.get(`/workout/submuscles/${muscleId}`);
            setSubMuscles(res.data.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchExercises = async (subMuscleId) => {
        try {
            const res = await api.get(`/workout/exercises/${subMuscleId}`);
            setExercises(res.data.data || []);
        } catch (err) { console.error(err); }
    };

    const handleAddCategory = async () => {
        const name = prompt('Enter new Category name (e.g., Strength):');
        if (!name) return;
        try {
            await api.post('/workout/categories', { name });
            fetchCategories();
        } catch (err) { alert(err.response?.data?.message || 'Error adding category'); }
    };

    const handleAddMuscle = async () => {
        const name = prompt('Enter new Muscle Group (e.g., Chest):');
        if (!name) return;
        try {
            await api.post('/workout/muscles', { name, categoryId: selectedCategory.id });
            fetchMuscles(selectedCategory.id);
        } catch (err) { alert(err.response?.data?.message || 'Error adding muscle'); }
    };

    const handleAddSubMuscle = async () => {
        const name = prompt('Enter new Sub-Muscle (e.g., Upper Chest):');
        if (!name) return;
        try {
            await api.post('/workout/submuscles', { name, muscleId: selectedMuscle.id });
            fetchSubMuscles(selectedMuscle.id);
        } catch (err) { alert(err.response?.data?.message || 'Error adding sub-muscle'); }
    };

    const handleAddExercise = async () => {
        const name = prompt('Exercise Name:');
        if (!name) return;
        const equipment = prompt('Equipment Required:');
        const steps = prompt('Steps/Instructions:');
        const videoUrl = prompt('Video URL (YouTube or Direct Link):');
        
        try {
            await api.post('/workout/exercises', {
                name, equipment, steps, videoUrl, subMuscleId: selectedSubMuscle.id
            });
            fetchExercises(selectedSubMuscle.id);
        } catch (err) { alert(err.response?.data?.message || 'Error adding exercise'); }
    };

    const handleDelete = async (type, id, refreshFn, parentId) => {
        if (!window.confirm(`Are you sure you want to delete this?`)) return;
        try {
            await api.delete(`/workout/${type}/${id}`);
            refreshFn(parentId);
            
            if (type === 'categories' && selectedCategory?.id === id) setSelectedCategory(null);
            if (type === 'muscles' && selectedMuscle?.id === id) setSelectedMuscle(null);
            if (type === 'submuscles' && selectedSubMuscle?.id === id) setSelectedSubMuscle(null);
        } catch (err) { alert(err.response?.data?.message || `Error deleting`); }
    };

    return (
        <AdminLayout>
            <div style={{ marginBottom: '24px' }}>
                <h1 className="page-title">Workout Management</h1>
                <div className="page-subtitle">Configure Categories, Muscles, and Exercises</div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
                <div className="card" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Categories</h3>
                        <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={handleAddCategory}>+ Add</button>
                    </div>
                    {loading ? <p>Loading...</p> : categories.map(cat => (
                        <div key={cat.id} style={{
                            padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', marginBottom: '8px',
                            background: selectedCategory?.id === cat.id ? 'var(--bg-secondary)' : 'transparent',
                            cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }} onClick={() => { setSelectedCategory(cat); setSelectedMuscle(null); setSelectedSubMuscle(null); fetchMuscles(cat.id); }}>
                            <span style={{ fontWeight: selectedCategory?.id === cat.id ? 'bold' : 'normal', fontSize: '14px' }}>{cat.name}</span>
                            <button className="btn-ghost text-red" style={{ padding: '2px 6px', fontSize: '12px' }} onClick={(e) => { e.stopPropagation(); handleDelete('categories', cat.id, fetchCategories); }}>Del</button>
                        </div>
                    ))}
                    {categories.length === 0 && !loading && <p className="text-muted" style={{ fontSize: '13px' }}>No categories found.</p>}
                </div>

                {selectedCategory && (
                    <div className="card" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '16px' }}>Muscles</h3>
                            <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={handleAddMuscle}>+ Add</button>
                        </div>
                        {muscles.map(musc => (
                            <div key={musc.id} style={{
                                padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', marginBottom: '8px',
                                background: selectedMuscle?.id === musc.id ? 'var(--bg-secondary)' : 'transparent',
                                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }} onClick={() => { setSelectedMuscle(musc); setSelectedSubMuscle(null); fetchSubMuscles(musc.id); }}>
                                <span style={{ fontWeight: selectedMuscle?.id === musc.id ? 'bold' : 'normal', fontSize: '14px' }}>{musc.name}</span>
                                <button className="btn-ghost text-red" style={{ padding: '2px 6px', fontSize: '12px' }} onClick={(e) => { e.stopPropagation(); handleDelete('muscles', musc.id, fetchMuscles, selectedCategory.id); }}>Del</button>
                            </div>
                        ))}
                        {muscles.length === 0 && <p className="text-muted" style={{ fontSize: '13px' }}>No muscles found.</p>}
                    </div>
                )}

                {selectedMuscle && (
                    <div className="card" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '16px' }}>Sub-Muscles</h3>
                            <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={handleAddSubMuscle}>+ Add</button>
                        </div>
                        {subMuscles.map(sub => (
                            <div key={sub.id} style={{
                                padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', marginBottom: '8px',
                                background: selectedSubMuscle?.id === sub.id ? 'var(--bg-secondary)' : 'transparent',
                                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }} onClick={() => { setSelectedSubMuscle(sub); fetchExercises(sub.id); }}>
                                <span style={{ fontWeight: selectedSubMuscle?.id === sub.id ? 'bold' : 'normal', fontSize: '14px' }}>{sub.name}</span>
                                <button className="btn-ghost text-red" style={{ padding: '2px 6px', fontSize: '12px' }} onClick={(e) => { e.stopPropagation(); handleDelete('submuscles', sub.id, fetchSubMuscles, selectedMuscle.id); }}>Del</button>
                            </div>
                        ))}
                        {subMuscles.length === 0 && <p className="text-muted" style={{ fontSize: '13px' }}>No sub-muscles found.</p>}
                    </div>
                )}
            </div>

            {selectedSubMuscle && (
                <div className="card" style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Exercises for {selectedSubMuscle.name}</h3>
                        <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={handleAddExercise}>+ Add Exercise</button>
                    </div>
                    
                    <div className="table-wrap">
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Name</th>
                                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Equipment</th>
                                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Video</th>
                                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exercises.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center text-muted" style={{ padding: '20px' }}>No exercises added yet.</td></tr>
                                ) : (
                                    exercises.map(ex => (
                                        <tr key={ex.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: 500 }}>{ex.name}</td>
                                            <td style={{ padding: '12px 8px' }} className="text-muted">{ex.equipment || '-'}</td>
                                            <td style={{ padding: '12px 8px' }}>
                                                {ex.videoUrl ? <a href={ex.videoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>View Link</a> : '-'}
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <button className="btn-ghost text-red" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleDelete('exercises', ex.id, fetchExercises, selectedSubMuscle.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}