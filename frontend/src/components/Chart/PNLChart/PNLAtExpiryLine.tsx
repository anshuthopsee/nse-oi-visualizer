import { useMemo } from "react";
import * as d3 from "d3";
import { type ScaleLinear } from "d3";
import { PayoffAt } from "../../../features/selected/types";

type PNLAtExpiryLineProps = {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  boundedHeight: number;
  payoffsAtExpiry: PayoffAt[];
};

const Line = ({ xScale, yScale, payoffsAtExpiry }: PNLAtExpiryLineProps) => {

  const line = useMemo(() => {
    return d3.line<PayoffAt>()
      .x((d) => xScale(d.at))
      .y((d) => yScale(d.payoff));
  }, [xScale, yScale, payoffsAtExpiry]);

  const positiveArea = useMemo(() => {
    return d3.area<PayoffAt>()
      .x((d) => xScale(d.at))
      .y0((_d, _i, data) => yScale(Math.max(d3.min(data, d => d.payoff) || 0, 0)))
      .y1(d => Math.max(yScale(d.payoff), 0))
  }, [xScale, yScale, payoffsAtExpiry]);

  const negativeArea = useMemo(() => {
    return d3.area<PayoffAt>()
      .x((d) => xScale(d.at))
      .y0((_d, _i, data) => yScale(Math.min(d3.max(data, (d) => d.payoff) || 0, 0)))
      .y1((d) => yScale(d.payoff))
  }, [xScale, yScale, payoffsAtExpiry]);

  let positivePayoff: PayoffAt[] = [];
  let negativePayoff: PayoffAt[] = [];

  payoffsAtExpiry.forEach((payoff, i) => {
    const nextPayoff = payoffsAtExpiry[i + 1];

    if (payoff.payoff > 0) {
      positivePayoff.push(payoff);
    } else if (payoff.payoff < 0) {
      negativePayoff.push(payoff);
    };

    if (nextPayoff) {

      const linearScale = d3.scaleLinear()
          .domain([nextPayoff.payoff, payoff.payoff])
          .range([nextPayoff.at, payoff.at]);

        const atWhenPayoffIsZero = linearScale(0);

        const zeroPayoffPoint = {
          at: atWhenPayoffIsZero,
          payoff: 0,
        };

      if (payoff.payoff >= 0 && nextPayoff.payoff <= 0) {
        positivePayoff.push(zeroPayoffPoint);
        negativePayoff.push(zeroPayoffPoint);
      } else if (payoff.payoff <= 0 && nextPayoff.payoff >= 0) {
        positivePayoff.push(zeroPayoffPoint);
        negativePayoff.push(zeroPayoffPoint);
      };
    };
  });

  return (
    <g>
      <path
        d={line(positivePayoff) || ""}
        fill="none"
        stroke={"#3ede59"}
        strokeWidth={1}
      />
      <path
        d={line(negativePayoff) || ""}
        fill="none"
        stroke={"#de2150"}
        strokeWidth={1}
      />
      <path
        d={positiveArea(positivePayoff) || ""}
        fill={"#3ede59"}
        opacity={0.2}
      />
      <path
        d={negativeArea(negativePayoff) || ""}
        fill={"#de2150"}
        opacity={0.2}
      />
    </g>
  );
};

export default Line;