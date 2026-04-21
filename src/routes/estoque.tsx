import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/estoque")({
  component: EstoqueLayout,
});

function EstoqueLayout() {
  return <Outlet />;
}
