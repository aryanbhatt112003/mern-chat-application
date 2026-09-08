import { ListGroup } from "react-bootstrap";

const UserItem = ({ chatUser, onlineUsers, setSelectedUser }) => {
  const isOnline = onlineUsers.includes(chatUser._id);
  return (
    <ListGroup className="mb-2">
      <ListGroup.Item
        action
        onClick={() => setSelectedUser(chatUser)}
        className="d-flex justify-content-between align-items-center"
      >
        <div>
          <h6 className="mb-1">👤 {chatUser.fullName}</h6>

          <small className="text-muted">{chatUser.email}</small>
        </div>

        <span
          className={`rounded-circle ${isOnline ? "bg-success" : "bg-secondary"}`}
          style={{
            width: "14px",
            height: "14px",
            display: "inline-block",
          }}
        ></span>
      </ListGroup.Item>
    </ListGroup>
  );
};

export default UserItem;
