"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header/page";
import styles from "./home.module.css";
import Image from "next/image";
import herosection from "../../public/herosection.webp";
import { IoSearch } from "react-icons/io5";
import { FaHammer } from "react-icons/fa6";
import { PiScrewdriverBold } from "react-icons/pi";
import { GiDrill, GiBoltCutter, GiSpanner, GiHandSaw } from "react-icons/gi";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import { registerPush } from "./utils/subscribe";

const normalize = (str) => str.trim().toLowerCase().replace(/\s+/g, "");

const iconMap = {
  hammer: <FaHammer />,
  screwdriver: <PiScrewdriverBold />,
  drilling: <GiDrill />,
  plier: <GiBoltCutter />,
  spanner: <GiSpanner />,
  handsaw: <GiHandSaw />,
};

const allPossibleCategories = ["Hammer", "Screwdriver", "Drilling", "Spanner", "Handsaw"];

const checkAuth = async () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) return { isAuth: false, role: null };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/is_verify`, {
      headers: { token },
    });
    const verified = await res.json();
    return { isAuth: verified === true, role };
  } catch (err) {
    console.error("Auth check failed:", err);
    toast.error("Authentication check failed.");
    return { isAuth: false, role: null };
  }
};

const getPaginationPages = (current, total) => {
  const pages = [];
  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 3) pages.push(1, 2, 3, 4, "...", total);
    else if (current >= total - 2) pages.push(1, "...", total - 3, total - 2, total - 1, total);
    else pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }
  return pages;
};

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [toolsdata, setToolsData] = useState([]);
  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const itemsPerPage = 8;

  const categories = Array.from(new Set([...toolsdata.map(tool => tool.category), ...allPossibleCategories]))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    const protectRoute = async () => {
      const { isAuth, role } = await checkAuth();
      if (!isAuth || role !== "renter") {
        router.replace("/unauthorized");
      } else {
        try {
          await Promise.all([fetchTools(), getName()]);
        } finally {
          setLoading(false);
        }
      }
    };
    protectRoute();
    registerPush();
  }, [router]);

  const getName = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setName(data.username);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch user name.");
    }
  };

  const fetchTools = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/fetchitem`);
      const data = await response.json();
      setToolsData(data);
    } catch (error) {
      console.log("Error fetching tools:", error);
      toast.error("Failed to load tools.");
    }
  };

  const filteredTools = toolsdata.filter(
    tool =>
      tool.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "" || tool.category === selectedCategory)
  );

  const totalPages = Math.ceil(filteredTools.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTools = filteredTools.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div style={{ height: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <ClipLoader size={60} color="#36d7b7" />
        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    );
  }

  return (
    <div>
      <main>
        <Header />
        <ToastContainer position="top-center" autoClose={3000} />
        <div className={styles.main_container}>

          {/* Navigation */}
          <div className={styles.navigationbar_wrapper}>
            <div className={styles.navigationbar_top}>
              <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
                ☰
              </button>
              <div className={styles.nav_right_content}>
                <div className={styles.user_name}><h1>Hello, {name}</h1></div>
              </div>
            </div>

            <div className={`${styles.navigationbar_div} ${menuOpen ? styles.show : ''}`}>
              <div className={styles.nav_left_content}>
                <div className={styles.nav_item}><h1>My Account</h1></div>
                <Link href="/my_order"><div className={styles.nav_item}><h1>My Orders</h1></div></Link>
                <Link href="/toolsmaster_dashboard"><div className={styles.nav_item}><h1>Become ToolsMaster</h1></div></Link>
              </div>
              <div className={styles.nav_right1_content}>
                <div className={styles.user_name}><h1>Hello, {name}</h1></div>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className={styles.hero_section}>
            <Image src={herosection} alt="hero image" width={1600} height={500} />
            <div className={styles.hero_title}><h1>&quot;Discover Tools Haven - Rent smarter and work faster&quot;</h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className={styles.search_bar_div}>
            <div className={styles.input_container}>
              <input
                type="text"
                placeholder="Search here eg: hammer, drilling, spanner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <IoSearch className={styles.search_icon} />
            </div>
          </div>

          {/* Category Filters */}
          <div className={styles.categories_div}>
            {categories.map((category, index) => {
              const icon = iconMap[normalize(category)] || "🧰";
              return (
                <div
                  key={index}
                  className={styles.box1}
                  onClick={() => setSelectedCategory(category)}
                  style={{ backgroundColor: selectedCategory === category ? "#eee" : "", cursor: "pointer" }}
                >
                  <div className={styles.item_logo}>{icon}</div>
                  <div className={styles.item_name}><h1>{category}</h1></div>
                </div>
              );
            })}
          </div>

          {selectedCategory && (
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button className={styles.clearCategoryBtn} onClick={() => setSelectedCategory("")}>Clear Category Filter</button>
            </div>
          )}

          {/* Tool List */}
          <div className={styles.fetch_tools_main_container}>
            <div className={styles.latest_heading}><h1>Latest Posted Tools</h1></div>
            <div className={styles.main_data_container}>
              <div className={styles.row_data}>
                {paginatedTools.length === 0 ? (
                  <p style={{ padding: "1rem", fontSize: "1.2rem" }}>No tools found.</p>
                ) : (
                  paginatedTools.map(tool => (
                    <div key={tool.item_id} className={styles.item_data1}>
                      <div className={styles.item_image}>
                        <Image
                          src={
                            tool.image1.startsWith("http")
                              ? tool.image1
                              : `/uploads/${tool.image1}`
                          }
                          alt="item image"
                          width={250}
                          height={150}
                        />

                      </div>
                      <div className={styles.name_price}>
                        <div className={styles.item_name}><h1>{tool.title}</h1></div>
                        <div className={styles.price}><h1>Rs: {tool.price}/hr</h1></div>
                      </div>
                      <div className={styles.area_name}><h1>{tool.category}</h1></div>
                      <div className={styles.getrent_btn}>
                        <Link href={`/content_page/${tool.item_id}`}><button>Get Rent Now</button></Link>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination_container}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={styles.nav_button}
                  >
                    Prev
                  </button>

                  {getPaginationPages(currentPage, totalPages).map((page, idx) =>
                    page === "..." ? (
                      <span key={idx} className={styles.ellipsis}>...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`${styles.page_button} ${currentPage === page ? styles.active : ""}`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={styles.nav_button}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
