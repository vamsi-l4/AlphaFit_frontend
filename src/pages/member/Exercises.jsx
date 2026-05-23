import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

export default function Exercises() {
    const { subMuscleId } = useParams();
    const [exercises, setExercises] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchExercises(1);
    }, [subMuscleId]); // eslint-disable-line

    const fetchExercises = async (page) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/workout/exercises/${subMuscleId}?page=${page}&limit=10`);
            if (page === 1) {
                setExercises(data.data);
            } else {
                setExercises(prev => [...prev, ...data.data]);
            }
            setPagination(data.pagination);
        } catch (err) {
            setError('Failed to load exercises');
        } finally {
            setLoading(false);
        }
    };

    const addToFavorites = async (exerciseId) => {
        try {
            await api.post('/workout/favorites', { exerciseId });
            // Optimistic update
            setExercises(exercises.map(ex => ex.id === exerciseId
                ? { ...ex, isFavorite: true }
                : ex
            ));
        } catch (err) {
            if (err.response?.status === 409) {
                alert("Already added to favorites");
            } else {
                alert(err.response?.data?.message || 'Failed to add favorite');
            }
        }
    };

    const removeFromFavorites = async (exerciseId) => {
        try {
            const { data } = await api.get('/workout/favorites');
            const fav = data.data.find(f => f.exerciseId === exerciseId);
            if (!fav) return;
            await api.delete(`/workout/favorites/${fav.id}`);
            setExercises(exercises.map(ex => ex.id === exerciseId ? { ...ex, isFavorite: false } : ex));
            alert('Removed from favorites');
        } catch (err) {
            alert('Failed to remove favorite');
        }
    };

    const logWorkout = async (exerciseId) => {
        try {
            await api.post('/workout/workout-log', { exerciseId });
            alert('Workout logged!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to log workout');
        }
    };

    if (loading) return <div className="loading">Loading exercises...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="exercises-page">
            <Link to="/workouts" className="back-btn">← Back to Workouts</Link>
            <h1>Exercises</h1>
            {exercises.length === 0 ? (
                <div className="empty-state">No exercises found</div>
            ) : (
                <>
                    <div className="exercises-grid">
                        {exercises.map((exercise) => (
                            <div key={exercise.id} className="exercise-card">
                                <h3>{exercise.name}</h3>
                                <p><strong>Equipment:</strong> {exercise.equipment}</p>
                                <p><strong>Steps:</strong> {exercise.steps}</p>
                                {exercise.videoUrl && (
                                    <video src={exercise.videoUrl} controls className="exercise-video" />
                                )}
                                <div className="exercise-actions">
                                    {exercise.isFavorite ? (
                                        <button className="btn-danger" onClick={() => removeFromFavorites(exercise.id)}>
                                            💔 Remove Favorite
                                        </button>
                                    ) : (
                                        <button
                                            className="btn-primary"
                                            onClick={() => addToFavorites(exercise.id)}
                                        >
                                            ❤️ Add to Favorites
                                        </button>
                                    )}
                                    <button
                                        className="btn-success"
                                        onClick={() => logWorkout(exercise.id)}
                                    >
                                        ✅ Log Workout
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {exercises.length < pagination.total && (
                        <div className="pagination-actions">
                            <button
                                className="btn-ghost"
                                onClick={() => fetchExercises(pagination.page + 1)}
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
