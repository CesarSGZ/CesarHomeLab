import { userCan } from "../../../_lib/auth.js";
import { json, methodNotAllowed } from "../../../_lib/http.js";
import { buildPortfolioSummary } from "../../../_lib/portfolio.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);

  const session = context.data.session;
  if (!session) {
    return json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }
  if (!userCan(session.user, "portfolio:read")) {
    return json({ ok: false, error: "not_authorised" }, { status: 403 });
  }

  try {
    const url = new URL(context.request.url);
    const data = await buildPortfolioSummary(
      context.env.PORTFOLIO_DRIVE_FILE_ID,
      { forceRefresh: url.searchParams.get("refresh") === "1" },
    );
    return json(data, {
      headers: {
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Portfolio summary failed", error?.message || error);
    const known = new Set([
      "portfolio_source_not_configured",
      "portfolio_source_unavailable",
      "portfolio_archive_invalid",
      "portfolio_entry_missing",
      "portfolio_compression_unsupported",
      "portfolio_signature_invalid",
      "portfolio_protobuf_invalid",
      "portfolio_protobuf_wire_unsupported",
    ]);
    const code = known.has(error?.message)
      ? error.message
      : "portfolio_summary_unavailable";
    return json({ ok: false, error: code }, { status: 502 });
  }
}
