# Authorisation boundary

Rovyniq delegates authentication to an OIDC provider; this package never parses passwords or creates tokens. It authorises already verified principal claims at the domain boundary. Production token validation must use OIDC discovery/JWKS through a maintained library in the API adapter.
