import { useState } from "react";
import { Link } from "react-router-dom";
import "./HomeScreen.css";

function HomeScreen() {
  const [room, setRoom] = useState("0");
  const [username, setUsername] = useState("0");
  const [ip, setip] = useState("");

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log( this.responseText);
      setip(this.responseText);
    }
  };
  xhttp.open("GET", "//api.ipify.org?format=json", true);
  xhttp.send();


  return (
    <form method="post" action="">
      <label for="username">Username</label>
      <div><h1>Your IP {ip}</h1></div>

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
