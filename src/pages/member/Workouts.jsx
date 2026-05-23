import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function Workouts() {
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories(1);
    }, []); // eslint-disable-line

    const fetchCategories = async (page) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/workout/categories?page=${page}&limit=10`);
            if (page === 1) {
                setCategories(data.data);
            } else {
                setCategories(prev => [...prev, ...data.data]);
            }
            setPagination(data.pagination);
        } catch (err) {
            setError('Failed to load workouts');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading workouts...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="workouts-page">
            <h1>🏋️ Workouts</h1>
            {categories.length === 0 ? (
                <div className="empty-state">No workouts available</div>
            ) : (
                <>
                    <div className="categories-grid">
                        {categories.map((category) => (
                            <div key={category.id} className="category-card" onClick={() => navigate(`/workouts/muscles/${category.id}`)}>
                                <h3>{category.name}</h3>
                                <p>{category._count?.muscles || 0} muscles</p>
                            </div>
                        ))}
                    </div>
                    {categories.length < pagination.total && (
                        <div className="pagination-actions">
                            <button
                                className="btn-ghost"
                                onClick={() => fetchCategories(pagination.page + 1)}
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
