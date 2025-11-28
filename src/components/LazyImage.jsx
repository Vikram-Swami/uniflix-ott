import { useState } from "react";

export default function LazyImage({ src, alt, fallback, className }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className="relative w-full h-full overflow-hidden">

            {/* Placeholder */}
            {!loaded && (
                <div className="aspect-video w-full h-full bg-gray-300/20 shimmer"></div>
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
