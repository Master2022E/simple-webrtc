import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import CallScreen from "./CallScreen";
import HomeScreen from "./HomeScreen";
import { v4 as uuidv4 } from 'uuid';

function RouteList() {


  function randomNum(min, max) {
    return Math.floor(Math.random() * max) + min;
  }

  const [room, setRoom] = useState("0");
  const [username, setUsername] = useState("" + randomNum(0, 99));
  const [clientId] = useState(uuidv4());

  return (
    <Routes>
      <Route path="/" element={<HomeScreen room={room} setRoom={setRoom} username={username} setUsername={setUsername} clientId={clientId} />} />
      <Route path="/call/:username/:room" element={<CallScreen clientId={clientId} />} />
    </Routes>
  );
}

export default RouteList;
