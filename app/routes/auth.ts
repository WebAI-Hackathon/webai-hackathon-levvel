import type { Route } from "./+types/auth";
import {auth} from "~/auth";

export async function loader({ context, request }: Route.LoaderArgs) {
    return auth.handler(request);
}

export async function action({ context, request }: Route.ActionArgs) {
    return auth.handler(request);
}
