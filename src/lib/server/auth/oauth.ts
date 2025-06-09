import { Google } from "arctic";

import { ORIGIN, GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET } from "$env/static/private"

export const google = new Google(GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, `${ORIGIN}/login/google/callback`);