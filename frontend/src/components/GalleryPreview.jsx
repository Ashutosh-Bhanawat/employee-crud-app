import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Loading from "./Lodding";

const GalleryPreview = () => {
    const { id } = useParams(); 
    const [images, setImages] = useState([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGalleryImages = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/employees/${id}`);
                setImages(response.data.galleryImages || []);
            } catch (error) {
                console.error("Failed to fetch gallery images:", error);
                setImages([]); 
            } finally {
                setLoading(false);
            }
        };

        fetchGalleryImages();
    }, [id]);

    if (loading) return <Loading />;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-4 text-center">Gallery Preview</h1>

            {images.length === 0 ? (
                <p className="text-center text-gray-500">No images available.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className="group relative w-full h-40 overflow-hidden rounded-lg shadow-lg"
                        >
                            <img
                                src={`http://localhost:3000/uploads/${img}`}
                                alt={`Gallery ${index}`}
                                className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white text-sm font-medium">
                                Click to enlarge
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GalleryPreview;
