import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const BackgroundCarousel = ({ memories }) => {
    const [images, setImages] = useState([]);

    useEffect(() => {
        // Extract images from memories
        const validImages = memories
            .filter(m => m.image)
            .map(m => m.image);

        // Duplicate list if too short to ensure smooth loop
        if (validImages.length > 0 && validImages.length < 10) {
            setImages([...validImages, ...validImages, ...validImages, ...validImages]);
        } else {
            setImages(validImages);
        }
    }, [memories]);

    if (images.length === 0) return null;

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
            {/* Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10"></div>

            {/* Marquee Container */}
            <div className="absolute inset-0 flex flex-col justify-center opacity-40 rotate-[-5deg] scale-110">
                {/* Row 1 - Left to Right */}
                <MarqueeRow images={images} duration={40} />

                {/* Row 2 - Right to Left */}
                <MarqueeRow images={[...images].reverse()} duration={50} reverse />

                {/* Row 3 - Left to Right */}
                <MarqueeRow images={images} duration={60} />
            </div>
        </div>
    );
};

const MarqueeRow = ({ images, duration, reverse = false }) => {
    return (
        <div className="flex mb-8 gap-8">
            <motion.div
                className="flex gap-8 min-w-max"
                initial={{ x: reverse ? "-50%" : "0%" }}
                animate={{ x: reverse ? "0%" : "-50%" }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: duration,
                }}
            >
                {/* Render images twice for seamless loop */}
                {[...images, ...images].map((src, index) => (
                    <img
                        key={index}
                        src={src}
                        alt=""
                        className="h-48 w-72 object-cover rounded-2xl shadow-lg opacity-80 grayscale hover:grayscale-0 transition-all duration-700"
                    />
                ))}
            </motion.div>

            {/* Duplicate for seamless loop filling */}
            <motion.div
                className="flex gap-8 min-w-max"
                initial={{ x: reverse ? "-50%" : "0%" }}
                animate={{ x: reverse ? "0%" : "-50%" }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: duration,
                }}
            >
                {[...images, ...images].map((src, index) => (
                    <img
                        key={`dup-${index}`}
                        src={src}
                        alt=""
                        className="h-48 w-72 object-cover rounded-2xl shadow-lg opacity-80 grayscale hover:grayscale-0 transition-all duration-700"
                    />
                ))}
            </motion.div>
        </div>
    );
};

export default BackgroundCarousel;
