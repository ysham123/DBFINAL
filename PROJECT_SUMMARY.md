# Project overview

ServiceDesk is a white-label application for cleaning requests, quote negotiation, orders, and billing. Clients and the administrator have separate workspaces. Each deployment configures its branding and administrator identity.

The database contains seven tables: Clients, ServiceRequests, RequestPhotos, Quotes, Orders, Bills, and BillRevisions. A client can submit multiple requests. Each request can have photos and successive quotes. Accepting a quote creates an order; a completed order can receive a bill with revision history.

Eight reports cover returning clients, unconverted requests, accepted quotes, new clients, largest jobs, overdue bills, outstanding balances, and prompt payments. The endpoint names are retained for compatibility.

See [the README](README.md) for setup, application structure, and limitations. See [the verification guide](SETUP_COMPLETE.md) for the manual workflow.
