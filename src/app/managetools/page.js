'use client';

import { useRouter } from 'next/navigation';
import ToolsmasterHeader from '../../../components/ToolsmasterHeader/page';
import styles from './managetools.module.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import useRoleGuard from '../../../hooks/useRoleGuard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

export default function Managetools() {
  useRoleGuard(['toolsmaster']);
  const router = useRouter();
  const [fetchData, setFetchData] = useState([]);
  const [visibleImages, setVisibleImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedToolToDelete, setSelectedToolToDelete] = useState(null);

  const toggleImages = (itemId) => {
    setVisibleImages((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  useEffect(() => {
    const fetchtools = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/managetool`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            token: token,
          },
        });

        const data = await response.json();
        if (Array.isArray(data)) {
          setFetchData(data);
        } else {
          console.error('Expected array, got:', data);
          setFetchData([]);
        }
      } catch (err) {
        console.error('Error while fetching tools', err.message);
        toast.error('Failed to fetch tools');
      } finally {
        setLoading(false);
      }
    };

    fetchtools();
  }, []);

  const handleDelete = async () => {
    if (!selectedToolToDelete) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/deletetool/${selectedToolToDelete}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      setFetchData((prev) => prev.filter((tool) => tool.item_id !== selectedToolToDelete));
      toast.success('Tool deleted successfully');
    } catch (err) {
      console.error('Delete error:', err.message);
      toast.error('Failed to delete tool');
    } finally {
      setSelectedToolToDelete(null);
    }
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <ToolsmasterHeader />

      <AlertDialog.Root open={!!selectedToolToDelete} onOpenChange={() => setSelectedToolToDelete(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <AlertDialog.Content className="fixed top-[30%] left-[50%] -translate-x-1/2 bg-white p-6 rounded-md shadow-xl w-[90%] max-w-md z-50">
            <AlertDialog.Title className="text-lg font-bold mb-2">Confirm Deletion</AlertDialog.Title>
            <AlertDialog.Description className="mb-4 text-sm text-gray-600">
              Are you sure you want to delete this tool? This action cannot be undone.
            </AlertDialog.Description>
            <div className="flex justify-end gap-4">
              <AlertDialog.Cancel className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <div className={styles.managetools_main_container}>
        <div className={styles.cards_main_container}>
          <h1 className="mb-5 font-bold">Manage Tools</h1>

          {loading ? (
            <div className="text-gray-600 text-lg flex items-center gap-3">
              <div className="w-5 h-5 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              Loading tools...
            </div>
          ) : (
            fetchData.map((tool, key) => (
              <div className={styles.cards} key={key}>
                <div className={styles.card_top_part_div}>
                  <div className={styles.image}>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${tool.image1 || 'default.jpg'}`}
                      alt="item image"
                      height={100}
                      width={100}
                    />
                  </div>

                  <div className={styles.id_and_images_div}>
                    <div className={styles.item_id}>
                      <h1>Item Id: {tool.item_id}</h1>
                    </div>
                    <div className={styles.show_images_div}>
                      <button onClick={() => toggleImages(tool.item_id)}>
                        {visibleImages[tool.item_id] ? 'Hide Images' : 'Show Images'}
                      </button>
                    </div>
                  </div>

                  <div className={styles.title_and_price_wrapper}>
                    <div className={styles.title}>
                      <h1>{tool.title}</h1>
                    </div>
                    <div className={styles.price}>
                      <h1>₹{tool.price}</h1>
                    </div>
                  </div>

                  <div className={styles.edit_and_delete}>
                    <div className={styles.edit}>
                      <button onClick={() => router.push(`/edittoolsbyadmin/${tool.item_id}`)}>Edit</button>
                    </div>
                    <div className={styles.delete}>
                      <button onClick={() => setSelectedToolToDelete(tool.item_id)}>Delete</button>
                    </div>
                  </div>
                </div>

                <div className={styles.card_bottom_part_div}>
                  {visibleImages[tool.item_id] && (
                    <div className={styles.sides_images_div}>
                      {[tool.image1, tool.image2, tool.image3, tool.image4]
                        .filter((img) => img)
                        .map((img, idx) => (
                          <Image
                            key={idx}
                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${img}`}
                            height={100}
                            width={100}
                            alt={`side-img-${idx + 1}`}
                          />
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
