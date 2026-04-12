import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TierConfigTab from "./loyalty/components/TierConfigTab";
import MembersTab from "./loyalty/components/MembersTab";

type TabKey = "tiers" | "members";

const TABS: { key: TabKey; label: string }[] = [
  { key: "tiers", label: "Tier Configuration" },
  { key: "members", label: "Member List" },
];

const LoyaltyManagementPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("tiers");

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Loyalty & Membership
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Configure membership tiers, discount rates, and reward points.
            </p>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          {TABS.map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              whileTap={{ scale: 0.97 }}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "tiers" ? <TierConfigTab /> : <MembersTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoyaltyManagementPage;
