import React from 'react';

/**
 * SplashScreen (Premium UX)
 * DXOS ポータル起動時のブランド体験。
 */
export const SplashScreen: React.FC = () => {
    return (
        <div className="splash-root">
            <div className="splash-bg">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>
            <div className="splash-content">
                <div className="logo-container">
                    <h1 className="logo-text">
                        <span className="accent">TBNY</span> DXOS
                    </h1>
                    <div className="loading-bar-container">
                        <div className="loading-bar-progress"></div>
                    </div>
                    <p className="loading-status">INITIALIZING SYSTEM</p>
                </div>
            </div>

            <style>{`
                .splash-root {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #0f172a;
                    color: white;
                    z-index: 9999;
                    overflow: hidden;
                    font-family: 'Inter', sans-serif;
                }

                .splash-bg {
                    position: absolute;
                    inset: 0;
                    filter: blur(80px);
                    opacity: 0.4;
                }

                .blob {
                    position: absolute;
                    width: 40%;
                    height: 40%;
                    border-radius: 50%;
                }

                .blob-1 {
                    background: #3b82f6;
                    top: 10%;
                    left: 10%;
                    animation: drift 15s infinite alternate;
                }

                .blob-2 {
                    background: #10b981;
                    bottom: 10%;
                    right: 10%;
                    animation: drift 12s infinite alternate-reverse;
                }

                @keyframes drift {
                    from { transform: translate(0, 0) scale(1); }
                    to { transform: translate(100px, 100px) scale(1.2); }
                }

                .splash-content {
                    position: relative;
                    z-index: 10;
                    text-align: center;
                }

                .logo-text {
                    font-size: 3rem;
                    font-weight: 900;
                    letter-spacing: -0.05em;
                    margin-bottom: 2rem;
                    animation: fadeInDown 0.8s ease-out forwards;
                }

                .accent {
                    color: #10b981;
                }

                .loading-bar-container {
                    width: 240px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                    margin: 0 auto 1rem;
                    overflow: hidden;
                }

                .loading-bar-progress {
                    height: 100%;
                    width: 0;
                    background: linear-gradient(90deg, #3b82f6, #10b981);
                    animation: progress 2s ease-in-out infinite;
                }

                .loading-status {
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.3em;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                }

                @keyframes progress {
                    0% { width: 0; transform: translateX(-100%); }
                    50% { width: 50%; transform: translateX(50%); }
                    100% { width: 100%; transform: translateX(200%); }
                }

                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
