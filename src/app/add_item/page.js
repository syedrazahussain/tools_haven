'use client';

import { useState } from 'react';
import styles from './add_item.module.css';
import ToolsmasterHeader from '../../../components/ToolsmasterHeader/page';
import useRoleGuard from '../../../hooks/useRoleGuard';
import toast, { Toaster } from 'react-hot-toast';

export default function Additem() {
    useRoleGuard(['toolsmaster']);

    const [images, setImages] = useState([null, null, null, null]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        upi_id: ''
    });

    const [location, setLocation] = useState({
        city: '',
        latitude: '',
        longitude: ''
    });

    const [loading, setLoading] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);

    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const newImages = [...images];
            newImages[index] = file;
            setImages(newImages);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        toast.dismiss();

        const token = localStorage.getItem("token");
        const data = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });

        data.append('city', location.city);
        data.append('latitude', location.latitude);
        data.append('longitude', location.longitude);

        images.forEach((img) => {
            if (img) data.append('images', img);
        });

        try {
            const res = await fetch('http://localhost:5000/user/additem', {
                method: 'POST',
                headers: {
                    token,
                },
                body: data,
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Unknown server error");
            }

            const result = await res.json();
            console.log(result);
            setDialogVisible(true);
            toast.success("Tool added successfully!");

            // Reset form
            setFormData({ title: '', description: '', price: '', category: '', upi_id: '' });
            setImages([null, null, null, null]);
            setLocation({ city: '', latitude: '', longitude: '' });

        } catch (error) {
            console.error(error);
            toast.error("Failed to add tool");
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    city: '',
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                toast.success("Location set");
            },
            (error) => {
                console.error(error);
                toast.error("Location access denied");
            }
        );
    };

    return (
        <div>
            <ToolsmasterHeader />
            <Toaster position="top-center" reverseOrder={false} />

            <div className={styles.main_content_container}>
                <div className={styles.post_heading}>
                    <h1>POST YOUR TOOL</h1>
                </div>

                <div className={styles.form_container}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.input_field}>
                            <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} />
                        </div>

                        <div className={styles.input_field}>
                            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
                        </div>

                        <div className={styles.input_field}>
                            <input type="text" name="price" placeholder="Price per day" value={formData.price} onChange={handleChange} />
                        </div>

                        <div className={styles.input_field}>
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option value="">Select Category</option>
                                <option>Hammer</option>
                                <option>Screwdriver</option>
                                <option>Drilling</option>
                                <option>Plier</option>
                                <option>Spanner</option>
                                <option>Handsaw</option>
                            </select>
                        </div>

                        <div className={styles.input_field}>
                            <button type="button" onClick={fetchCurrentLocation}>Use My Current Location</button>
                        </div>

                        <div className={styles.input_field}>
                            <input
                                type="text"
                                placeholder="Or enter city name"
                                value={location.city}
                                onChange={(e) => setLocation({ ...location, city: e.target.value, latitude: '', longitude: '' })}
                            />
                        </div>

                        <div className={styles.input_field}>
                            <input
                                type="text"
                                name="upi_id"
                                placeholder="Enter your UPI ID (e.g., abc@upi)"
                                value={formData.upi_id}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.upload_images}>
                            {images.map((img, index) => (
                                <div key={index} className={styles.image_box}>
                                    <label htmlFor={`fileInput${index}`}>
                                        {img ? (
                                            <img src={URL.createObjectURL(img)} alt="Preview" className={styles.preview_image} />
                                        ) : (
                                            <div className={styles.placeholder}><p>+</p><p>Upload</p></div>
                                        )}
                                    </label>
                                    <input
                                        id={`fileInput${index}`}
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleImageChange(e, index)}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className={styles.register_btn}>
                            <button type="submit" disabled={loading}>
                                {loading ? 'Posting...' : 'Post Tool'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {dialogVisible && (
                <div className={styles.dialog_overlay}>
                    <div className={styles.dialog_box}>
                        <h3>Success!</h3>
                        <p>Your tool has been posted successfully.</p>
                        <button onClick={() => setDialogVisible(false)}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
}
