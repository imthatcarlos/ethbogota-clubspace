import StreamrClient from "streamr-client";

declare global {
  interface Window {
    client: StreamrClient;
  }
}

window.client = window.client || {};
