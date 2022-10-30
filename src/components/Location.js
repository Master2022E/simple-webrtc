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
      <h1 class="ip">
        <span class="text">IP: </span>
        <span class="value">{ip}</span>
      </h1>
      <p class="country">
        <span class="text">Country: </span>
        <span class="value">{country}</span>
      </p>
      <p class="region">
        <span class="text">Region: </span>
        <span class="value">{regionName}</span>
      </p>
      <p class="city">
        <span class="text">City: </span>
        <span class="value">{city}</span>
      </p>
      <p class="isp">
        <span class="text">ISP: </span>
        <span class="value">{isp}</span>
      </p>
    </div>
  );
};

export default Location;
