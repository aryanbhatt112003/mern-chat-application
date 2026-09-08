import { Card, Form } from "react-bootstrap";
import UserItem from "./UserItem";

const Sidebar = ({ users, onlineUsers, setSelectedUser }) => {
  return (
    <Card className="shadow h-100">
      <Card.Header>
        <h4 className="mb-0">💬 Chat App</h4>
      </Card.Header>

      <Card.Body>
        <Form.Control
          type="text"
          placeholder="🔍 Search users..."
          className="mb-3"
        />

        {users.map((chatUser) => (
          <UserItem
            key={chatUser._id}
            chatUser={chatUser}
            onlineUsers={onlineUsers}
            setSelectedUser={setSelectedUser}
          />
        ))}
      </Card.Body>
    </Card>
  );
};

export default Sidebar;
