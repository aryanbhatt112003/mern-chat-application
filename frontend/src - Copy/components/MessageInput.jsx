import { Card, Form, Button } from "react-bootstrap";

const MessageInput = ({ newMessage, handleTyping, sendMessage }) => {
  return (
    <Card.Footer>
      <Form.Control
        type="text"
        placeholder="Type a message..."
        value={newMessage}
        onChange={handleTyping}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
      />

      <Button className="mt-2 w-100" onClick={sendMessage}>
        Send
      </Button>
    </Card.Footer>
  );
};

export default MessageInput;
