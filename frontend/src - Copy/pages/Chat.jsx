import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { io } from "socket.io-client";
import Sidebar from "../components/SideBar";
import MessageList from "../components/MessageList";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import ChatHeader from "../components/ChatHeader";
import MessageInput from "../components/MessageInput";

const Chat = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const socket = useRef(null);
  const typingTimeout = useRef(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/message/${selectedUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Messages:", response.data);

      setMessages(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const markMessagesAsSeen = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/message/seen/${selectedUser._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/api/message/send/${selectedUser._id}`,
        {
          message: newMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("New Message:", response.data);

      setMessages((prevMessages) => [...prevMessages, response.data]);

      setNewMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!selectedUser) return;

    socket.current.emit("typing", {
      senderId: user._id,
      receiverId: selectedUser._id,
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      markMessagesAsSeen();
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!user) return;

    socket.current = io("http://localhost:5000", {
      query: {
        userId: user._id,
      },
    });

    socket.current.off("newMessage");
    socket.current.on("newMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.current.off("onlineUsers");
    socket.current.on("onlineUsers", (onlineUsers) => {
      setOnlineUsers(onlineUsers);
    });

    socket.current.off("typing");
    socket.current.on("typing", ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) {
        setIsTyping(true);

        clearTimeout(typingTimeout.current);

        typingTimeout.current = setTimeout(() => {
          setIsTyping(false);
        }, 1000);
      }
    });

    socket.current.off("messagesSeen");
    socket.current.on("messagesSeen", ({ receiverId }) => {
      console.log("messagesSeen event received");
      console.log(receiverId);

      setMessages((prevMessages) => {
        const updated = prevMessages.map((message) => {
          console.log(
            message.senderId,
            user._id,
            message.receiverId,
            receiverId,
          );

          if (
            String(message.senderId) === String(user._id) &&
            String(message.receiverId) === String(receiverId)
          ) {
            console.log("MATCH FOUND", message);
            return {
              ...message,
              seen: true,
            };
          }

          return message;
        });

        console.log(updated);

        return updated;
      });
    });

    return () => {
      socket.current.disconnect();
    };
  }, [user]);

  return (
    <Container fluid className="mt-3">
      <Row>
        {/* Left Side */}
        <Col md={4}>
          <Sidebar
            users={users}
            onlineUsers={onlineUsers}
            setSelectedUser={setSelectedUser}
          />
        </Col>

        {/* Right Side */}
        <Col md={8}>
          <Card className="h-100 shadow">
            <ChatHeader selectedUser={selectedUser} isTyping={isTyping} />

            <Card.Body
              style={{
                height: "500px",
                overflowY: "auto",
              }}
            >
              {selectedUser ? (
                <MessageList messages={messages} user={user} />
              ) : (
                <h5 className="text-center text-muted mt-5">
                  Select a user to start chatting
                </h5>
              )}
            </Card.Body>

            {selectedUser && (
              <MessageInput
                newMessage={newMessage}
                handleTyping={handleTyping}
                sendMessage={sendMessage}
              />
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;
