import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { io } from "socket.io-client";

import Sidebar from "../components/SideBar";
import MessageList from "../components/MessageList";
import ChatHeader from "../components/ChatHeader";
import MessageInput from "../components/MessageInput";

import { Container, Row, Col, Card } from "react-bootstrap";

const Chat = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState("");

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [isTyping, setIsTyping] = useState(false);

  const [typingUsers, setTypingUsers] = useState([]);
  const [replyMessage, setReplyMessage] = useState(null);

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

      const sortedUsers = response.data.sort((a, b) => {
        if (!a.lastMessageTime) return 1;

        if (!b.lastMessageTime) return -1;

        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      });

      setUsers(sortedUsers);
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

      setMessages(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const markMessagesAsSeen = async (senderId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/message/seen/${senderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = async (message, file) => {
    if (!message.trim() && !file) return;

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("message", message);

      if (replyMessage) {
        formData.append("replyTo", replyMessage._id);
      }

      if (file) {
        formData.append("file", file);
      }

      const response = await axios.post(
        `http://localhost:5000/api/message/send/${selectedUser._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessages((prevMessages) => [...prevMessages, response.data]);

      await fetchUsers();

      setNewMessage("");
      setReplyMessage(null);
    } catch (error) {
      console.log(error);
    }
  };

  const addReaction = async (messageId, emoji) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/message/reaction/${messageId}`,
        { emoji },
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

    const handleFocus = () => {
      fetchUsers();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      markMessagesAsSeen(selectedUser._id);
      fetchUsers();
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

    socket.current.on("newMessage", async (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      await fetchUsers();

      if (
        selectedUser &&
        String(newMessage.senderId) === String(selectedUser._id)
      ) {
        await markMessagesAsSeen(newMessage.senderId);
      }
    });

    socket.current.off("onlineUsers");

    socket.current.on("onlineUsers", (onlineUsers) => {
      setOnlineUsers(onlineUsers);
    });

    socket.current.off("typing");

    socket.current.on("typing", ({ senderId }) => {
      setTypingUsers((prev) => {
        if (prev.includes(senderId)) return prev;
        return [...prev, senderId];
      });

      if (selectedUser && senderId === selectedUser._id) {
        setIsTyping(true);
      }

      clearTimeout(typingTimeout.current);

      typingTimeout.current = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((id) => id !== senderId));

        setIsTyping(false);
      }, 1000);
    });

    socket.current.off("messagesSeen");

    socket.current.on("messagesSeen", async ({ receiverId }) => {
      setMessages((prevMessages) => {
        return prevMessages.map((message) => {
          if (
            String(message.senderId) === String(user._id) &&
            String(message.receiverId) === String(receiverId)
          ) {
            return {
              ...message,
              seen: true,
            };
          }

          return message;
        });
      });

      await fetchUsers();
    });

    socket.current.off("reactionUpdated");

    socket.current.on("reactionUpdated", (updatedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message._id === updatedMessage._id ? updatedMessage : message,
        ),
      );
    });

    return () => {
      socket.current.disconnect();
    };
  }, [user, selectedUser]);

  return (
    <Container fluid className="mt-3">
      <Row>
        {/* Sidebar */}

        <Col md={4}>
          <Sidebar
            users={users}
            onlineUsers={onlineUsers}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            currentUser={user}
            typingUsers={typingUsers}
          />
        </Col>

        {/* Chat Area */}

        <Col md={8}>
          <Card className="h-100 shadow">
            <ChatHeader
              selectedUser={selectedUser}
              isTyping={isTyping}
              onlineUsers={onlineUsers}
            />

            <Card.Body
              style={{
                height: "500px",
                overflowY: "auto",
              }}
            >
              {selectedUser ? (
                <MessageList
                  messages={messages}
                  user={user}
                  setReplyMessage={setReplyMessage}
                  addReaction={addReaction}
                />
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
                replyMessage={replyMessage}
                setReplyMessage={setReplyMessage}
              />
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;
