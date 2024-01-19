import { useState, useEffect, useMemo, useRef, type RefObject } from 'react';

type Settings = {
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
};

type ChartDimensions = {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  width: number;
  height: number;
  boundedWidth: number;
  boundedHeight: number;
};

const defaultSettings = {
  marginTop: 30,
  marginRight: 30,
  marginBottom: 60,
  marginLeft: 70,
};

const useChartDimensions = (passedSettings: Settings = {}): [RefObject<HTMLDivElement>, ChartDimensions] => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const [chartWidth, setChartWidth] = useState<number>(0);
  const [chartHeight, setChartHeight] = useState<number>(0);

  const observer = useMemo(() => new ResizeObserver((entries) => {
    const { clientWidth, clientHeight } = entries[0].target;

    if (clientWidth !== chartWidth) setChartWidth(clientWidth);
    if (clientHeight !== chartHeight) setChartHeight(clientHeight);
  }), []);

  useEffect(() => {
    const chartContainer = chartContainerRef.current;

    if (chartContainer) {
      const width = chartContainer.clientWidth;
      const height = chartContainer.clientHeight;

      setChartWidth(width);
      setChartHeight(height);

      observer.observe(chartContainer);

      return () => observer.unobserve(chartContainer);
    };

  }, [observer]);

  const newSettings = {
    ...defaultSettings,
    ...passedSettings
  };

  const chartDimensions = {
    ...newSettings,
    width: chartWidth,
    height: chartHeight,
    boundedWidth: Math.max(chartWidth - newSettings.marginLeft - newSettings.marginRight, 0),
    boundedHeight: Math.max(chartHeight - newSettings.marginTop - newSettings.marginBottom, 0)
  };

  return [chartContainerRef, chartDimensions];
};

export default useChartDimensions;