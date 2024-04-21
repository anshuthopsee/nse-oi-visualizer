import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import formatData from "../../utils";
import { type Data as UntransformedData } from "../../features/selected/types";
import { type IdentifiersType as Underlying } from "../../identifiers";

type OpenInterestRequestArgs = {
  underlying: Underlying;
};

export type TransformedData = ReturnType<typeof formatData>;

export const openInterestApi = createApi({
  reducerPath: "openInterestApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["OpenInterest"],
  endpoints: (builder) => ({
    openInterest: builder.query<TransformedData, OpenInterestRequestArgs>({
      query: ({ underlying }) => {
        let identifier: string = underlying;

        if (identifier.endsWith(" - Weekly")) {
          identifier = identifier.replace(" - Weekly", "");
        } else if (identifier.endsWith(" - Monthly")) {
          identifier = identifier.replace(" - Monthly", "");
        };

        identifier =  encodeURIComponent(identifier);

        return `/api?identifier=${identifier}`;
      },
      providesTags: ["OpenInterest"],
      transformResponse: (response: UntransformedData, _meta, args) => {
        return formatData(response, args.underlying);
      },
      keepUnusedDataFor: 200,
    }),
  }),
});

export const { useOpenInterestQuery } = openInterestApi;