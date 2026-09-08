import { Card } from "react-bootstrap";
import { FaPhoneAlt, FaVideo, FaEllipsisV } from "react-icons/fa";

import "./ChatHeader.css";

const ChatHeader = ({ selectedUser, isTyping, onlineUsers }) => {
  const isOnline = selectedUser && onlineUsers.includes(selectedUser._id);
  return (
    <Card.Header className="chat-header">
      {selectedUser ? (
        <>
          <div className="chat-user-info">
            <div className="chat-avatar">
              {selectedUser.profilePic ? (
                <img
                  src={`http://localhost:5000/${selectedUser.profilePic}`}
                  alt={selectedUser.fullName}
                  className="chat-avatar-img"
                />
              ) : (
                selectedUser.fullName.charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <h5 className="chat-name">{selectedUser.fullName}</h5>

              <small className="chat-status">
                {isTyping ? "Typing..." : isOnline ? "Online" : "Offline"}
              </small>
            </div>
          </div>

          <div className="chat-actions">
            <button className="chat-action-btn">
              <FaPhoneAlt />
            </button>

            <button className="chat-action-btn">
              <FaVideo />
            </button>

            <button className="chat-action-btn">
              <FaEllipsisV />
            </button>
          </div>
        </>
      ) : (
        <h4>Select a User</h4>
      )}
    </Card.Header>
  );
};

export default ChatHeader;
