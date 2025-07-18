'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from '../../add_item/add_item.module.css';
import ToolsmasterHeader from '../../../../components/ToolsmasterHeader/page';
import useRoleGuard from '../../../../hooks/useRoleGuard/page';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditToolsByAdmin() {
  useRoleGuard(['toolsmaster']);
  const { item_id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const res = await fetch(`http://localhost:5000/user/gettool/${item_id}`);
        const data = await res.json();

        if (data) {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            price: data.price || '',
            category: data.category || '',
            upi_id: data.upi_id || ''
          });

          setLocation({
            city: data.city || '',
            latitude: data.latitude || '',
            longitude: data.longitude || ''
          });

          setImages([data.image1, data.image2, data.image3, data.image4].map(img => img || null));
        }
      } catch (err) {
        console.error('Failed to load tool', err);
        toast.error('Failed to load tool');
      } finally {
        setLoading(false);
      }
    };

    if (item_id) {
      fetchTool();
    }
  }, [item_id]);

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

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('upi_id', formData.upi_id);
    data.append('city', location.city);
    data.append('latitude', location.latitude);
    data.append('longitude', location.longitude);

    images.forEach((img) => {
      if (img instanceof File) {
        data.append('images', img);
      }
    });

    try {
      const res = await fetch(`http://localhost:5000/user/updatetool/${item_id}`, {
        method: 'PUT',
        body: data,
      });

      if (!res.ok) {
        const errorText = await res.text();
        toast.error("Error: " + errorText);
        return;
      }

      toast.success("Tool updated successfully");
      setTimeout(() => {
        router.push('/managetools');
      }, 1500);
    } catch (err) {
      toast.error("Failed to update tool");
    }
  };

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.warning("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          city: '',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        toast.success("Location fetched successfully");
      },
      (error) => {
        console.error("Location error:", error);
        toast.error("Failed to fetch location");
      }
    );
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <ToolsmasterHeader />
      <div className={styles.main_content_container}>
        <div className={styles.post_heading}>
          <h1>EDIT YOUR TOOL</h1>
        </div>

        {loading ? (
          <div className="text-gray-600 text-lg flex items-center gap-3">
            <div className="w-5 h-5 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            Loading tool details...
          </div>
        ) : (
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
                  onChange={(e) =>
                    setLocation({ ...location, city: e.target.value, latitude: '', longitude: '' })
                  }
                />
              </div>

              <div className={styles.input_field}>
                <input
                  type="text"
                  name="upi_id"
                  placeholder="Enter UPI ID"
                  value={formData.upi_id}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.upload_images}>
                {images.map((img, index) => (
                  <div key={index} className={styles.image_box}>
                    <label htmlFor={`fileInput${index}`}>
                      {img instanceof File ? (
                        <img src={URL.createObjectURL(img)} alt="Preview" className={styles.preview_image} />
                      ) : img ? (
                        <img src={`http://localhost:5000/uploads/${img}`} alt="Tool Img" className={styles.preview_image} />
                      ) : (
                        <div className={styles.placeholder}><p>+</p><p>Upload</p></div>
                      )}
                    </label>
                    <input
                      id={`fileInput${index}`}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageChange(e, index)}
                    />
                  </div>
                ))}
              </div>

              <div className={styles.register_btn}>
                <button type="submit">Update Tool</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
