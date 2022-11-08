import { Link } from "react-router-dom";
import Location from "../components/Location";
import "./HomeScreen.css";

function HomeScreen({ room, setRoom, username, setUsername, clientId }) {


  return (
    <form method="post" action="">
      <Location></Location>
      <label for="username">Username</label>

      <input class="username-input"
        value={username}
        title="username"
        onInput={(e) => setUsername(e.target.value)}
      />

      <label for="room">Room</label>

      <input class="room-input"
        value={room}
        title="room"
        onInput={(e) => setRoom(e.target.value)}
      />

      <label>{"Client Id: " + clientId}</label>

      <Link to={`/call/${username}/${room}`}>
        <input id="start-call" type="submit" name="submit" value="Join Room" />
      </Link>
    </form>
  );
}

export default HomeScreen;
