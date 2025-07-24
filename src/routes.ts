import {
    type RouteConfig,
    route,
} from "@react-router/dev/routes";

export default [
    route("/api/generate-image-description", "./pages/GenerateImageDescription.ts"),
] satisfies RouteConfig;
