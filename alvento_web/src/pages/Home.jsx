import React, { useState, useEffect, useRef } from 'react';

// List of video sources for the infinite scroll
// CORRECTED: Added leading slash '/' to all video paths
const initialVideoSources = [
    '/video1.mp4', '/video2.mp4', '/video3.mp4', '/video4.mp4'
];
const additionalVideoSources = [
    '/video5.mp4', '/video6.mp4', '/video7.mp4', '/video8.mp4',
    '/video9.mp4', '/video10.mp4', '/video11.mp4', '/video12.mp4'
];

const Home = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fullscreenVideoSrc, setFullscreenVideoSrc] = useState('');
    const [videoList, setVideoList] = useState(initialVideoSources);

    const introContainerRef = useRef(null);
    const introVideoRef = useRef(null);
    const videoContainerRef = useRef(null);
    const scrollWrapperRef = useRef(null);
    const fullscreenPlayerRef = useRef(null);
    const playerVideoRef = useRef(null); // Ref for the video element inside the player

    // Refs for animation variables to avoid re-renders
    const scrollState = useRef({
        currentScroll: 0,
        targetScroll: 0,
        lastScroll: 0,
        scrollVelocity: 0,
        isAutoScrolling: false,
        maxScroll: 0,
        currentScale: 1.0,
        targetScale: 1.0,
    });
    const animationFrameId = useRef(null);
    const activityTimeout = useRef(null);

    // --- INTRO SEQUENCE ---
    useEffect(() => {
        const introVideo = introVideoRef.current;
        const startMainExperience = () => {
            if (introContainerRef.current) {
                scrollState.current.isAutoScrolling = true;
                introContainerRef.current.classList.add('hidden');
                // Flick scroll
                scrollState.current.targetScroll = 800;
                setTimeout(() => {
                    scrollState.current.isAutoScrolling = false;
                }, 6000);
            }
        };

        introVideo.play().catch(error => {
            console.error("Intro video autoplay failed:", error);
            startMainExperience();
        });
        introVideo.addEventListener('ended', startMainExperience);

        return () => introVideo.removeEventListener('ended', startMainExperience);
    }, []);

    // --- PHYSICS-BASED SCROLL & ANIMATION ENGINE ---
    useEffect(() => {
        const LERP_FACTOR = 0.08;
        const BASE_SCALE = 1.0;
        const MIN_SCALE = 0.9;
        const MAX_VELOCITY = 100;

        const updateAnimation = () => {
            const state = scrollState.current;
            if (scrollWrapperRef.current && videoContainerRef.current) {
                state.maxScroll = scrollWrapperRef.current.offsetHeight - videoContainerRef.current.offsetHeight;
            }

            if (!isFullscreen) {
                state.currentScroll += (state.targetScroll - state.currentScroll) * LERP_FACTOR;
            }

            state.scrollVelocity = Math.abs(state.currentScroll - state.lastScroll);
            state.lastScroll = state.currentScroll;

            if (!state.isAutoScrolling) {
                const clampedVelocity = Math.min(state.scrollVelocity, MAX_VELOCITY);
                const scaleEffect = (clampedVelocity / MAX_VELOCITY) * (BASE_SCALE - MIN_SCALE);
                state.targetScale = BASE_SCALE - scaleEffect;
            } else {
                state.targetScale = BASE_SCALE;
            }

            state.currentScale += (state.targetScale - state.currentScale) * LERP_FACTOR;

            if (scrollWrapperRef.current) {
                scrollWrapperRef.current.style.transform = `translateY(${-state.currentScroll}px)`;
            }
            if (videoContainerRef.current) {
                videoContainerRef.current.style.transform = `rotate(-4deg) scale(${state.currentScale})`;
            }

            animationFrameId.current = requestAnimationFrame(updateAnimation);
        };

        animationFrameId.current = requestAnimationFrame(updateAnimation);

        return () => cancelAnimationFrame(animationFrameId.current);
    }, [isFullscreen]);


    // --- SCROLL EVENT LISTENER ---
    useEffect(() => {
        const handleWheel = (event) => {
            if (isFullscreen) return;
            const state = scrollState.current;
            if (state.isAutoScrolling) {
                state.isAutoScrolling = false;
                state.targetScroll = state.currentScroll;
            }
            state.targetScroll += event.deltaY;
            state.targetScroll = Math.max(0, Math.min(state.targetScroll, state.maxScroll));
        };

        window.addEventListener('wheel', handleWheel);
        return () => window.removeEventListener('wheel', handleWheel);
    }, [isFullscreen]);


    // --- VIDEO LAZY LOADING & INFINITE SCROLL ---
    useEffect(() => {
        if (!scrollWrapperRef.current) return;
        const sections = scrollWrapperRef.current.querySelectorAll('.video-section');
        if (sections.length === 0) return;

        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target.querySelector('video');
                if (!video) return;
                if (entry.isIntersecting) {
                    if (video.dataset.src) {
                        video.src = video.dataset.src;
                        video.removeAttribute('data-src');
                    }
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }, { rootMargin: '100% 0px' });

        sections.forEach(section => videoObserver.observe(section));

        const lastElement = sections[sections.length - 3];
        if (lastElement) {
            const infiniteObserver = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    setVideoList(prev => [...prev, ...additionalVideoSources]);
                    infiniteObserver.unobserve(entries[0].target);
                }
            });
            infiniteObserver.observe(lastElement);
        }

        return () => videoObserver.disconnect();
    }, [videoList]);


    // --- FULLSCREEN PLAYER LOGIC ---
    const enterFullscreen = (e) => {
        const clickedSection = e.currentTarget;
        const videoInGrid = clickedSection.querySelector('video');
        if (!videoInGrid || !videoInGrid.src) return;

        setFullscreenVideoSrc(videoInGrid.src);
        setIsFullscreen(true);
    };

    const exitFullscreen = () => {
        const player = fullscreenPlayerRef.current;
        if (player) {
            player.classList.remove('active');
        }
        setTimeout(() => {
            setIsFullscreen(false);
            setFullscreenVideoSrc('');
        }, 600); // Match CSS transition
    };

    useEffect(() => {
        if (isFullscreen && fullscreenPlayerRef.current) {
            fullscreenPlayerRef.current.classList.add('active');
            const video = playerVideoRef.current;
            if (video) {
                video.play().catch(error => console.error("Playback failed:", error));
            }
        }
    }, [isFullscreen]);

    // --- FULLSCREEN PLAYER CONTROLS ---
    const [playerState, setPlayerState] = useState({
        isPlaying: false,
        isMuted: false,
        progress: 0,
        buffered: 0,
        currentTime: '00:00',
        duration: '00:00',
    });

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds === 0) return '00:00';
        const date = new Date(seconds * 1000);
        const mm = date.getUTCMinutes().toString().padStart(2, '0');
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        return `${mm}:${ss}`;
    };

    const handleTimeUpdate = (e) => {
        const video = e.target;
        const progress = (video.currentTime / video.duration) * 100;
        let buffered = 0;
        if (video.buffered.length > 0) {
            buffered = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
        }
        setPlayerState(prev => ({
            ...prev,
            progress,
            buffered,
            currentTime: formatTime(video.currentTime),
            duration: formatTime(video.duration),
        }));
    };

    const togglePlay = () => {
        const video = playerVideoRef.current;
        if (video.paused) video.play();
        else video.pause();
        setPlayerState(prev => ({ ...prev, isPlaying: !video.paused }));
    };

    const toggleMute = () => {
        const video = playerVideoRef.current;
        video.muted = !video.muted;
        setPlayerState(prev => ({ ...prev, isMuted: video.muted }));
    };

    const handleSeek = (e) => {
        const timeline = e.currentTarget;
        const rect = timeline.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        playerVideoRef.current.currentTime = percent * playerVideoRef.current.duration;
    };

    // --- Auto-hide controls logic ---
    useEffect(() => {
        const player = fullscreenPlayerRef.current;
        if (!player) return;

        const handleMouseMove = () => {
            player.classList.remove('inactive');
            if (activityTimeout.current) clearTimeout(activityTimeout.current);
            activityTimeout.current = setTimeout(() => {
                player.classList.add('inactive');
            }, 3000);
        };

        if (isFullscreen) {
            player.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            player.removeEventListener('mousemove', handleMouseMove);
            if (activityTimeout.current) clearTimeout(activityTimeout.current);
        };
    }, [isFullscreen]);


    return (
        <div className="home-body-wrapper">
            <div id="intro-container" ref={introContainerRef}>
                <video id="intro-video" src="/intro.mp4" muted playsInline ref={introVideoRef}></video>
            </div>

            <main id="video-container" ref={videoContainerRef}>
                <div id="scroll-wrapper" ref={scrollWrapperRef}>
                    {videoList.map((src, index) => {
                        const videoNumber = src.match(/video(\d+)\.mp4/)?.[1] || index + 1;
                        return (
                            <section className="video-section" key={src + index} onClick={enterFullscreen}>
                                <video muted loop playsInline data-src={src}></video>
                                <div className="video-overlay-text">video {videoNumber}</div>
                            </section>
                        );
                    })}
                </div>
            </main>

            {isFullscreen && (
                <div id="fullscreen-player" ref={fullscreenPlayerRef}>
                    <video
                        ref={playerVideoRef}
                        src={fullscreenVideoSrc}
                        className="player-video"
                        onTimeUpdate={handleTimeUpdate}
                        onProgress={handleTimeUpdate}
                        onPlay={() => setPlayerState(p => ({ ...p, isPlaying: true }))}
                        onPause={() => setPlayerState(p => ({ ...p, isPlaying: false }))}
                        onVolumeChange={(e) => setPlayerState(p => ({ ...p, isMuted: e.target.muted }))}
                        onEnded={exitFullscreen}
                        onClick={togglePlay}
                    />
                    <button id="back-button" onClick={exitFullscreen}>Back</button>

                    <div id="custom-controls-container">
                        <div id="timeline-container" onClick={handleSeek}>
                            <div id="timeline-buffered" style={{ width: `${playerState.buffered}%` }}></div>
                            <div id="timeline-progress" style={{ width: `${playerState.progress}%` }}></div>
                        </div>
                        <div className="bottom-bar">
                            <div className="controls-left">
                                <button id="play-pause-button" onClick={togglePlay}>
                                    {playerState.isPlaying ? (
                                        <svg className="pause-icon" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
                                    ) : (
                                        <svg className="play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                                    )}
                                </button>
                                <button id="volume-button" onClick={toggleMute}>
                                    {playerState.isMuted ? (
                                         <svg className="mute-icon" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"></path></svg>
                                    ) : (
                                         <svg className="volume-icon" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>
                                    )}
                                </button>
                            </div>
                            <div className="controls-right">
                                <div id="time-display">{playerState.currentTime} / {playerState.duration}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
