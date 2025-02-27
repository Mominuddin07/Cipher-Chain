import axios from "axios";
import { useEffect, useState } from "react";
import { HistoricalChart } from "../config/api";
import { Line } from "react-chartjs-2";
import SelectButton from "./SelectButton";
import { chartDays } from "../config/data";
import { useCryptoState } from "../cryptocontext"; // Corrected hook

const CoinInfo = ({ coin }) => {
  const [historicData, setHistoricData] = useState();
  const [days, setDays] = useState(1);
  const { currency } = useCryptoState();
  const [loading, setLoading] = useState(true);

  const fetchHistoricData = async () => {
    setLoading(true);
    const { data } = await axios.get(HistoricalChart(coin.id, days, currency));
    setHistoricData(data.prices);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistoricData();
  }, [days]);

  return (
    <div className="w-3/4 flex flex-col items-center justify-center mt-6 p-10 bg-gray-900 rounded-lg shadow-md">
      {loading ? (
        <div className="flex items-center justify-center w-full h-64">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <Line
            data={{
              labels: historicData.map((coin) => {
                let date = new Date(coin[0]);
                let time =
                  date.getHours() > 12
                    ? `${date.getHours() - 12}:${date.getMinutes()} PM`
                    : `${date.getHours()}:${date.getMinutes()} AM`;
                return days === 1 ? time : date.toLocaleDateString();
              }),
              datasets: [
                {
                  data: historicData.map((coin) => coin[1]),
                  label: `Price (Past ${days} Days) in ${currency}`,
                  borderColor: "#EEBC1D",
                },
              ],
            }}
            options={{
              elements: {
                point: { radius: 1 },
              },
            }}
          />
          <div className="flex mt-5 justify-around w-full">
            {chartDays.map((day) => (
              <SelectButton
                key={day.value}
                onClick={() => {
                  setDays(day.value);
                  setLoading(true);
                }}
                selected={day.value === days}
              >
                {day.label}
              </SelectButton>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CoinInfo;
