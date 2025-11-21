export const priorityFieldsGenerator = (
  value: string,
): {
  label: string;
  color: string;
  textColor: string;
} => {
  switch (value) {
    case "very_low":
      return {
        label: "Very Low",
        color: "bg-gray-100 cursor-pointer",
        textColor: "text-gray-700",
      };
    case "low":
      return {
        label: "Low",
        color: "bg-lime-100 cursor-pointer",
        textColor: "text-lime-700",
      };
    case "medium":
      return {
        label: "Medium",
        color: "bg-yellow-100 cursor-pointer",
        textColor: "text-yellow-700",
      };
    case "high":
      return {
        label: "High",
        color: "bg-orange-100 cursor-pointer",
        textColor: "text-orange-700",
      };
    case "very_high":
      return {
        label: "Very High",
        color: "bg-red-100 cursor-pointer",
        textColor: "text-red-700",
      };
    default:
      return {
        label: "Unknown",
        color: "bg-gray-100 cursor-pointer",
        textColor: "text-gray-700",
      };
  }
};
