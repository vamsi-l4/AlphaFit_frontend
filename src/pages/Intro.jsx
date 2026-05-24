import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import introVideo from '../assets/alpha-intro.mp4';

export default function Intro() {
    const [showButton, setShowButton] = useState(false);
    const [videoDismissed, setVideoDismissed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Check if the user is explicitly opening the root page "/"
    const isRoot = location.pathname === '/';

    const routeUser = () => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/member/dashboard', { replace: true });
            }
        } else {
            navigate('/member/login', { replace: true }); 
        }
    };

    const handleVideoEnd = () => {
        setShowButton(true);
    };

    const handleGetStarted = () => {
        setVideoDismissed(true);
        routeUser();
    };

    // 1. If they refresh a deep link (like /workouts), hide instantly.
    // 2. If they just clicked "Get Started" in this session, hide it.
    if (!isRoot || videoDismissed) {
        return null;
    }

    return (
        <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', backgroundColor: '#000', overflow: 'hidden', zIndex: 9999 }}>
            <video
                src={introVideo}
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnd}
                className="intro-video"
            />

            {showButton && (
                <button 
                    className="glass-button"
                    onClick={handleGetStarted}
                >
                    Get Started
                </button>
            )}

            <style>{`
                .intro-video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                @media (min-width: 768px) {
                    .intro-video {
                        object-fit: contain;
                    }
                }

                .glass-button {
                    position: absolute;
                    bottom: 5%;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 8px 24px;
                    font-size: 12px;
                    font-weight: 500;
                    color: white;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50px;
                    cursor: pointer;
                    opacity: 0;
                    animation: ghost-fade 2.5s ease-in-out forwards, border-pulse 1.5s ease-in-out infinite alternate;
                    transition: transform 0.2s, background 0.2s;
                    z-index: 10;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .glass-button:hover {
                    transform: translateX(-50%) scale(1.05);
                    background: rgba(255, 255, 255, 0.2);
                }

                @keyframes border-pulse {
                    0% { border-color: rgba(255, 255, 255, 0.2); box-shadow: 0 0 5px rgba(255,255,255,0.0); }
                    100% { border-color: rgba(255, 255, 255, 0.9); box-shadow: 0 0 12px rgba(255,255,255,0.4); }
                }

                @keyframes ghost-fade {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}