import axios from "axios";
import { useEffect, useState } from "react";

const Location = () => {
  const [ip, setIp] = useState("");
  const [country, setCountry] = useState("");
  const [regionName, setRegionName] = useState("");
  const [city, setCity] = useState("");
  const [isp, setIsp] = useState("");

  const getCountry = () => {
    const signalUrl = process.env.REACT_APP_SIGNAL_URL;
    axios
      .get(signalUrl + "/ip/location")
      .then((response) => {
        setIp(response.data.ip);
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

  useEffect(getCountry, []);

  return (
    <div style={{ color: "#000000" }}>
      <h1 className="ip">
        <span className="text">IP: </span>
        <span className="value">{ip}</span>
      </h1>
      <p className="country">
        <span className="text">Country: </span>
        <span className="value">{country}</span>
      </p>
      <p className="region">
        <span className="text">Region: </span>
        <span className="value">{regionName}</span>
      </p>
      <p className="city">
        <span className="text">City: </span>
        <span className="value">{city}</span>
      </p>
      <p className="isp">
        <span className="text">ISP: </span>
        <span className="value">{isp}</span>
      </p>
    </div>
  );
};

export default Location;
