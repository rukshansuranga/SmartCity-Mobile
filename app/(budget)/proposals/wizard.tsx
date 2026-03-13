import { getDraftBudget } from "@/api/budgetAction";
import { BudgetColors } from "@/constants/budgetColors";
import { useAuthStore } from "@/stores/authStore";
import { useProposalStore } from "@/stores/proposalStore";
import { DraftBudgetOverview } from "@/types/budget";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProposalWizardScreen() {
  const router = useRouter();
  const selectedCouncil = useAuthStore((state) => state.selectedCouncil);
  const { submitNewProposal, isSubmitting } = useProposalStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [draftBudget, setDraftBudget] = useState<DraftBudgetOverview | null>(
    null,
  );

  // Form data
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  useEffect(() => {
    loadDraftBudget();
  }, []);

  const loadDraftBudget = async () => {
    try {
      const response = await getDraftBudget();
      if (response.isSuccess) {
        setDraftBudget(response.data);
      }
    } catch (err) {
      console.error("Failed to load draft budget", err);
    }
  };

  const getCategoryIcon = (name: string): any => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("park") || lowerName.includes("space"))
      return "tree";
    if (lowerName.includes("infrastructure") || lowerName.includes("road"))
      return "road-variant";
    if (lowerName.includes("education") || lowerName.includes("school"))
      return "school";
    if (lowerName.includes("waste") || lowerName.includes("garbage"))
      return "delete";
    if (lowerName.includes("health")) return "hospital-box";
    if (lowerName.includes("environment")) return "leaf";
    return "folder";
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedCategory) {
      Alert.alert("Required", "Please select a category");
      return;
    }
    if (currentStep === 2) {
      if (!title.trim()) {
        Alert.alert("Required", "Please enter a title");
        return;
      }
      if (!description.trim()) {
        Alert.alert("Required", "Please enter a description");
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async () => {
    if (!estimatedCost || parseFloat(estimatedCost) <= 0) {
      Alert.alert("Required", "Please enter a valid cost estimate");
      return;
    }

    if (!selectedCategory) return;

    const success = await submitNewProposal({
      categoryId: selectedCategory,
      title: title.trim(),
      description: description.trim(),
      estimatedCost: parseFloat(estimatedCost),
    });

    if (success) {
      Alert.alert("Success!", "Your proposal has been submitted successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    }
  };

  const selectedCategoryData = draftBudget?.categories.find(
    (c) => c.categoryId === selectedCategory,
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Progress Bar */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-semibold text-gray-700">
            Step {currentStep} of 3
          </Text>
          <Text className="text-sm text-gray-500">
            {currentStep === 1 && "Category"}
            {currentStep === 2 && "Details"}
            {currentStep === 3 && "Cost"}
          </Text>
        </View>
        <View className="flex-row gap-2">
          {[1, 2, 3].map((step) => (
            <View
              key={step}
              className="flex-1 h-2 rounded-full"
              style={{
                backgroundColor:
                  step <= currentStep ? BudgetColors.primary.green : "#E2E8F0",
              }}
            />
          ))}
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Step 1: Category Selection */}
        {currentStep === 1 && (
          <View className="p-4">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              Choose a Category
            </Text>
            <Text className="text-sm text-gray-600 mb-6">
              Select the category that best fits your idea
            </Text>

            {draftBudget?.categories.map((category) => (
              <TouchableOpacity
                key={category.categoryId}
                onPress={() => setSelectedCategory(category.categoryId)}
                className="bg-white rounded-xl p-4 mb-3 border-2"
                style={{
                  borderColor:
                    selectedCategory === category.categoryId
                      ? BudgetColors.primary.green
                      : "#E2E8F0",
                }}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                    style={{
                      backgroundColor:
                        selectedCategory === category.categoryId
                          ? BudgetColors.primary.green + "20"
                          : "#F1F5F9",
                    }}
                  >
                    <MaterialCommunityIcons
                      name={getCategoryIcon(category.name)}
                      size={32}
                      color={
                        selectedCategory === category.categoryId
                          ? BudgetColors.primary.green
                          : "#64748B"
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800">
                      {category.name}
                    </Text>
                    {category.description && (
                      <Text className="text-sm text-gray-600 mt-1">
                        {category.description}
                      </Text>
                    )}
                  </View>
                  {selectedCategory === category.categoryId && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={28}
                      color={BudgetColors.primary.green}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2: Project Details */}
        {currentStep === 2 && (
          <View className="p-4">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              Describe Your Idea
            </Text>
            <Text className="text-sm text-gray-600 mb-6">
              Help others understand what you're proposing
            </Text>

            {selectedCategoryData && (
              <View className="bg-white rounded-lg p-3 mb-4 flex-row items-center">
                <MaterialCommunityIcons
                  name={getCategoryIcon(selectedCategoryData.name)}
                  size={24}
                  color={BudgetColors.primary.green}
                />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  {selectedCategoryData.name}
                </Text>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Title *
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Solar Panels for Library"
                className="bg-white rounded-xl px-4 py-3 text-base border border-gray-200"
                maxLength={100}
              />
              <Text className="text-xs text-gray-500 mt-1 text-right">
                {title.length}/100
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Description * (max 500 characters)
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Explain your idea in detail..."
                className="bg-white rounded-xl px-4 py-3 text-base border border-gray-200"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text className="text-xs text-gray-500 mt-1 text-right">
                {description.length}/500
              </Text>
            </View>
          </View>
        )}

        {/* Step 3: Cost Estimate */}
        {currentStep === 3 && (
          <View className="p-4">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              Estimated Cost
            </Text>
            <Text className="text-sm text-gray-600 mb-6">
              How much do you think this will cost?
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Cost Estimate ($)
              </Text>
              <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
                <Text className="text-2xl text-gray-800 mr-2">$</Text>
                <TextInput
                  value={estimatedCost}
                  onChangeText={setEstimatedCost}
                  placeholder="75,000"
                  keyboardType="numeric"
                  className="flex-1 text-2xl"
                />
              </View>
            </View>

            <View className="bg-blue-50 rounded-xl p-4 mb-6">
              <View className="flex-row items-start">
                <MaterialCommunityIcons
                  name="lightbulb-on"
                  size={24}
                  color="#3B82F6"
                />
                <Text className="flex-1 text-sm text-blue-800 ml-3">
                  💡 Tip: Be realistic! The council will review the feasibility
                  of your proposal.
                </Text>
              </View>
            </View>

            {/* Preview */}
            <View className="bg-white rounded-xl p-4 border border-gray-200">
              <Text className="text-sm font-semibold text-gray-700 mb-3">
                Preview
              </Text>
              <View className="flex-row items-start mb-2">
                <MaterialCommunityIcons
                  name={getCategoryIcon(selectedCategoryData?.name || "")}
                  size={24}
                  color={BudgetColors.primary.green}
                />
                <View className="flex-1 ml-3">
                  <Text className="text-lg font-bold text-gray-800">
                    {title}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {selectedCategoryData?.name} • $
                    {parseFloat(estimatedCost || "0").toLocaleString()}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-gray-600 mt-2">{description}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View className="bg-white border-t border-gray-200 p-4">
        <View className="flex-row gap-3">
          {currentStep > 1 && (
            <TouchableOpacity
              onPress={() => setCurrentStep(currentStep - 1)}
              className="flex-1 bg-gray-100 rounded-xl py-4 items-center"
            >
              <Text className="text-base font-semibold text-gray-700">
                ← Back
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={currentStep === 3 ? handleSubmit : handleNext}
            disabled={isSubmitting}
            className="flex-1 rounded-xl py-4 items-center"
            style={{
              backgroundColor: isSubmitting
                ? "#CBD5E1"
                : BudgetColors.primary.green,
            }}
          >
            <Text className="text-base font-semibold text-white">
              {isSubmitting
                ? "Submitting..."
                : currentStep === 3
                  ? "Submit Proposal"
                  : "Next Step →"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
