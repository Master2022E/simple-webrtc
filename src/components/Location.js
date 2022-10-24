import axios from "axios";
import { useEffect, useState } from "react";

const Location = () => {
  const [ip, setIp] = useState("");
  const [country, setCountry] = useState("");
  const [regionName, setRegionName] = useState("");

  const [city, setCity] = useState("");
  const [isp, setIsp] = useState("");

  const getIp = () => {
    axios
      .get("https://ifconfig.me/all.json")
      .then((response) => {
        setIp(response.data.ip_addr);
        //console.log("got the IP address: ", response.data.ip_addr);
      })
      .catch(() => {
        console.log("Could not get the IP.");
      });
  };

  const getCountry = () => {
    if (ip === "") return;
    const signalUrl = process.env.REACT_APP_SIGNAL_URL;
    axios
      .get(signalUrl + "/ip/location/" + ip)
      .then((response) => {
        setCountry(response.data.country);
        setRegionName(response.data.regionName);
        setCity(response.data.city);
        setIsp(response.data.isp);
        //console.log("Got the country: ", response.data.country);
      })
      .catch(() => {
        console.log("Could not get the country.");
      });
  };

  useEffect(getIp, []);
  useEffect(getCountry, [ip]);

  return (
    <div style={{ color: "#000000" }}>
      <h1>IP: {ip}</h1>
      <p>Country: {country}</p>
      <p>
        Region name: {regionName}, City: {city}
      </p>
      <p>ISP: {isp}</p>
    </div>
  );
};

export default Location;
