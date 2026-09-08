import { useEffect, useRef, useState } from "react";
import "./MessageList.css";
import { formatMessageDate } from "../utils/formatMessageDate";

const MessageList = ({ messages, user, setReplyMessage, addReaction }) => {
  const lastMessageRef = useRef(null);
  const [showReactionPicker, setShowReactionPicker] = useState(null);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="message-container">
      {messages.map((message, index) => {
        const isMyMessage = String(message.senderId) === String(user._id);

        const currentDate = formatMessageDate(message.createdAt);

        const previousDate =
          index > 0 ? formatMessageDate(messages[index - 1].createdAt) : null;

        const fileUrl = message.file
          ? `http://localhost:5000/${message.file.replace(/\\/g, "/")}`
          : "";

        return (
          <div key={message._id}>
            {currentDate !== previousDate && (
              <div className="date-divider">
                <span>{currentDate}</span>
              </div>
            )}

            <div
              ref={index === messages.length - 1 ? lastMessageRef : null}
              className={`message-row ${
                isMyMessage ? "my-message" : "other-message"
              }`}
            >
              <div
                className="message-bubble"
                onContextMenu={(e) => {
                  e.preventDefault();
                  setReplyMessage(message);
                }}
              >
                {message.replyTo && (
                  <div className="reply-message-box">
                    <span className="reply-sender">
                      {message.replyTo.senderId?._id === user._id
                        ? "You"
                        : message.replyTo.senderId?.fullName}
                    </span>

                    {message.replyTo.text ? (
                      <p>{message.replyTo.text}</p>
                    ) : message.replyTo.file ? (
                      <p>📷 Photo</p>
                    ) : null}
                  </div>
                )}

                {message.file ? (
                  <div className="media-message">
                    {/* Image */}
                    {message.fileType.startsWith("image/") && (
                      <img
                        src={fileUrl}
                        alt="attachment"
                        className="message-image"
                      />
                    )}

                    {/* Video */}
                    {message.fileType.startsWith("video/") && (
                      <video controls className="message-video">
                        <source src={fileUrl} type={message.fileType} />
                      </video>
                    )}

                    {/* Audio */}
                    {message.fileType.startsWith("audio/") && (
                      <audio controls className="message-audio">
                        <source src={fileUrl} type={message.fileType} />
                      </audio>
                    )}

                    {/* PDF */}
                    {message.fileType === "application/pdf" && (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="file-link"
                      >
                        📄 Open PDF
                      </a>
                    )}

                    {/* Other Files */}
                    {!message.fileType.startsWith("image/") &&
                      !message.fileType.startsWith("video/") &&
                      !message.fileType.startsWith("audio/") &&
                      message.fileType !== "application/pdf" && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="file-link"
                        >
                          📎 Download File
                        </a>
                      )}

                    {/* Caption */}
                    {message.text && (
                      <p className="message-text">{message.text}</p>
                    )}

                    {/* Footer */}
                    <div className="message-footer">
                      <span className="message-time">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {isMyMessage && (
                        <span className="message-status">
                          {message.seen ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="message-reactions">
                        {message.reactions.map((reaction) => (
                          <span key={reaction.user}>{reaction.emoji}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="message-text">{message.text}</p>

                    <div className="message-footer">
                      <span className="message-time">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {isMyMessage && (
                        <span className="message-status">
                          {message.seen ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="message-reactions">
                        {message.reactions.map((reaction) => (
                          <span key={reaction.user}>{reaction.emoji}</span>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <button
                  className="reaction-btn"
                  onClick={() =>
                    setShowReactionPicker(
                      showReactionPicker === message._id ? null : message._id,
                    )
                  }
                >
                  😊
                </button>
                {showReactionPicker === message._id && (
                  <div className="reaction-picker">
                    {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
                      <span
                        key={emoji}
                        className="reaction-emoji"
                        onClick={() => {
                          addReaction(message._id, emoji);
                          setShowReactionPicker(null);
                        }}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
