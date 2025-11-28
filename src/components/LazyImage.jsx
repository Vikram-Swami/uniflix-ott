import { useState } from "react";

export default function LazyImage({ src, alt, fallback, className }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className="relative w-full h-full overflow-hidden">

            {/* Placeholder */}
            {!loaded && (
                <img
                    src="/placeholder-blur.jpg"  // 👈 अपना placeholder
                    alt="placeholder"
                    className={`absolute inset-0 h-full w-full object-cover blur-xl scale-105 ${className}`}
                />
            )}

            {/* Real Image */}
            <img
                src={src}
                alt={alt}
                className={`transition-opacity duration-700 object-cover h-full w-full 
                    ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                onError={(e) => {
                    if (fallback) e.target.src = fallback;
                    setLoaded(true);
                }}
            />
        </div>
    );
}
