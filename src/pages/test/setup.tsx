import { useState } from "react";

const Home = () => {
  const [roomID, setRoomID] = useState("");
  const [token, setToken] = useState("");

  const createRoom = async () => {
    const response = await fetch("/api/room/create");
    const data = await response.json();
    if (data && data?.id) {
      setRoomID(data.id);
    }
  };

  const addUser = async () => {
    const body = {
      roomID,
      name: "kseikyo",
    };
    const response = await fetch("/api/room/addUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    console.log("user data", data);
    if (data && data?.token) {
      setToken(data.token);
    }
  };

  // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoia3NlaWt5byIsInZpZGVvIjp7InJvb21Kb2luIjp0cnVlLCJyb29tIjoiM2M1OGFjMmMtNjFlNi00NjUyLWFkOTYtM2ZkMGZmMGVkMTI2In0sImlhdCI6MTY4NjY3MDEyMSwibmJmIjoxNjg2NjcwMTIxLCJleHAiOjE2ODY2NzA0MjEsImlzcyI6IkFQSTU0RDR3OHNDZndlViIsInN1YiI6IjgwOTEzYTJiLWFhYTItNDJjZC1iYWRjLTU0ZDA2NWNlYjAzMSIsImp0aSI6IjgwOTEzYTJiLWFhYTItNDJjZC1iYWRjLTU0ZDA2NWNlYjAzMSJ9.zVzca-3XOpkVHNj-gne9nqQEUXRuGOENjVb_ovs1EzI
  // 3c58ac2c-61e6-4652-ad96-3fd0ff0ed126
  return (
    <div style={{ display: "flex", gap: "2rem", flexDirection: "column", margin: "0 auto" }}>
      <div style={{ display: "flex", gap: "2rem" }}>
        <button onClick={createRoom}>Create room</button>
        <span>roomID: {roomID}</span>
      </div>
      <div style={{ display: "flex", gap: "2rem" }}>
        <button onClick={addUser}>Add user</button>
        <span>token: {token}</span>
      </div>
    </div>
  );
};
export default Home;
