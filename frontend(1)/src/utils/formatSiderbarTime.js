export const formatSidebarTime = (date) => {
  if (!date) return "";

  const messageDate = new Date(date);
  const today = new Date();

  const isToday =
    messageDate.toDateString() === today.toDateString();

  if (isToday) {
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (
    messageDate.toDateString() ===
    yesterday.toDateString()
  ) {
    return "Yesterday";
  }

  return messageDate.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
};