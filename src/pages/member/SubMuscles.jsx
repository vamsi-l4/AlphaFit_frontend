import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

export default function SubMuscles() {
    const { muscleId } = useParams();
    const [subMuscles, setSubMuscles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSubMuscles();
    }, [muscleId]);

    const fetchSubMuscles = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/workout/submuscles/${muscleId}?page=1&limit=100`);
            setSubMuscles(data.data);
        } catch (err) {
            setError('Failed to load sub muscles');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading sub muscles...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="submuscles-page">
            <Link to="/workouts" className="back-btn">← Back</Link>
            <h1>Sub Muscles</h1>
            {subMuscles.length === 0 ? (
                <div className="empty-state">No sub muscles found</div>
            ) : (
                <div className="submuscles-grid">
                    {subMuscles.map((subMuscle) => (
                        <div key={subMuscle.id} className="submuscle-card">
                            <h3>{subMuscle.name}</h3>
                            <Link to={`/workouts/exercises/${subMuscle.id}`} className="btn-primary">View Exercises</Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
