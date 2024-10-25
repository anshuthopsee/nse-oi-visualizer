import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { type TransformedData, type ATMIVsPerExpiry, type FuturesPerExpiry, type ActiveOptionLeg, type BuilderData } from "../../features/selected/types";
// import { type Data as UntransformedData } from "../../features/selected/types";
import { type Identifier as Underlying } from "../../identifiers";

type OpenInterestRequestParams = {
  underlying: Underlying;
};

type BuilderRequestParams = {
  underlyingPrice: number | null;
  targetUnderlyingPrice: number | null;
  targetDateTimeISOString: string;
  atmIVsPerExpiry: ATMIVsPerExpiry | null;
  futuresPerExpiry: FuturesPerExpiry | null;
  optionLegs: ActiveOptionLeg[];
  lotSize: number | null;
  isIndex: boolean;
};

export const openInterestApi = createApi({
  reducerPath: "openInterestApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["OpenInterest"],
  endpoints: (builder) => ({
    openInterest: builder.query<TransformedData, OpenInterestRequestParams>({
      query: ({ underlying }) => {
        let identifier: string = underlying;

        if (identifier.endsWith(" - Weekly")) {
          identifier = identifier.replace(" - Weekly", "");
        } else if (identifier.endsWith(" - Monthly")) {
          identifier = identifier.replace(" - Monthly", "");
        };

        identifier =  encodeURIComponent(identifier);

        const url = import.meta.env.MODE === "development" ? "/api" : import.meta.env.VITE_API_BASE_URL;

        return `${url}/open-interest?identifier=${identifier}`;
      },
      providesTags: ["OpenInterest"],
      keepUnusedDataFor: 200,
    }),
    builder: builder.query<BuilderData, BuilderRequestParams>({
      query: (strategyBuilderData) => {
        
        const url = (import.meta.env.MODE === "development" ? "/api" : import.meta.env.VITE_API_BASE_URL) + "/builder"
        
        return {
          url: url,
          method: "POST",
          body: strategyBuilderData
        }
      },
      keepUnusedDataFor: 0
    })
  }),
});

export const { useOpenInterestQuery, useBuilderQuery } = openInterestApi;