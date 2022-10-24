import { useState } from "react";
import { Link } from "react-router-dom";
import Location from "../components/Location";
import "./HomeScreen.css";

function HomeScreen() {
  const [room, setRoom] = useState("0");
  const [username, setUsername] = useState("" + randomNum(0, 99));

  function randomNum(min, max) {
    return Math.floor(Math.random() * max) + min;
  }

  return (
    <form method="post" action="">
      <Location></Location>
      <label for="username">Username</label>

      <input
        value={username}
        title="username"
        onInput={(e) => setUsername(e.target.value)}
      />

      <label for="room">Room</label>

      <input
        value={room}
        title="room"
        onInput={(e) => setRoom(e.target.value)}
      />
      <Link to={`/call/${username}/${room}`}>
        <input type="submit" name="submit" value="Join Room" />
      </Link>
    </form>
  );
}

export default HomeScreen;
