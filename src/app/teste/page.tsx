"use client";

import { gqlQueryOptions } from "@/graphql/gqlpc";
import { CarsListQuery } from "@/graphql/pages/estoque";
import { useQuery } from "@tanstack/react-query";

export default function Teste() {
  const { data, isLoading } = useQuery(gqlQueryOptions(CarsListQuery));
  return (
    <div>
      {data?.products?.edges.map((edge, index) => (
        <div key={index}>{edge.node.title}</div>
      ))}
      {isLoading && <div>Loading...</div>}
    </div>
  );
}
