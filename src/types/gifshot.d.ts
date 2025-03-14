declare module 'gifshot' {
  interface GifshotOptions {
    images: string[];
    gifWidth?: number;
    gifHeight?: number;
    numWorkers?: number;
    interval?: number;
    progressCallback?: (progress: number) => void;
    // Add other options as needed
  }

  interface GifshotResult {
    error: boolean | string;
    errorCode?: string;
    errorMsg?: string;
    image?: string;
  }

  function createGIF(
    options: GifshotOptions, 
    callback: (result: GifshotResult) => void
  ): void;

  export { createGIF, GifshotOptions, GifshotResult };
} 