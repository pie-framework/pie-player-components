import range from "lodash/range";

export interface ExternalImageSupport {
  insert(
    file: File,
    done: (e: Error | null, src: string) => void,
    progress?: (percent: number, bytes: number, total: number) => void
  );
  delete(src: string, done: (e?: Error) => void);
}

export class DataURLImageSupport implements ExternalImageSupport {
  insert(
    file: File,
    done: (e: Error | null, src: string) => void,
    progressFn: (percent: number, bytes: number, total: number) => void
  ) {
    const reader = new FileReader();
    reader.onload = () => {
      console.log("[reader.onload]");
      const dataURL = reader.result;
      setTimeout(() => {
        done(null, dataURL.toString());
      }, 2000);
    };
    console.log("call readAsDataUrl...", file);
    let progress = 0;
    progressFn(progress, 0, 100);
    range(1, 100).forEach(n => {
      setTimeout(() => {
        progressFn(n, n, 100);
      }, n * 20);
    });

    // if external asset support .. add reader.readAsArrayBuffer ..
    reader.readAsDataURL(file);
  }
  delete(src: string, done: (e?: Error) => void) {
    done();
  }
}
