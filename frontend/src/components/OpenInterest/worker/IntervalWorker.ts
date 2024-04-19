
const generateMinuteMarks = () => {
  const minuteMarks = [];
  for (let i = 0; i <= 60; i+=3) {
    minuteMarks.push(i);
  };

  return minuteMarks;
};

// need to fix accuracy in firefox

const CustomInterval = (callbackFn: () => void) => {
  
  const now = new Date();
  const currentTime = now.getTime();
  const currentMinutes = now.getMinutes();
  const minuteMarks = generateMinuteMarks();

  const nextMinuteMark = minuteMarks.find((mark) => mark > currentMinutes);
  
  if (nextMinuteMark === undefined) {
    throw new Error("nextMinuteMark is undefined");
  };

  const nextMinute = new Date();
  nextMinute.setMinutes(nextMinuteMark);
  nextMinute.setSeconds(0);

  const timeToNextMinute = nextMinute.getTime() - currentTime;

  const timeout = setTimeout(() => {
    callbackFn();
    
    setInterval(() => {
      callbackFn();
    }, 180000);

  }, timeToNextMinute < 0 ? 0 : timeToNextMinute);
  return () => clearTimeout(timeout);
};

let clearCustomInterval: ReturnType<typeof CustomInterval> | undefined;

type Message = {
  action: string,
};

self.onmessage = (e) => {
  const { action }: Message = e.data;

  if (action === "start") {
    console.log("starting worker");
    clearCustomInterval = CustomInterval(() => {
      self.postMessage("get-oi");
    });
  };
};
