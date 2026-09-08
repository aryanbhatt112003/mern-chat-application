import { useState, useRef, useEffect } from "react";
import { Card, Form } from "react-bootstrap";
import { FaPaperclip, FaPaperPlane, FaTimes } from "react-icons/fa";
import { Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import "./MessageInput.css";

const MessageInput = ({
  newMessage,
  handleTyping,
  sendMessage,
  replyMessage,
  setReplyMessage,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const emojiRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiData) => {
    handleTyping({
      target: {
        value: newMessage + emojiData.emoji,
      },
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    } else {
      setImagePreview(null);
    }
  };

  const removeSelectedFile = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedFile(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    await sendMessage(newMessage, selectedFile);

    setSelectedFile(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      {showEmojiPicker && (
        <div className="emoji-picker" ref={emojiRef}>
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      {selectedFile && (
        <div className="selected-file">
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="image-preview" />
          )}

          <div className="file-info">
            <span>📎 {selectedFile.name}</span>

            <button className="remove-file-btn" onClick={removeSelectedFile}>
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {replyMessage && (
        <div className="reply-preview">
          <div className="reply-content">
            <strong>
              {replyMessage.senderId === replyMessage.receiverId
                ? "You"
                : "Replying"}
            </strong>

            <p>
              {replyMessage.text
                ? replyMessage.text
                : replyMessage.file
                  ? "📷 Photo"
                  : ""}
            </p>
          </div>

          <button className="reply-close" onClick={() => setReplyMessage(null)}>
            ✕
          </button>
        </div>
      )}

      <Card.Footer className="message-input-footer">
        <button
          className="input-icon"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile size={24} />
        </button>

        <button
          type="button"
          className="input-icon"
          onClick={() => fileInputRef.current.click()}
        >
          <FaPaperclip />
        </button>

        <Form.Control
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleTyping}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          className="message-input"
        />

        <button className="send-btn" onClick={handleSend}>
          <FaPaperPlane />
        </button>
      </Card.Footer>
    </>
  );
};

export default MessageInput;
