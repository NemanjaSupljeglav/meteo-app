//React
import React, { useState, createContext } from "react";
import moment from "moment/moment";
//Services
import { postFunc } from "../src/services/mainApiServices";

export const MeteoContext = createContext();

const MeteoProvider = ({ children }) => {
  const [favourite, setFavourite] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [oneDetails, setOneDetails] = useState(null);
  const [dataForChart, setDataForChart] = useState([]);

  const handleAdFavourite = data => {
    data["status"] = true;
    if (!favourite?.includes(data)) setFavourite([...favourite, data]);
  };
  const handleRemoveFavourite = data => {
    data["status"] = false;
    setFavourite(
      favourite.filter(i => {
        if (i.id === data.id) {
          return null;
        }
        return i;
      })
    );
  };

  const handleAscendingDescending = () => {
    const myData = []
      .concat(favourite)
      .sort((a, b) => (a.itemM > b.itemM ? 1 : -1));
    setFavourite(myData);
  };

  const handleAutocompleteList = data => {
    const myData = [];

    data?.results?.slice(0, 5)?.map(o1 => {
      favourite?.map(o2 => {
        if (o2?.id === o1?.id) {
          o1["status"] = true;
        } else data["status"] = false;
      });

      myData?.push(o1);
    });

    setCityList(myData);
  };

  const handleGetOneDetails = async data => {
    const body = {
      latitude: data?.latitude,
      longitude: data?.longitude,
      hourly: "temperature_2m",
      timeformat: "unixtime"
    };
    const response = await postFunc(
      `https://api.open-meteo.com/v1/forecast?latitude=${data?.latitude}&longitude=${data?.longitude}&hourly=temperature_2m&timeformat=unixtime`,
      body
    );
    setOneDetails({ response: response, data: data });
    setCityList([]);

    const chartData = [];
    response?.hourly?.temperature_2m.map((item, index) => {
      if (index < 25) {
        chartData.push({
          day: moment(response?.hourly?.time[index]).format("MMM Do"),
          data: item
        });
      } else return null;
    });
    setDataForChart(chartData);
  };

  const clearOneDetails = () => {
    setOneDetails(null);
  };
  return (
    <MeteoContext.Provider
      value={{
        favourite,
        cityList,
        oneDetails,
        dataForChart,
        handleAdFavourite,
        handleRemoveFavourite,
        handleAscendingDescending,
        handleAutocompleteList,
        handleGetOneDetails,
        clearOneDetails
      }}
    >
      {children}
    </MeteoContext.Provider>
  );
};

export default MeteoProvider;
