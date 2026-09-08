import { formatSidebarTime } from "../utils/formatSiderbarTime";
import "./UserItem.css";

const UserItem = ({
  chatUser,
  onlineUsers,
  selectedUser,
  setSelectedUser,
  currentUser,
  typingUsers,
}) => {
  const isOnline = onlineUsers.includes(chatUser._id);

  const isSelected = selectedUser?._id === chatUser._id;

  const isTyping = typingUsers?.includes(chatUser._id);

  return (
    <div
      className={`user-item ${isSelected ? "active-user" : ""}`}
      onClick={() => setSelectedUser(chatUser)}
    >
      <div className="user-avatar">
        {chatUser.profilePic ? (
          <img
            src={`http://localhost:5000/${chatUser.profilePic}`}
            alt={chatUser.fullName}
            className="avatar-image"
          />
        ) : (
          chatUser.fullName.charAt(0).toUpperCase()
        )}

        {isOnline && <span className="online-dot"></span>}
      </div>

      <div className="user-details">
        <div className="user-top">
          <h6>{chatUser.fullName}</h6>

          <div className="user-right">
            {chatUser.lastMessageTime && (
              <span className="message-time">
                {formatSidebarTime(chatUser.lastMessageTime)}
              </span>
            )}

            {chatUser.unreadCount > 0 && (
              <span className="unread-badge">{chatUser.unreadCount}</span>
            )}
          </div>
        </div>

        <p className="last-message">
          {isTyping ? (
            <span className="typing-text">Typing...</span>
          ) : (
            <>
              {chatUser.lastMessageSender === currentUser._id && (
                <span className="sidebar-tick">
                  {chatUser.lastMessageSeen ? "✓✓" : "✓"}
                </span>
              )}

              {chatUser.lastMessage || "Start chatting..."}
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default UserItem;
