import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

export default function Muscles() {
    const { categoryId } = useParams();
    const [muscles, setMuscles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMuscles();
    }, [categoryId]);

    const fetchMuscles = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/workout/muscles/${categoryId}?page=1&limit=100`);
            setMuscles(data.data);
        } catch (err) {
            setError('Failed to load muscles');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading muscles...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="muscles-page">
            <Link to="/workouts" className="back-btn">← Back to Categories</Link>
            <h1>Muscles</h1>
            {muscles.length === 0 ? (
                <div className="empty-state">No muscles found</div>
            ) : (
                <div className="muscles-grid">
                    {muscles.map((muscle) => (
                        <div key={muscle.id} className="muscle-card" >
                            <h3>{muscle.name}</h3>
                            <Link to={`/workouts/submuscles/${muscle.id}`} className="btn-primary">View SubMuscles</Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
