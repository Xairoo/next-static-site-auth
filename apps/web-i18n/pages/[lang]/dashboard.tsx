import { useSession } from "next-static-site-auth";
import useSWR from "swr";
import fetcher from "../../utils/fetcher";
import Protected from "../../components/protected";
import { Trans, useTranslation } from "next-i18next-static-site";

export default function Dashboard() {
  const { status, data: session, token } = useSession({ redirect: true });
  const { t } = useTranslation();

  // Fetch some external data if authenticated
  const { data, error } = useSWR(
    token && status === "authenticated"
      ? {
          url: process.env.NEXT_PUBLIC_DATA_URL
            ? process.env.NEXT_PUBLIC_DATA_URL
            : "http://localhost:5000/data",
          method: "GET",
          token,
        }
      : null, // Fetch only if bearer token is set
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  if (status === "loading") {
    return null; // Display nothing or...

    // Display loading state
    return (
      <>
        <h1>Dashboard</h1>
        <div>Loading...</div>
      </>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <h1>Dashboard</h1>
        <Protected />
      </>
    );
  }

  if (status === "authenticated") {
    return (
      <>
        <h1>Dashboard</h1>
        <div>{t("Protected content")}.</div>
        <div>
          <Trans
            i18nKey="signedInAs"
            values={{ email: session.email }}
            components={{ em: <em /> }}
          />
        </div>

        <div>
          {!error && data && (
            <div>
              <div>{data.content}</div>
              <div>
                {t("Server time")}: {data.serverTime}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
}
