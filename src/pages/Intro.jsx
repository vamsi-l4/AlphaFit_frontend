import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Intro() {
    const [showButton, setShowButton] = useState(false);
    const [videoDismissed, setVideoDismissed] = useState(false);
    const [videoSrc, setVideoSrc] = useState("/alpha-intro.mp4");
    const [audioSrc, setAudioSrc] = useState("/alpha-intro-audio.mp3");
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const videoRef = useRef(null);
    const audioRef = useRef(null);

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

    // GUARANTEED FALLBACK: Always show the "Get Started" button after 3.5 seconds.
    // This fixes the bug where PWA mobile browsers fail to fire the video 'onEnded' event!
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowButton(true);
        }, 3500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Force the video to play to bypass modern browser autoplay restrictions
        if (isRoot && !videoDismissed && videoRef.current) {
            videoRef.current.play().catch((err) => {
                console.warn("Autoplay was blocked by the browser:", err);
                // If blocked, immediately show the button so the user doesn't get stuck on a black screen!
                setShowButton(true);
            });

            // Attempt to play the synchronized audio exactly when the video starts
            if (audioRef.current) {
                audioRef.current.play().catch((err) => {
                    console.warn("Audio autoplay was blocked by the browser:", err);
                });
            }
        }
    }, [isRoot, videoDismissed]);

    // Unlock audio instantly when the user touches or clicks ANYWHERE on the screen
    useEffect(() => {
        const unlockAudio = () => {
            if (audioRef.current && audioRef.current.paused) {
                // Sync the audio to exactly where the video is right now!
                if (videoRef.current) {
                    audioRef.current.currentTime = videoRef.current.currentTime;
                }
                audioRef.current.play().catch(() => {});
            }
        };
        
        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
        return () => {
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
    }, []);

    const handleVideoEnd = () => {
        setShowButton(true);
    };

    const handleVideoError = () => {
        // Automatically try the uppercase version if the lowercase one fails!
        if (videoSrc === "/alpha-intro.mp4") {
            setVideoSrc("/Alpha-intro.mp4");
        } else {
            setShowButton(true);
        }
    };

    const handleAudioError = () => {
        if (audioSrc === "/alpha-intro-audio.mp3") {
            setAudioSrc("/Alpha-intro-audio.mp3");
        }
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
        <div className="intro-container">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={handleVideoEnd}
                onError={handleVideoError}
                className="intro-video"
                src={videoSrc}
            />
            
            <audio ref={audioRef} src={audioSrc} preload="auto" onError={handleAudioError} />

            {showButton && (
                <div className="overlay-wrapper">
                    <div className="button-container">
                        <button 
                            className="glass-button"
                            onClick={handleGetStarted}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .intro-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100dvh;
                    background-color: #000;
                    overflow: hidden;
                    z-index: 9999;
                }

                .intro-video {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center center;
                    background-color: #000;
                }

                @media (min-width: 768px) {
                    .intro-video {
                        object-fit: contain;
                        background-color: #000;
                    }
                }

                .overlay-wrapper {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 10;
                }

                .button-container {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    padding-bottom: max(6dvh, 40px);
                    pointer-events: auto;
                }

                .glass-button {
                    padding: 14px 40px;
                    font-size: 15px;
                    font-weight: 600;
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
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    white-space: nowrap;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                }

                .glass-button:hover {
                    transform: scale(1.05);
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