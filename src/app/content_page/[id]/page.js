"use client";

import Header from "../../../../components/Header/page";
import styles from "../content_page.module.css";
import Image from "next/image";
import item from "../../../../public/userprofile_image.webp";
import { IoSend } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BsCalendarDate } from "react-icons/bs";
import { LiaClipboardListSolid, LiaRupeeSignSolid } from "react-icons/lia";
import { RiScreenshot2Line } from "react-icons/ri";
import { GiConfirmed } from "react-icons/gi";

import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import useRoleGuard from '../../../../hooks/useRoleGuard';

export default function Content_page() {
    useRoleGuard(['renter']);
    const router = useRouter();
    const { id } = useParams();

    const [gettools, setgettools] = useState({});
    const [range, setRange] = useState([
        {
            startDate: null,
            endDate: null,
            key: "selection",
        },
    ]);
    const [showModal, setShowModal] = useState(false);
    const [selectedText, setSelectedText] = useState("Select Date");
    const [pickupOption, setPickupOption] = useState("");
    const [allTools, setAllTools] = useState([]);
    const [bookedDates, setBookedDates] = useState([]);


    useEffect(() => {
        const fetchdata = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/getItemById/${id}`);
                const data = await response.json();
                setgettools(data);
            } catch (error) {
                console.log("Error while fetching tool by id", error);
            }
        };

        const fetchAllTools = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/fetchitem`);
                const data = await res.json();
                setAllTools(data);
            } catch (error) {
                console.error("Error fetching all tools:", error);
            }
        };

        const fetchBookedDates = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/bookedDates/${id}`);
                const data = await res.json();
                setBookedDates(data.bookedDates || []);
            } catch (error) {
                console.error("Error fetching booked dates:", error);
            }
        };

        fetchdata();
        fetchAllTools();
        fetchBookedDates();
    }, [id]);

    const isFormValid = range[0].startDate && range[0].endDate && pickupOption !== "";

    const handlePayNow = () => {
        if (!isFormValid) return;
        const { startDate, endDate } = range[0];
        const queryParams = new URLSearchParams({
            itemid: id || "",
            title: gettools.title || "",
            location: gettools.city || "",
            startDate: startDate?.toLocaleDateString("en-CA") || "",   // ✅ fix
            endDate: endDate?.toLocaleDateString("en-CA") || "",       // ✅ fix
            price: gettools.price || 0,
            pickup: pickupOption,
            image: gettools.image1 || "",
            upi_id: gettools.upi_id || ""
        });
        router.push(`/summary_page?${queryParams.toString()}`);
    };

    const handleDone = () => {
        setShowModal(false);
        const { startDate, endDate } = range[0];
        if (startDate && endDate) {
            const options = { year: "numeric", month: "short", day: "numeric" };
            const start = new Date(startDate).toLocaleDateString("en-GB", options);
            const end = new Date(endDate).toLocaleDateString("en-GB", options);
            setSelectedText(`${start} to ${end}`);
        }
    };

    const disabledDates = bookedDates.map(dateStr => {
        const [year, month, day] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day);
    });


    const similarItems = allTools.filter(
        (tool) => tool.category === gettools.category && tool.item_id !== gettools.item_id
    ).slice(0, 4);

    return (
        <div>
            <Header />
            <div className={styles.main_content_container}>
                {/* Step Line */}
                <div className={styles.step_line_div}>
                    <div className={styles.step1_side_line}></div>
                    <div className={styles.step} id={styles.step1}>
                        <i className={styles.icon}><BsCalendarDate /></i>
                        <h1 className={styles.heading}>Date & Delivery</h1>

                    </div>
                    <div className={styles.step2_side_Line}></div>
                    <div className={styles.step} id={styles.step2}>
                        <i className={styles.icon}><LiaClipboardListSolid /></i>
                        <h1 id={styles.heading_summary}>Summary</h1>

                    </div>
                    <div className={styles.step3_side_Line}></div>
                    <div className={styles.step} id={styles.step3}>
                        <i className={styles.icon}><LiaRupeeSignSolid /></i>
                        <h1 id={styles.heading_payment}>Payment</h1>

                    </div>
                    {/* <div className={styles.step4_side_Line}></div>
                    <div className={styles.step} id={styles.step4}>
                        <i className={styles.icon}><RiScreenshot2Line /></i>
                        <h1 id={styles.heading_screenshot}>Add Screenshot</h1>

                    </div> */}


                    <div className={styles.step5_side_Line}></div>
                    <div className={styles.step} id={styles.step5}>
                        <i className={styles.icon}><GiConfirmed /></i>
                        <h1 id={styles.heading_success}>Success</h1>

                    </div>
                    <div className={styles.step6_side_Line}></div>

                </div>

                {/* Left */}
                <div className={styles.left_container}>
                    <div className={styles.item_image}>
                        {gettools.image1 && (
                            <Image
                                src={gettools.image1}
                                width={400}
                                height={100}
                                alt={gettools.title || 'Tool Image'}
                            />
                        )}

                    </div>

                    <div className={styles.left_inner_div}>
                        <div className={styles.item_name}><h1>{gettools.title}</h1></div>
                        <div className={styles.price}><h1>Rs:{gettools.price}/- Per Hr</h1></div>
                        <div className={styles.area}><h1>{gettools.city}</h1></div>
                        <div className={styles.description}><h1>{gettools.description}</h1></div>

                        <div className={styles.admin_div}>
                            <div className={styles.admin_heading}>
                                Tool Master Details:
                            </div>

                            <div className={styles.owner_details}><h1>Name:{gettools.username}</h1></div>
                            <div className={styles.owner_details}><h1>Email:{gettools.email}</h1></div>
                        </div>

                    </div>

                    <div className={styles.date_and_pay_btn}>

                        <div className={styles.calender_and_delivery}>

                            <div className={styles.rent_btn1}>
                                <button onClick={() => setShowModal(true)}>{selectedText}</button>
                            </div>
                            <div className={styles.rent_btn1}>
                                <select value={pickupOption} onChange={(e) => setPickupOption(e.target.value)}>
                                    <option value="">Select Pickup/Delivery</option>
                                    <option value="self">Self-pickup (free)</option>
                                    <option value="delivery">Home delivery</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.rent_btn}>
                            <button onClick={handlePayNow} disabled={!isFormValid}>Continue</button>
                        </div>
                    </div>
                </div>


                {/* Side Images */}
                <div className={styles.images_parts}>
                    {[gettools.image1, gettools.image2, gettools.image3, gettools.image4].map((img, i) =>
                        img ? (
                            <div className={styles.sides} key={i}>
                                <Image
                                    src={gettools.image1}
                                    width={160}
                                    height={0}
                                    alt={gettools.title || "Tool Image"}
                                />
                            </div>
                        ) : null
                    )}
                </div>

                {/* Comments & Similar */}
                <div className={styles.comments_sections}>
                    <div className={styles.left_part}>
                        <div className={styles.comment_input}>
                            <input type="text" placeholder="Add Comment..." />
                            <div className={styles.sub_btn_comment}>
                                <div className={styles.btn}>
                                    <button>Submit</button>
                                    <IoSend />
                                </div>
                            </div>
                        </div>

                        <div className={styles.comment_heading}>
                            <h1>Comments</h1><h2>00</h2>
                        </div>

                        <div className={styles.scroll_view}>
                            <div className={styles.users_reviews}>
                                <div className={styles.img_name}>
                                    <Image src={item} width={50} alt="User" />
                                    <div className="username"><h1>User Name</h1></div>
                                    <div className={styles.duration}><h1>00 minutes ago</h1></div>
                                </div>
                                <div className={styles.msg}>
                                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.similar_items}>
                        <div className={styles.similar_heading}><h1>Similar Items</h1></div>
                        {similarItems.length === 0 ? (
                            <p style={{ padding: '1rem' }}>No similar items found.</p>
                        ) : (
                            similarItems.map((tool) => (
                                <div className={styles.similar_container} key={tool.item_id}>
                                    <div className={styles.item_similar_image}>
                                        <Image
                                           src={tool.image1}
                                            width={80}
                                            height={70}
                                            alt={tool.title}
                                        />
                                    </div>
                                    <div className="items_details">
                                        <div className="item_similar_name"><h1>{tool.title}</h1></div>
                                        <div className="view_btn">
                                            <button onClick={() => router.push(`/content_page/${tool.item_id}`)}>View</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className={styles.modal_overlay}>
                    <div className={styles.modal_content}>
                        <h2>Select Date</h2>
                        <DateRange
                            editableDateInputs={true}
                            onChange={(item) => setRange([item.selection])}
                            moveRangeOnFirstSelection={false}
                            ranges={range}
                            minDate={new Date()}
                            rangeColors={["#09ff00"]}
                            disabledDates={disabledDates}
                        />
                        <div className={styles.modal_actions}>
                            <button onClick={handleDone}>Done</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
