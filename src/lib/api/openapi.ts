import { z } from "zod";

export type UserPrivateProfile = z.infer<typeof UserPrivateProfile>;
export const UserPrivateProfile = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string(),
  avatarHash: z.string(),
  registerDate: z.string(),
  yandexConnected: z.boolean(),
  discordConnected: z.boolean(),
});

export type BackendError = z.infer<typeof BackendError>;
export const BackendError = z.object({
  title: z.string(),
  status: z.number(),
  detail: z.string(),
});

export type UserUpdateRequest = z.infer<typeof UserUpdateRequest>;
export const UserUpdateRequest = z.object({
  name: z.string().optional(),
});

export type UserPublicProfile = z.infer<typeof UserPublicProfile>;
export const UserPublicProfile = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string(),
  avatarHash: z.string(),
  registerDate: z.string(),
});

export type RegisterRequest = z.infer<typeof RegisterRequest>;
export const RegisterRequest = z.object({
  username: z.string(),
  password: z.string(),
  name: z.union([z.string(), z.undefined()]).optional(),
});

export type LoginRequest = z.infer<typeof LoginRequest>;
export const LoginRequest = z.object({
  username: z.string(),
  password: z.string(),
});

export type UserSession = z.infer<typeof UserSession>;
export const UserSession = z.object({
  sessionID: z.string(),
  userID: z.string(),
  refreshToken: z.string(),
  ua: z.string(),
  lastActive: z.string(),
});

export type AuthProvider = z.infer<typeof AuthProvider>;
export const AuthProvider = z.object({
  provider: z.string(),
  createdAt: z.string(),
});

export type Provider = z.infer<typeof Provider>;
export const Provider = z.union([
  z.literal("google"),
  z.literal("yandex"),
  z.literal("yandex_air"),
  z.literal("seznam"),
]);

export type Lobby = z.infer<typeof Lobby>;
export const Lobby = z.object({
  id: z.string(),
  creatorID: z.string(),
  createdAt: z.string(),
  rounds: z.number(),
  provider: Provider,
  movementAllowed: z.boolean(),
  timerSeconds: z.number(),
  currentPlayers: z.number(),
  maxPlayers: z.number(),
  private: z.boolean(),
});

export type LobbiesResponse = z.infer<typeof LobbiesResponse>;
export const LobbiesResponse = z.object({
  total: z.number(),
  lobbies: z.array(Lobby),
});

export type NewLobby = z.infer<typeof NewLobby>;
export const NewLobby = z.object({
  creatorID: z.string(),
  maxPlayers: z.number(),
  rounds: z.number(),
  provider: Provider,
  timerSeconds: z.union([z.number(), z.undefined()]).optional(),
  movementAllowed: z.boolean(),
  private: z.boolean(),
});

export type SingleplayerGame = z.infer<typeof SingleplayerGame>;
export const SingleplayerGame = z.object({
  id: z.string(),
  userID: z.string(),
  rounds: z.number(),
  roundCurrent: z.number(),
  timerSeconds: z.number(),
  movementAllowed: z.boolean(),
  provider: Provider,
  score: z.number(),
  finished: z.boolean(),
  createdAt: z.string(),
});

export type SingleplayerGames = z.infer<typeof SingleplayerGames>;
export const SingleplayerGames = z.object({
  total: z.number(),
  games: z.array(SingleplayerGame),
});

export type NewSingleplayerGameRequest = z.infer<typeof NewSingleplayerGameRequest>;
export const NewSingleplayerGameRequest = z.object({
  rounds: z.number(),
  timerSeconds: z.union([z.number(), z.undefined()]).optional(),
  movementAllowed: z.boolean(),
  provider: Provider,
});

export type SingleplayerRound = z.infer<typeof SingleplayerRound>;
export const SingleplayerRound = z.object({
  id: z.string(),
  gameID: z.string(),
  streetviewID: z.string(),
  roundNum: z.number(),
  lat: z.number(),
  lng: z.number(),
  finished: z.boolean(),
  createdAt: z.string(),
  startedAt: z.string(),
  endedAt: z.string(),
});

export type LatLng = z.infer<typeof LatLng>;
export const LatLng = z.object({
  lat: z.number(),
  lng: z.number(),
});

export type SingleplayerRoundGuess = z.infer<typeof SingleplayerRoundGuess>;
export const SingleplayerRoundGuess = z.object({
  guess: LatLng,
});

export type EndSingleplayerRoundResponse = z.infer<typeof EndSingleplayerRoundResponse>;
export const EndSingleplayerRoundResponse = z.object({
  score: z.number(),
  distance: z.number(),
});

export type SingleplayerGuess = z.infer<typeof SingleplayerGuess>;
export const SingleplayerGuess = z.object({
  roundNum: z.number(),
  roundLat: z.number(),
  roundLng: z.number(),
  guessLat: z.number(),
  guessLng: z.number(),
  score: z.number(),
  missDistance: z.number(),
});

export type MultiplayerGame = z.infer<typeof MultiplayerGame>;
export const MultiplayerGame = z.object({
  id: z.string(),
  creatorID: z.string(),
  rounds: z.number(),
  roundCurrent: z.number(),
  timerSeconds: z.number(),
  movementAllowed: z.boolean(),
  players: z.number(),
  provider: Provider,
  finished: z.boolean(),
  createdAt: z.string(),
});

export type MultiplayerGuess = z.infer<typeof MultiplayerGuess>;
export const MultiplayerGuess = z.object({
  username: z.string(),
  avatarHash: z.string(),
  roundNum: z.number(),
  roundLat: z.number(),
  roundLng: z.number(),
  lat: z.number(),
  lng: z.number(),
  score: z.number(),
});

export type MultiplayerRound = z.infer<typeof MultiplayerRound>;
export const MultiplayerRound = z.object({
  id: z.string(),
  gameID: z.string(),
  streetviewID: z.string(),
  roundNum: z.number(),
  lat: z.number(),
  lng: z.number(),
  guessesCount: z.number(),
  finished: z.boolean(),
  createdAt: z.string(),
  startedAt: z.string(),
  endedAt: z.string(),
});

export type get_GetRoot = typeof get_GetRoot;
export const get_GetRoot = {
  method: z.literal("GET"),
  path: z.literal("/"),
  requestFormat: z.literal("json"),
  parameters: z.never(),
  responses: z.object({
    "302": z.unknown(),
  }),
  responseHeaders: z.object({
    "302": z.object({
      Location: z.string(),
    }),
  }),
};

export type get_GetHealth = typeof get_GetHealth;
export const get_GetHealth = {
  method: z.literal("GET"),
  path: z.literal("/health"),
  requestFormat: z.literal("json"),
  parameters: z.never(),
  responses: z.object({
    "200": z.object({
      status: z.string(),
    }),
  }),
};

export type get_GetPrivateProfile = typeof get_GetPrivateProfile;
export const get_GetPrivateProfile = {
  method: z.literal("GET"),
  path: z.literal("/v1/users/me"),
  requestFormat: z.literal("json"),
  parameters: z.never(),
  responses: z.object({
    "200": UserPrivateProfile,
    "401": BackendError,
    "500": BackendError,
  }),
};

export type patch_UpdateUser = typeof patch_UpdateUser;
export const patch_UpdateUser = {
  method: z.literal("PATCH"),
  path: z.literal("/v1/users/me"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    body: UserUpdateRequest,
  }),
  responses: z.object({
    "204": z.unknown(),
    "401": BackendError,
    "500": BackendError,
  }),
};

export type get_GetPublicProfile = typeof get_GetPublicProfile;
export const get_GetPublicProfile = {
  method: z.literal("GET"),
  path: z.literal("/v1/users/{id}"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      id: z.string(),
    }),
  }),
  responses: z.object({
    "200": UserPublicProfile,
    "404": BackendError,
    "500": BackendError,
  }),
};

export type put_UpdateUserAvatar = typeof put_UpdateUserAvatar;
export const put_UpdateUserAvatar = {
  method: z.literal("PUT"),
  path: z.literal("/v1/users/avatar"),
  requestFormat: z.literal("form-data"),
  parameters: z.object({
    body: z.object({
      avatarFile: z.string(),
    }),
  }),
  responses: z.object({
    "204": z.unknown(),
    "401": BackendError,
    "413": BackendError,
    "429": BackendError,
    "500": BackendError,
  }),
};

export type post_Register = typeof post_Register;
export const post_Register = {
  method: z.literal("POST"),
  path: z.literal("/v1/auth/register"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    header: z.object({
      "Frontend-Captcha-Token": z.string().optional(),
    }),
    body: RegisterRequest,
  }),
  responses: z.object({
    "201": z.unknown(),
    "400": BackendError,
    "409": BackendError,
    "500": BackendError,
  }),
};

export type post_Login = typeof post_Login;
export const post_Login = {
  method: z.literal("POST"),
  path: z.literal("/v1/auth/login"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    header: z.object({
      "User-Agent": z.string(),
      "Frontend-Captcha-Token": z.union([z.string(), z.undefined()]).optional(),
    }),
    body: LoginRequest,
  }),
  responses: z.object({
    "204": z.unknown(),
    "400": BackendError,
    "401": BackendError,
    "500": BackendError,
  }),
  responseHeaders: z.object({
    "204": z.object({
      "Set-Cookie": z.string(),
    }),
  }),
};

export type post_RefreshTokens = typeof post_RefreshTokens;
export const post_RefreshTokens = {
  method: z.literal("POST"),
  path: z.literal("/v1/auth/tokens/refresh"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    body: z.object({
      refreshToken: z.string(),
    }),
  }),
  responses: z.object({
    "204": z.unknown(),
    "400": BackendError,
    "500": BackendError,
  }),
  responseHeaders: z.object({
    "204": z.object({
      "Set-Cookie": z.string(),
    }),
  }),
};

export type get_GetUserSessions = typeof get_GetUserSessions;
export const get_GetUserSessions = {
  method: z.literal("GET"),
  path: z.literal("/v1/auth/sessions"),
  requestFormat: z.literal("json"),
  parameters: z.never(),
  responses: z.object({
    "200": z.array(UserSession),
    "500": BackendError,
  }),
};

export type delete_DeleteUserSession = typeof delete_DeleteUserSession;
export const delete_DeleteUserSession = {
  method: z.literal("DELETE"),
  path: z.literal("/v1/auth/sessions/{id}"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      id: z.string(),
    }),
  }),
  responses: z.object({
    "204": z.unknown(),
    "500": BackendError,
  }),
};

export type get_GetOAuthProviders = typeof get_GetOAuthProviders;
export const get_GetOAuthProviders = {
  method: z.literal("GET"),
  path: z.literal("/v1/auth/providers"),
  requestFormat: z.literal("json"),
  parameters: z.never(),
  responses: z.object({
    "200": z.array(AuthProvider),
    "401": BackendError,
    "500": BackendError,
  }),
};

export type get_YandexLogin = typeof get_YandexLogin;
export const get_YandexLogin = {
  method: z.literal("GET"),
  path: z.literal("/v1/auth/yandex/login"),
  requestFormat: z.literal("json"),
  parameters: z.never(),
  responses: z.object({
    "307": z.unknown(),
  }),
  responseHeaders: z.object({
    "307": z.object({
      Location: z.string(),
      "Set-Cookie": z.string(),
    }),
  }),
};

export type get_YandexLoginCallback = typeof get_YandexLoginCallback;
export const get_YandexLoginCallback = {
  method: z.literal("GET"),
  path: z.literal("/v1/auth/yandex/login/callback"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    query: z.object({
      code: z.string(),
      state: z.string(),
    }),
    header: z.object({
      Cookie: z.string(),
    }),
  }),
  responses: z.object({
    "307": z.unknown(),
    "400": BackendError,
    "404": BackendError,
    "500": BackendError,
  }),
  responseHeaders: z.object({
    "307": z.object({
      Location: z.string(),
      "Set-Cookie": z.string(),
    }),
  }),
};

export type get_NewYandex = typeof get_NewYandex;
export const get_NewYandex = {
  method: z.literal("GET"),
  path: z.literal("/v1/auth/yandex/new"),
  requestFormat: z.literal("json"),
  parameters: z.never(),
  responses: z.object({
    "307": z.unknown(),
    "500": BackendError,
  }),
  responseHeaders: z.object({
    "307": z.object({
      Location: z.string(),
      "Set-Cookie": z.string(),
    }),
  }),
};

export type get_NewYandexCallback = typeof get_NewYandexCallback;
export const get_NewYandexCallback = {
  method: z.literal("GET"),
  path: z.literal("/v1/auth/yandex/new/callback"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    query: z.object({
      code: z.string(),
      state: z.string(),
    }),
    header: z.object({
      Cookie: z.string(),
    }),
  }),
  responses: z.object({
    "307": z.unknown(),
    "400": BackendError,
    "401": BackendError,
    "500": BackendError,
  }),
  responseHeaders: z.object({
    "307": z.object({
      Location: z.string(),
    }),
  }),
};

export type delete_DeleteYandex = typeof delete_DeleteYandex;
export const delete_DeleteYandex = {
  method: z.literal("DELETE"),
  path: z.literal("/v1/auth/yandex"),
  requestFormat: z.literal("json"),
  parameters: z.never(),
  responses: z.object({
    "204": z.unknown(),
    "401": BackendError,
    "500": BackendError,
  }),
};

export type get_DiscordLogin = typeof get_DiscordLogin;
export const get_DiscordLogin = {
  method: z.literal("GET"),
  path: z.literal("/v1/auth/discord/login"),
  requestFormat: z.literal("json"),
  parameters: z.never(),
  responses: z.object({
    "307": z.unknown(),
  }),
  responseHeaders: z.object({
    "307": z.object({
      Location: z.string(),
      "Set-Cookie": z.string(),
    }),
  }),
};

export type get_DiscordLoginCallback = typeof get_DiscordLoginCallback;
export const get_DiscordLoginCallback = {
  method: z.literal("GET"),
  path: z.literal("/v1/auth/discord/login/callback"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    query: z.object({
      code: z.string(),
      state: z.string(),
    }),
    header: z.object({
      Cookie: z.string(),
    }),
  }),
  responses: z.object({
    "307": z.unknown(),
    "400": BackendError,
    "404": BackendError,
    "500": BackendError,
  }),
  responseHeaders: z.object({
    "307": z.object({
      Location: z.string(),
      "Set-Cookie": z.string(),
    }),
  }),
};

export type get_NewDiscord = typeof get_NewDiscord;
export const get_NewDiscord = {
  method: z.literal("GET"),
  path: z.literal("/v1/auth/discord/new"),
  requestFormat: z.literal("json"),
  parameters: z.never(),
  responses: z.object({
    "307": z.unknown(),
    "500": BackendError,
  }),
  responseHeaders: z.object({
    "307": z.object({
      Location: z.string(),
      "Set-Cookie": z.string(),
    }),
  }),
};

export type get_NewDiscordCallback = typeof get_NewDiscordCallback;
export const get_NewDiscordCallback = {
  method: z.literal("GET"),
  path: z.literal("/v1/auth/discord/new/callback"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    query: z.object({
      code: z.string(),
      state: z.string(),
    }),
    header: z.object({
      Cookie: z.string(),
    }),
  }),
  responses: z.object({
    "307": z.unknown(),
    "400": BackendError,
    "401": BackendError,
    "500": BackendError,
  }),
  responseHeaders: z.object({
    "307": z.object({
      Location: z.string(),
    }),
  }),
};

export type delete_DeleteDiscord = typeof delete_DeleteDiscord;
export const delete_DeleteDiscord = {
  method: z.literal("DELETE"),
  path: z.literal("/v1/auth/discord"),
  requestFormat: z.literal("json"),
  parameters: z.never(),
  responses: z.object({
    "204": z.unknown(),
    "401": BackendError,
    "500": BackendError,
  }),
};

export type get_GetLobbies = typeof get_GetLobbies;
export const get_GetLobbies = {
  method: z.literal("GET"),
  path: z.literal("/v1/lobbies"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    query: z.object({
      page: z.number(),
      "page-size": z.number(),
    }),
  }),
  responses: z.object({
    "200": LobbiesResponse,
    "500": BackendError,
  }),
};

export type post_NewLobby = typeof post_NewLobby;
export const post_NewLobby = {
  method: z.literal("POST"),
  path: z.literal("/v1/lobbies"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    body: NewLobby,
  }),
  responses: z.object({
    "201": z.object({
      id: z.string(),
    }),
    "400": BackendError,
    "500": BackendError,
  }),
};

export type get_GetLobby = typeof get_GetLobby;
export const get_GetLobby = {
  method: z.literal("GET"),
  path: z.literal("/v1/lobbies/{id}"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      id: z.string(),
    }),
  }),
  responses: z.object({
    "200": Lobby,
    "404": BackendError,
    "500": BackendError,
  }),
};

export type get_GetSingleplayerGames = typeof get_GetSingleplayerGames;
export const get_GetSingleplayerGames = {
  method: z.literal("GET"),
  path: z.literal("/v1/singleplayer"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    query: z.object({
      page: z.number(),
      "page-size": z.number(),
    }),
  }),
  responses: z.object({
    "200": SingleplayerGames,
    "400": BackendError,
    "401": BackendError,
    "500": BackendError,
  }),
};

export type post_NewSingleplayerGame = typeof post_NewSingleplayerGame;
export const post_NewSingleplayerGame = {
  method: z.literal("POST"),
  path: z.literal("/v1/singleplayer"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    body: NewSingleplayerGameRequest,
  }),
  responses: z.object({
    "201": z.object({
      id: z.string(),
    }),
    "400": BackendError,
    "401": BackendError,
    "500": BackendError,
  }),
};

export type get_GetSingleplayerGame = typeof get_GetSingleplayerGame;
export const get_GetSingleplayerGame = {
  method: z.literal("GET"),
  path: z.literal("/v1/singleplayer/{id}"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      id: z.string(),
    }),
  }),
  responses: z.object({
    "200": SingleplayerGame,
    "401": BackendError,
    "403": BackendError,
    "404": BackendError,
    "500": BackendError,
  }),
};

export type post_EndSingleplayerGame = typeof post_EndSingleplayerGame;
export const post_EndSingleplayerGame = {
  method: z.literal("POST"),
  path: z.literal("/v1/singleplayer/{id}/end"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      id: z.string(),
    }),
  }),
  responses: z.object({
    "204": z.unknown(),
    "400": BackendError,
    "401": BackendError,
    "403": BackendError,
    "404": BackendError,
    "500": BackendError,
  }),
};

export type get_GetSingleplayerRound = typeof get_GetSingleplayerRound;
export const get_GetSingleplayerRound = {
  method: z.literal("GET"),
  path: z.literal("/v1/singleplayer/{id}/round"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      id: z.string(),
    }),
  }),
  responses: z.object({
    "200": SingleplayerRound,
    "400": BackendError,
    "401": BackendError,
    "403": BackendError,
    "404": BackendError,
    "500": BackendError,
  }),
};

export type post_NewSingleplayerRound = typeof post_NewSingleplayerRound;
export const post_NewSingleplayerRound = {
  method: z.literal("POST"),
  path: z.literal("/v1/singleplayer/{id}/round"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      id: z.string(),
    }),
  }),
  responses: z.object({
    "200": SingleplayerRound,
    "400": BackendError,
    "401": BackendError,
    "403": BackendError,
    "404": BackendError,
    "500": BackendError,
  }),
};

export type post_EndSingleplayerRound = typeof post_EndSingleplayerRound;
export const post_EndSingleplayerRound = {
  method: z.literal("POST"),
  path: z.literal("/v1/singleplayer/{id}/round/end"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      id: z.string(),
    }),
    body: SingleplayerRoundGuess,
  }),
  responses: z.object({
    "200": EndSingleplayerRoundResponse,
    "400": BackendError,
    "401": BackendError,
    "403": BackendError,
    "404": BackendError,
    "500": BackendError,
  }),
};

export type get_GetSingleplayerGameGuesses = typeof get_GetSingleplayerGameGuesses;
export const get_GetSingleplayerGameGuesses = {
  method: z.literal("GET"),
  path: z.literal("/v1/singleplayer/{id}/guesses"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      id: z.string(),
    }),
  }),
  responses: z.object({
    "200": z.array(SingleplayerGuess),
    "400": BackendError,
    "401": BackendError,
    "403": BackendError,
    "404": BackendError,
    "500": BackendError,
  }),
};

export type get_GetMultiplayerGame = typeof get_GetMultiplayerGame;
export const get_GetMultiplayerGame = {
  method: z.literal("GET"),
  path: z.literal("/v1/multiplayer/{id}"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      id: z.string(),
    }),
  }),
  responses: z.object({
    "200": MultiplayerGame,
    "401": BackendError,
    "404": BackendError,
    "500": BackendError,
  }),
};

export type get_GetMultiplayerGameGuesses = typeof get_GetMultiplayerGameGuesses;
export const get_GetMultiplayerGameGuesses = {
  method: z.literal("GET"),
  path: z.literal("/v1/multiplayer/{id}/guesses"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      id: z.string(),
    }),
  }),
  responses: z.object({
    "200": z.array(MultiplayerGuess),
    "400": BackendError,
    "401": BackendError,
    "500": BackendError,
  }),
};

export type get_GetMultiplayerRound = typeof get_GetMultiplayerRound;
export const get_GetMultiplayerRound = {
  method: z.literal("GET"),
  path: z.literal("/v1/multiplayer/{id}/round"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      id: z.string(),
    }),
  }),
  responses: z.object({
    "200": MultiplayerRound,
    "401": BackendError,
    "404": BackendError,
    "500": BackendError,
  }),
};

export type post_NewMultiplayerRound = typeof post_NewMultiplayerRound;
export const post_NewMultiplayerRound = {
  method: z.literal("POST"),
  path: z.literal("/v1/multiplayer/{id}/round"),
  requestFormat: z.literal("json"),
  parameters: z.object({
    path: z.object({
      id: z.string(),
    }),
  }),
  responses: z.object({
    "200": MultiplayerRound,
    "401": BackendError,
    "404": BackendError,
    "500": BackendError,
  }),
};

// <EndpointByMethod>
export const EndpointByMethod = {
  get: {
    "/": get_GetRoot,
    "/health": get_GetHealth,
    "/v1/users/me": get_GetPrivateProfile,
    "/v1/users/{id}": get_GetPublicProfile,
    "/v1/auth/sessions": get_GetUserSessions,
    "/v1/auth/providers": get_GetOAuthProviders,
    "/v1/auth/yandex/login": get_YandexLogin,
    "/v1/auth/yandex/login/callback": get_YandexLoginCallback,
    "/v1/auth/yandex/new": get_NewYandex,
    "/v1/auth/yandex/new/callback": get_NewYandexCallback,
    "/v1/auth/discord/login": get_DiscordLogin,
    "/v1/auth/discord/login/callback": get_DiscordLoginCallback,
    "/v1/auth/discord/new": get_NewDiscord,
    "/v1/auth/discord/new/callback": get_NewDiscordCallback,
    "/v1/lobbies": get_GetLobbies,
    "/v1/lobbies/{id}": get_GetLobby,
    "/v1/singleplayer": get_GetSingleplayerGames,
    "/v1/singleplayer/{id}": get_GetSingleplayerGame,
    "/v1/singleplayer/{id}/round": get_GetSingleplayerRound,
    "/v1/singleplayer/{id}/guesses": get_GetSingleplayerGameGuesses,
    "/v1/multiplayer/{id}": get_GetMultiplayerGame,
    "/v1/multiplayer/{id}/guesses": get_GetMultiplayerGameGuesses,
    "/v1/multiplayer/{id}/round": get_GetMultiplayerRound,
  },
  patch: {
    "/v1/users/me": patch_UpdateUser,
  },
  put: {
    'use updateUserAvatar function in users.ts': put_UpdateUserAvatar
  },
  post: {
    "/v1/auth/register": post_Register,
    "/v1/auth/login": post_Login,
    "/v1/auth/tokens/refresh": post_RefreshTokens,
    "/v1/lobbies": post_NewLobby,
    "/v1/singleplayer": post_NewSingleplayerGame,
    "/v1/singleplayer/{id}/end": post_EndSingleplayerGame,
    "/v1/singleplayer/{id}/round": post_NewSingleplayerRound,
    "/v1/singleplayer/{id}/round/end": post_EndSingleplayerRound,
    "/v1/multiplayer/{id}/round": post_NewMultiplayerRound,
  },
  delete: {
    "/v1/auth/sessions/{id}": delete_DeleteUserSession,
    "/v1/auth/yandex": delete_DeleteYandex,
    "/v1/auth/discord": delete_DeleteDiscord,
  },
};
export type EndpointByMethod = typeof EndpointByMethod;
// </EndpointByMethod>

// <EndpointByMethod.Shorthands>
export type GetEndpoints = EndpointByMethod["get"];
export type PatchEndpoints = EndpointByMethod["patch"];
export type PutEndpoints = EndpointByMethod["put"];
export type PostEndpoints = EndpointByMethod["post"];
export type DeleteEndpoints = EndpointByMethod["delete"];
// </EndpointByMethod.Shorthands>
