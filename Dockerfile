#*#################################################
#* Build stages
#*#################################################
FROM node:24.12.0-alpine3.23@sha256:c921b97d4b74f51744057454b306b418cf693865e73b8100559189605f6955b8 AS base 

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY . /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build

ARG ORIGIN
RUN if [ -z "$ORIGIN" ]; then echo "ERROR: ORIGIN is not set!"; exit 1; fi

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

#*#################################################
#* Runtime stage
#*#################################################
FROM base AS runtime

WORKDIR /app

RUN apk add --no-cache curl

COPY --from=build /app/build ./build
COPY --from=prod-deps /app/node_modules ./node_modules

RUN chown -R nobody:nogroup /app
USER nobody

HEALTHCHECK --start-period=10s --retries=3 \
    CMD [ "curl", "-f", "http://localhost:3000/api/health" ]

EXPOSE 3000
ENTRYPOINT [ "node", "build/index.js" ]
