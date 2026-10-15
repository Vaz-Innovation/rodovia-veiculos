# WPGraphQL Error Status

Makes WPGraphQL answer **HTTP 500** whenever the response carries `errors`
(WPGraphQL itself answers 200 for resolver/field errors).

Why: the front end caches GraphQL operations in the Next.js Data Cache
(`fetch` with `next: { tags, revalidate }`), which stores only `200` responses.
Without this plugin, a transient resolver error would be served from that cache
until it expired. The JSON body is unchanged, so clients still read `errors`.

Installed and activated automatically by `docker-entrypoint-custom.sh`, like the
other plugins in this folder.
