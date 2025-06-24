import toast from "react-hot-toast";
import colors from "tailwindcss/colors";

interface ToastOptions {
  message: string;
  type: "success" | "error" | "loading" | "blank";
}

export function showToastMessage({ message, type }: ToastOptions) {
  const style = {
    borderRadius: "10px",
    background: colors.zinc[900],
    color: "#fff",
  };

  switch (type) {
    case "success":
      toast.success(message, { style });
      break;
    case "error":
      toast.error(message, { style });
      break;
    case "loading":
      toast.loading(message, { style });
      break;
    case "blank":
    default:
      toast(message, { style });
      break;
  }
}
