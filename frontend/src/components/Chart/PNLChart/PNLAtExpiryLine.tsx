import { useMemo, Fragment } from "react";
import useTheme from "@mui/material/styles/useTheme";
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

  const theme = useTheme();

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

  const { positivePayoffLines, negativePayoffLines } = useMemo(() => {
    let positivePayoffLines: PayoffAt[][] = [];
    let negativePayoffLines: PayoffAt[][] = [];
  
    let positivePayoffLine: PayoffAt[] = [];
    let negativePayoffLine: PayoffAt[] = [];
  
    payoffsAtExpiry.forEach((payoff, i) => {
      const nextPayoff = payoffsAtExpiry[i + 1];
  
      if (payoff.payoff > 0) {
        positivePayoffLine.push(payoff);
      } else if (payoff.payoff < 0) {
        negativePayoffLine.push(payoff);
      }
  
      if (
        nextPayoff &&
        ((payoff.payoff > 0 && nextPayoff.payoff < 0) ||
          (payoff.payoff < 0 && nextPayoff.payoff > 0))
      ) {
        const linearScale = d3.scaleLinear()
          .domain([nextPayoff.payoff, payoff.payoff])
          .range([nextPayoff.at, payoff.at]);
  
        const atWhenPayoffIsZero = linearScale(0);
  
        const zeroPayoffPoint: PayoffAt = {
          at: atWhenPayoffIsZero,
          payoff: 0,
        };
  
        if (payoff.payoff >= 0 && nextPayoff.payoff <= 0) {
          positivePayoffLine.push(zeroPayoffPoint);
          negativePayoffLine.push(zeroPayoffPoint);
          positivePayoffLines.push(positivePayoffLine);
          positivePayoffLine = [];
        } else if (payoff.payoff <= 0 && nextPayoff.payoff >= 0) {
          positivePayoffLine.push(zeroPayoffPoint);
          negativePayoffLine.push(zeroPayoffPoint);
          negativePayoffLines.push(negativePayoffLine);
          negativePayoffLine = [];
        }
      }
    });
  
    if (positivePayoffLine.length) {
      positivePayoffLines.push(positivePayoffLine);
    };
  
    if (negativePayoffLine.length) {
      negativePayoffLines.push(negativePayoffLine);
    };
  
    return { positivePayoffLines, negativePayoffLines };
  }, [payoffsAtExpiry]);

  return (
    <g>
      {positivePayoffLines.map((payoff, i) => (
        <Fragment key={i}>
          <path
            d={line(payoff) || ""}
            fill={"none"}
            stroke={theme.palette.payoffLine.itm}
            strokeWidth={2}
          />
          <path
            d={area(payoff) || ""}
            fill={theme.palette.payoffLine.itm}
            opacity={0.2}
          />
        </Fragment>
      ))}
      {negativePayoffLines.map((payoff, i) => (
        <Fragment key={i}>
        <path
          d={line(payoff) || ""}
          fill={"none"}
          stroke={theme.palette.payoffLine.otm}
          strokeWidth={2}
        />
        <path
          d={area(payoff) || ""}
          fill={theme.palette.payoffLine.otm}
          opacity={0.2}
        />
      </Fragment>
      ))}
    </g>
  );
};

export default Line;