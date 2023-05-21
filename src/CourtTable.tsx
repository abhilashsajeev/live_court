import { fetch } from "@tauri-apps/api/http";
import dayjs from "dayjs";
import { getVersion } from "@tauri-apps/api/app";
import Pocketbase from "pocketbase";
import { Fragment, useCallback, useEffect, useState } from "react";
import {
  Table,
  TableCell,
  TableRow,
  TableBody,
  Stack,
  TableContainer,
  Paper,
} from "@mui/material";
import { BorderTableCell } from "./BorderTableCell";
import Marquee from "react-fast-marquee";
import "./App.css";

const pb = new Pocketbase("https://cmshck.kerala.gov.in/pocketbase");

const CourtTable = () => {
  const [data, setData] = useState<any>([]);
  const [id, setId] = useState<string>("");
  const [chunkedArray, setChunkedArray] = useState<any>([]);
  const [time, setTime] = useState<string>("10:00 AM");
  const [courtNews, setCourtNews] = useState<string>("");
  const [associationNews, setAssociationNews] = useState<string>("");
  const [isActingCJ, setIsActingCJ] = useState<boolean>(false);
  useEffect(() => {
    (async () => {
      try {
        const response: any = await getAllCourts();

        const result = response.data;
        const id = response.id;
        const actingresponse: any = await fetch(
          "https://ecourts.kerala.gov.in/mobileapp/api/v1/fetch/is_acting_cj",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("actingresponse", actingresponse);

        setIsActingCJ(actingresponse.data.acting);
        pb.collection("court").subscribe(id, (e: any) => {
          let tempdata = e.record.room_item;
          let courtNews = e.record.highcourt_news;
          let associationNews = e.record.association_news;
          let CJ = tempdata["1"];
          delete tempdata["1"];
          if (isActingCJ) tempdata["ACJ"] = CJ;
          else tempdata["CJ"] = "CJ";
          let keyList = Object.keys(tempdata);
          // sort the keys and move CJ to first
          keyList.sort((a, b) => {
            if (a === "CJ" || a === "ACJ") return -1;
            if (b === "CJ" || b === "ACJ") return 1;
            return a.localeCompare(b);
          });
          let chunkedArray: any = [];

          let size = 4;
          let numOfRows = Math.ceil(keyList.length / 4);

          for (let i = 0; i < numOfRows; i++) {
            for (let j = 0; j < size; j++) {
              if (!chunkedArray[i]) {
                chunkedArray[i] = [];
              }
              chunkedArray[i][j] = keyList[i + j * numOfRows];
            }
          }

          console.log("chunkedArray", chunkedArray);
          setChunkedArray(chunkedArray);

          setData(tempdata);
          setCourtNews(courtNews);
          setAssociationNews(associationNews);
        });
        setId(id);

        let keyList = Object.keys(result);
        // sort the keys and move CJ to first
        keyList.sort((a, b) => {
          if (a === "CJ" || a === "ACJ") return -1;
          if (b === "CJ" || b === "ACJ") return 1;
          return a.localeCompare(b);
        });

        if (keyList.length > 0) {
          let chunkedArray: any = [];
          let numOfRows = Math.ceil(keyList.length / 4);

          let size = 4;
          for (let i = 0; i < numOfRows; i++) {
            for (let j = 0; j < size; j++) {
              if (!chunkedArray[i]) {
                chunkedArray[i] = [];
              }
              chunkedArray[i][j] = keyList[i + j * numOfRows];
            }
          }

          setChunkedArray(chunkedArray);

          setData(result);
        }
      } catch (error) {
        console.log(error);
      }
    })();
    const interval = setInterval(() => {
      setTime(dayjs().format("ddd, MMM D, YYYY h:mm:ss A"));
    }, 1000);
    return () => {
      clearInterval(interval);
      pb.collection("court").unsubscribe(id);
    };
  }, []);

  const getAllCourts = useCallback(async () => {
    const courts = await pb.collection("court").getList(1, 1, {
      filter: `court_date = "${dayjs().format("YYYY-MM-DD")}"`,
    });
    if (courts.items.length === 0) {
      return { data: {}, id: "" };
    } else {
      let data = courts.items[0].room_item;
      let id = courts.items[0].id;
      let CJ = data["1"];
      delete data["1"];
      data["CJ"] = CJ;
      console.log("data from room item", data);
      return { data, id };
    }
  }, []);

  const getTableHeight = () => {
    if (associationNews === "") {
      return "100%";
    } else {
      return "calc(100% - 50px)";
    }
  };
  const getCellHeight = () => {
    const arraylen = chunkedArray.length;
    if (associationNews !== "") {
      return `${84 / arraylen}vh`;
    } else {
      return `${92 / arraylen}vh`;
    }
  };

  return (
    <div>
      <Stack direction={"row"} sx={{ background: "#252525" }}>
        <span className="timeline">{time}</span>

        <Marquee style={{ fontSize: "1.3em" }}>{courtNews}</Marquee>
      </Stack>

      <TableContainer component={Paper} sx={{ height: getTableHeight() }}>
        <Table sx={{ tableLayout: "fixed" }}>
          <TableBody>
            {Object.keys(data).length === 0 && (
              <TableRow>
                <TableCell>Loading...</TableCell>
              </TableRow>
            )}

            {chunkedArray.map((court: any, index: number) => (
              <TableRow key={index} sx={{ background: "#252525" }}>
                {court.map((c: string) => (
                  <Fragment key={c}>
                    <BorderTableCell
                      sx={{
                        color: "#fff",
                        height: getCellHeight(),
                      }}
                    >
                      {c}
                    </BorderTableCell>
                    <BorderTableCell
                      sx={{
                        color: "#F6A707",
                        height: getCellHeight(),
                      }}
                    >
                      {data[c] || "----"}
                    </BorderTableCell>
                  </Fragment>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {associationNews && associationNews !== "" && (
        <Marquee
          style={{ fontSize: "8vh", color: "#ffffff", background: "#252525" }}
        >
          {associationNews}
        </Marquee>
      )}
    </div>
  );
};

export default CourtTable;
