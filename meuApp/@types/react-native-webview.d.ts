declare module 'react-native-webview' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  export interface WebViewProps extends ViewProps {
    source?: { uri?: string; html?: string };
    onMessage?: (event: { nativeEvent: { data: any } }) => void;
    injectedJavaScript?: string;
    javaScriptEnabled?: boolean;
    [key: string]: any;
  }

  export type WebView = any;
  export const WebView: any;
  export default WebView;

}
