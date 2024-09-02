import { useMemo, Fragment } from "react";
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

  const area = useMemo(() => {
    return d3.area<PayoffAt>()
      .x(d => xScale(d.at))
      .y0(yScale(0))
      .y1(d => yScale(d.payoff));
  }, [xScale, yScale, payoffsAtExpiry]);

  let positivePayoffLines: PayoffAt[][] = []
  let negativePayoffLines: PayoffAt[][] = [];

  let positivePayoffLine: PayoffAt[] = [];
  let negativePayoffLine: PayoffAt[] = [];

  payoffsAtExpiry.forEach((payoff, i) => {
    const nextPayoff = payoffsAtExpiry[i + 1];

    if (payoff.payoff > 0) {
      positivePayoffLine.push(payoff);
    } else if (payoff.payoff < 0) {
      negativePayoffLine.push(payoff);
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
        positivePayoffLine.push(zeroPayoffPoint);
        negativePayoffLine.push(zeroPayoffPoint);
        positivePayoffLines.push(positivePayoffLine);
        negativePayoffLines.push(negativePayoffLine);
        positivePayoffLine = [];
      } else if (payoff.payoff <= 0 && nextPayoff.payoff >= 0) {
        positivePayoffLine.push(zeroPayoffPoint);
        negativePayoffLine.push(zeroPayoffPoint);
        positivePayoffLines.push(positivePayoffLine);
        negativePayoffLines.push(negativePayoffLine);
        negativePayoffLine = [];
      };
    };
  });

  return (
    <g>
      {positivePayoffLines.map((payoff, i) => (
        <Fragment key={i}>
          <path
            d={line(payoff) || ""}
            fill={"none"}
            stroke={"#3ede59"}
            strokeWidth={2}
          />
          <path
            d={area(payoff) || ""}
            fill={"#3ede59"}
            opacity={0.2}
          />
        </Fragment>
      ))}
      {negativePayoffLines.map((payoff, i) => (
        <Fragment key={i}>
        <path
          d={line(payoff) || ""}
          fill={"none"}
          stroke={"#de2150"}
          strokeWidth={2}
        />
        <path
          d={area(payoff) || ""}
          fill={"#de2150"}
          opacity={0.2}
        />
      </Fragment>
      ))}
    </g>
  );
};

export default Line;