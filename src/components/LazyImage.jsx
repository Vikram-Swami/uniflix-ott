import { useState } from "react";

export default function LazyImage({ src, alt, fallback, className }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className="relative w-full h-full overflow-hidden">

            {/* Placeholder */}
            {!loaded && (
                <div className="absolute inset-0 aspect-video w-full h-full bg-gray-300/20 shimmer"></div>
            )}

            {/* Real Image */}
            <img
                src={src}
                alt={alt}
                className={`object-cover w-full h-full transition-opacity duration-500
          ${loaded ? "opacity-100" : "opacity-0 absolute top-0 left-0"} ${className}`}
                onLoad={() => setLoaded(true)}
                onError={(e) => {
                    if (fallback) e.currentTarget.src = fallback;
                    setLoaded(true);
                }}
            />
        </div>
    );
}
