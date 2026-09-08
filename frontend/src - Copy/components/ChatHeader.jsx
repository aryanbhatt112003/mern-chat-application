import { Card } from "react-bootstrap";

const ChatHeader = ({ selectedUser, isTyping }) => {
  return (
    <Card.Header>
      {selectedUser ? (
        <>
          <h4 className="mb-0">{selectedUser.fullName}</h4>
          <small className={isTyping ? "text-success" : "text-muted"}>
            {isTyping ? "Typing..." : selectedUser.email}
          </small>
        </>
      ) : (
        <h4 className="mb-0">Select a user</h4>
      )}
    </Card.Header>
  );
};

export default ChatHeader;
