FROM duckdb/duckdb:latest AS duckdb

FROM node:20-bookworm-slim

COPY --from=duckdb /duckdb /duckdb

WORKDIR /data

ENTRYPOINT ["/bin/sh"]
