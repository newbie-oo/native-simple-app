import { icons } from "@/constants/icons";
import clsx from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<Category, string[]> = {
  Entertainment: ["#f5c542", "#f0d060", "#e8c74a", "#ffd700", "#f2b830"],
  "AI Tools": ["#b8d4e3", "#9ec5d8", "#c4dfe8", "#a8cce0", "#d0e6f0"],
  "Developer Tools": ["#e8def8", "#d4c8f0", "#f0e4ff", "#c8b8e8", "#ddd0f5"],
  Design: ["#b8e8d0", "#a0dcc0", "#c8f0dc", "#90d4b0", "#d0f0e0"],
  Productivity: ["#f0c8a8", "#e8b898", "#f5d4b8", "#dca888", "#f8dcc8"],
  Cloud: ["#a8d8f0", "#98cce8", "#b8e0f5", "#88c0e0", "#c0e4f8"],
  Music: ["#d4b8e8", "#c4a8d8", "#e0c8f0", "#b898d0", "#e8d0f5"],
  Other: ["#d4d4d4", "#c4c4c4", "#e0e0e0", "#b8b8b8", "#ececec"],
};

function pickUniqueColor(category: Category, usedColors: Set<string>): string {
  const palette = CATEGORY_COLORS[category];
  const available = palette.find((c) => !usedColors.has(c));
  if (available) return available;

  // All palette colors used — generate a random pastel
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 60%, 80%)`;
}

type Frequency = "Monthly" | "Yearly";

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
  existingColors: Set<string>;
}

const INITIAL_STATE = {
  name: "",
  price: "",
  frequency: "Monthly" as Frequency,
  category: null as Category | null,
};

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
  existingColors,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState(INITIAL_STATE.name);
  const [price, setPrice] = useState(INITIAL_STATE.price);
  const [frequency, setFrequency] = useState<Frequency>(INITIAL_STATE.frequency);
  const [category, setCategory] = useState<Category | null>(INITIAL_STATE.category);

  const parsedPrice = parseFloat(price);
  const canSubmit = name.trim().length > 0 && !isNaN(parsedPrice) && parsedPrice > 0;

  const resetForm = () => {
    setName(INITIAL_STATE.name);
    setPrice(INITIAL_STATE.price);
    setFrequency(INITIAL_STATE.frequency);
    setCategory(INITIAL_STATE.category);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const now = dayjs();
    const renewalDate =
      frequency === "Monthly" ? now.add(1, "month") : now.add(1, "year");

    const selectedCategory = category ?? "Other";

    const subscription: Subscription = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      price: parsedPrice,
      currency: "USD",
      billing: frequency,
      status: "active",
      startDate: now.toISOString(),
      renewalDate: renewalDate.toISOString(),
      icon: icons.plus,
      category: selectedCategory,
      color: pickUniqueColor(selectedCategory, existingColors),
    };

    onCreate(subscription);
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable className="modal-overlay" onPress={handleClose}>
          <Pressable className="modal-container" onPress={() => { }}>
            {/* Header */}
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <TouchableOpacity
                className="modal-close"
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text className="modal-close-text">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Body */}
            <ScrollView keyboardShouldPersistTaps="handled">
              <View className="modal-body">
                {/* Name */}
                <View className="auth-field">
                  <Text className="auth-label">Name</Text>
                  <TextInput
                    className="auth-input"
                    placeholder="Subscription name"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Price */}
                <View className="auth-field">
                  <Text className="auth-label">Price</Text>
                  <TextInput
                    className="auth-input"
                    placeholder="0.00"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    keyboardType="decimal-pad"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>

                {/* Frequency */}
                <View className="auth-field">
                  <Text className="auth-label">Frequency</Text>
                  <View className="picker-row">
                    <TouchableOpacity
                      className={clsx(
                        "picker-option",
                        frequency === "Monthly" && "picker-option-active",
                      )}
                      onPress={() => setFrequency("Monthly")}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          frequency === "Monthly" && "picker-option-text-active",
                        )}
                      >
                        Monthly
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className={clsx(
                        "picker-option",
                        frequency === "Yearly" && "picker-option-active",
                      )}
                      onPress={() => setFrequency("Yearly")}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          frequency === "Yearly" && "picker-option-text-active",
                        )}
                      >
                        Yearly
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Category */}
                <View className="auth-field">
                  <Text className="auth-label">Category</Text>
                  <View className="category-scroll">
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        className={clsx(
                          "category-chip",
                          category === cat && "category-chip-active",
                        )}
                        onPress={() => setCategory(cat)}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={clsx(
                            "category-chip-text",
                            category === cat && "category-chip-text-active",
                          )}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Submit */}
                <TouchableOpacity
                  className={clsx(
                    "auth-button",
                    !canSubmit && "auth-button-disabled",
                  )}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  activeOpacity={0.8}
                >
                  <Text className="auth-button-text">Create Subscription</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
