import { useState } from "react";
import { Card, Form } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import UserItem from "./UserItem";
import "./Sidebar.css";
import { useNavigate } from "react-router-dom";

const Sidebar = ({
  users,
  onlineUsers,
  selectedUser,
  setSelectedUser,
  currentUser,
  typingUsers,
}) => {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((user) =>
    user.fullName?.toLowerCase().includes(search.toLowerCase()),
  );
  const navigate = useNavigate();

  return (
    <Card className="sidebar-card">
      <Card.Header className="sidebar-header">
        <h4 className="sidebar-title">💬 Chat App</h4>
        <p className="sidebar-subtitle">Stay connected</p>

        <button className="profile-link" onClick={() => navigate("/profile")}>
          My Profile
        </button>
      </Card.Header>

      <Card.Body className="sidebar-body">
        <div className="search-box">
          <FaSearch className="search-icon" />

          <Form.Control
            type="text"
            placeholder="Search users..."
            className="sidebar-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="user-list">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((chatUser) => (
              <UserItem
                key={chatUser._id}
                chatUser={chatUser}
                onlineUsers={onlineUsers}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                currentUser={currentUser}
                typingUsers={typingUsers}
              />
            ))
          ) : (
            <div className="no-user-found">No User Found</div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Sidebar;
