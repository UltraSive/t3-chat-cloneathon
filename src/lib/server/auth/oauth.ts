import { GitHub, Google } from "arctic";

import { ORIGIN, GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET } from "$env/static/private"

export const github = new GitHub(GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET, `${ORIGIN}/login/github/callback`);
export const google = new Google(GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, `${ORIGIN}/login/google/callback`);