import { useEffect } from "react";
import type { CSSProperties } from "react";
import LoadingScreen from "../../components/common/LoadingScreen";
import { HORIZONTAL_PADDING_REM } from "../../constants";
import BannerSwiper from "./components/BannerSwiper";
import CategorySelector from "./components/CategorySelector";
import SectionLineSeparator from "./components/SectionLineSeparator";
import CategoriesSection from "./sections/CategoriesSection";
import FeaturedSection from "./sections/FeaturedSection";
import ThisMonthSection from "./sections/ThisMonthSection";
import TodaySection from "./sections/TodaySection";
import { motion } from "framer-motion";
import productAsync from "../../redux/async-thunk/product.thunk";
import categoriesAync from "../../redux/async-thunk/categories.thunk";
import { useAppDispatch, useAppSelector, type RootState } from "../../redux/store";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
} as const;

const HomePage = () => {
    const dispatch = useAppDispatch();
    const products = useAppSelector((state: RootState) => state.products.products);
    const categories = useAppSelector((state: RootState) => state.categories.categories);
    const isLoading = useAppSelector((state: RootState) => state.products.isLoading);

    useEffect(() => {
        dispatch(productAsync.fetchProduct({}));
        dispatch(categoriesAync.fectchCategories());
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <motion.main
            className="flex flex-col gap-4 md:gap-6 lg:gap-8 px-4 sm:px-6 md:px-8 lg:px-[var(--horizontal-padding)]"
            style={
                {
                    "--horizontal-padding": `${HORIZONTAL_PADDING_REM}rem`,
                } as CSSProperties
            }
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                variants={itemVariants}
                className="flex flex-col lg:flex-row gap-4 md:gap-8 lg:gap-16 pb-4 md:pb-8 lg:pb-16 lg:items-center"
            >
                <CategorySelector categories={categories} />
                <div
                    className="hidden lg:block w-[1px] self-stretch bg-gray-300"
                    role="separator"
                    aria-orientation="vertical"
                />
                <BannerSwiper products={products} />
            </motion.div>
            <motion.div variants={itemVariants}>
                <TodaySection items={products} />
            </motion.div>
            <motion.div variants={itemVariants}>
                <SectionLineSeparator />
            </motion.div>
            <motion.div variants={itemVariants}>
                <CategoriesSection categories={categories} />
            </motion.div>
            <motion.div variants={itemVariants}>
                <SectionLineSeparator />
            </motion.div>
            <motion.div variants={itemVariants}>
                <ThisMonthSection bestSellingProducts={products} />
            </motion.div>
            <motion.div variants={itemVariants}>
                <SectionLineSeparator />
            </motion.div>
            <motion.div variants={itemVariants}>
                <FeaturedSection featuredProducts={products} />
            </motion.div>
        </motion.main>
    );
};

export default HomePage;
