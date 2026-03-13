import { COMPLAINT_TEMPLATES } from "@/config/assetConfig";
import { AssetType, InfrastructureComplaint } from "@/types/infrastructure";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  assetType: AssetType;
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string, subject: string) => void;
  existingComplaints?: InfrastructureComplaint[];
  currentComplaintId?: number; // For edit mode
}

const ComplaintTemplateSelector: React.FC<Props> = ({
  assetType,
  selectedTemplateId,
  onSelectTemplate,
  existingComplaints = [],
  currentComplaintId,
}) => {
  // Convert string name to enum number if needed
  const assetTypeKey =
    typeof assetType === "number"
      ? assetType
      : AssetType[assetType as keyof typeof AssetType];
  const templates = COMPLAINT_TEMPLATES[assetTypeKey] || [];

  // Calculate counts for each template (only open complaints: status 0 or 1)
  const templateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const safeComplaints = existingComplaints || [];

    safeComplaints.forEach((complaint) => {
      // Only count open complaints (New=0, InProgress=1)
      // Exclude Resolved=2, Closed=3
      if (complaint.status === 0 || complaint.status === 1) {
        // Don't count the current complaint being edited
        if (currentComplaintId && complaint.complainId === currentComplaintId) {
          return;
        }

        const matchingTemplate = templates.find(
          (t) => t.subject === complaint.subject,
        );
        if (matchingTemplate) {
          counts[matchingTemplate.id] = (counts[matchingTemplate.id] || 0) + 1;
        }
      }
    });

    return counts;
  }, [existingComplaints, templates, currentComplaintId]);

  // Check if current complaint matches a template
  const isCurrentComplaint = (templateId: string) => {
    if (!currentComplaintId) return false;

    const template = templates.find((t) => t.id === templateId);
    if (!template) return false;

    const safeComplaints = existingComplaints || [];
    const currentComplaint = safeComplaints.find(
      (c) => c.complainId === currentComplaintId,
    );

    return currentComplaint?.subject === template.subject;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What&apos;s the problem?</Text>
      <Text style={styles.subtitle}>
        Select an issue or choose &ldquo;Other&rdquo; to describe
      </Text>

      <ScrollView
        style={styles.templateList}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        {templates.map((template) => {
          const count = templateCounts[template.id] || 0;
          const isDisabled = count > 0 && !isCurrentComplaint(template.id);
          const isEditing = isCurrentComplaint(template.id);

          return (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.button,
                selectedTemplateId === template.id && styles.buttonSelected,
                isDisabled && styles.buttonDisabled,
                isEditing && styles.buttonEditing,
              ]}
              onPress={() => {
                if (!isDisabled) {
                  onSelectTemplate(template.id, template.subject);
                }
              }}
              activeOpacity={isDisabled ? 1 : 0.7}
              disabled={isDisabled}
            >
              <Text style={[styles.icon, isDisabled && styles.iconDisabled]}>
                {template.icon}
              </Text>
              <View style={styles.labelContainer}>
                <Text
                  style={[styles.label, isDisabled && styles.labelDisabled]}
                >
                  {template.label}
                </Text>
                {count > 0 && (
                  <Text style={styles.countText}>
                    {isEditing ? `(+${count} other)` : `(${count} open)`}
                  </Text>
                )}
              </View>
              {selectedTemplateId === template.id && (
                <Text style={styles.checkmark}>✓</Text>
              )}
              {isDisabled && (
                <View style={styles.disabledBadge}>
                  <Text style={styles.disabledText}>Already Reported</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  templateList: {
    maxHeight: 400,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  buttonSelected: {
    backgroundColor: "#DBEAFE",
    borderColor: "#3B82F6",
  },
  buttonDisabled: {
    backgroundColor: "#F3F4F6",
    opacity: 0.6,
  },
  buttonEditing: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  iconDisabled: {
    opacity: 0.5,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  labelDisabled: {
    color: "#9CA3AF",
  },
  countText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  checkmark: {
    fontSize: 24,
    color: "#3B82F6",
    fontWeight: "bold",
  },
  disabledBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  disabledText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});

export default ComplaintTemplateSelector;
