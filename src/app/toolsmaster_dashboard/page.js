'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import ToolsmasterHeader from "../../../components/ToolsmasterHeader/page";
import styles from "./toolsmaster_homepage.module.css";
import Image from "next/image";
import item from "../../../public/upload_image.png";
import item1 from "../../../public/manage_tools.png";
import item2 from "../../../public/rent_request.png";
import Link from "next/link";
import useRoleGuard from "../../../hooks/useRoleGuard";
import { FaSpinner } from "react-icons/fa";

export default function ToolsmasterHomepage() {
    const authorized = useRoleGuard(['toolsmaster']); // ✅ Role check hook
    const router = useRouter();

    if (!authorized) {
        return (
            <div className={styles.loading_container}>
                <FaSpinner className="animate-spin text-4xl text-gray-600 mx-auto mt-20" />
            </div>
        );
    }

    return (
        <div>
            <ToolsmasterHeader />
            <div className={styles.dashboard_main_container}>
                <div className={styles.content_main_container}>
                    <div className={styles.cards_container}>
                        <Link href={"/add_item"}>
                            <div className={styles.card}>
                                <div className={styles.image}>
                                    <Image src={item} alt="Publish Tool" height={150} width={150} />
                                </div>
                                <div className={styles.tool_heading}>
                                    <h1>Publish Tool</h1>
                                </div>
                            </div>
                        </Link>


                        <Link href={"/managetools"}>
                            <div className={styles.card}>
                                <div className={styles.image}>
                                    <Image src={item1} alt="image" height={150} width={150} />
                                </div>
                                <div className={styles.tool_heading}>
                                    <h1>Manage Tool</h1>
                                </div>
                            </div>
                        </Link>

                        <Link href={"/list_all_rent_request"}>
                            <div className={styles.card}>
                                <div className={styles.image}>
                                    <Image src={item2} alt="image" height={150} width={150} />
                                </div>
                                <div className={styles.tool_heading}>
                                    <h1>Rent Requests</h1>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
