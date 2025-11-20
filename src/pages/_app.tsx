import QueryProvider from "@/providers/QueryProvider";
import { store } from "@/redux/store";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryProvider>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </QueryProvider>
  );
}
