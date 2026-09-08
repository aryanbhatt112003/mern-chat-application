import { useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <div className="text-center mt-5">Loading..</div>;
  }

  const [preview, setPreview] = useState(
    user?.profilePic ? `http://localhost:5000/${user.profilePic}` : null,
  );

  const fileInputRef = useRef(null);

  const handleSelectImage = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();

    formData.append("profilePic", file);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUser(response.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card className="p-4 mx-auto mt-5" style={{ maxWidth: "400px" }}>
      <div className="text-center">
        {preview ? (
          <img
            src={preview}
            alt="profile"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "#0d6efd",
              color: "#fff",
              fontSize: "48px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto",
            }}
          >
            {user?.fullName?.charAt(0)}
          </div>
        )}

        <h4 className="mt-3">{user?.fullName}</h4>

        <p>{user?.email}</p>

        <Button onClick={handleSelectImage}>Change Profile Picture</Button>

        <input
          type="file"
          hidden
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageChange}
        />

        <Button
          variant="secondary"
          className="mt-2"
          onClick={() => navigate("/")}
        >
          Back To Chats
        </Button>
      </div>
    </Card>
  );
};

export default Profile;
