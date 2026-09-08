import { useEffect, useRef } from "react";

const MessageList = ({ messages, user }) => {
  const lastMessageRef = useRef(null);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  console.log(
    typeof messages[0]?.senderId,
    messages[0]?.senderId,
    typeof user._id,
    user._id,
  );

  return (
    <div style={{ minHeight: "400px" }}>
      {messages.map((message, index) => {
        const isMyMessage =
          message.senderId?.toString() === user._id?.toString();

        return (
          <div
            key={message._id}
            ref={index === messages.length - 1 ? lastMessageRef : null}
            className={`d-flex ${
              isMyMessage ? "justify-content-end" : "justify-content-start"
            } mb-2`}
          >
            <div
              className={`p-3 rounded-4 shadow-sm ${
                isMyMessage ? "bg-success text-white" : "bg-white border"
              }`}
              style={{
                maxWidth: "70%",
                wordBreak: "break-word",
              }}
            >
              {/* Message Text */}
              <div>{message.text}</div>

              {/* Seen Status */}
              {isMyMessage && (
                <div
                  className="text-end mt-1"
                  style={{
                    fontSize: "12px",
                    opacity: 0.8,
                  }}
                >
                  {message.seen ? "✓✓" : "✓"}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
