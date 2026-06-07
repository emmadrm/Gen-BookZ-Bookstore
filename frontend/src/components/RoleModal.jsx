import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const roles = [
  {
    value: "READER",
    label: "Αναγνώστης",
    description: "Αγοράστε βιβλία, γράψτε κριτικές και κάντε ερωτήσεις.",
    icon: "📚",
  },
  {
    value: "AUTHOR",
    label: "Συγγραφέας",
    description: "Δείτε στατιστικά πωλήσεων και απαντήστε σε σχόλια.",
    icon: "✍️",
  },
];

const RoleModal = ({ onRoleSelected }) => {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    await onRoleSelected(selected);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-black mb-2">Καλώς ήρθατε!</h2>
        <p className="text-gray-500 mb-6">
          Παρακαλώ επιλέξτε τον ρόλο σας για να συνεχίσετε.
        </p>

        <div className="space-y-3 mb-6">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelected(role.value)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                selected === role.value
                  ? "border-yellow-800 bg-yellow-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{role.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800">{role.label}</p>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected || loading}
          className="w-full py-3 rounded-full bg-gradient-to-r from-yellow-900 to-red-100 text-white font-medium disabled:opacity-40 transition-opacity"
        >
          {loading ? "Αποθήκευση..." : "Συνέχεια"}
        </button>
      </motion.div>
    </div>
  );
};

export default RoleModal;
