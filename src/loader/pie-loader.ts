import { PieContent, PieController } from "../interface";

export interface Entry {
  package: string;
  status: Status;
  tagName: string;
  controller?: any;
  config?: Element;
  element?: Element;
}

export interface LoadedElementsQuery {
  name: string;
  tag: string;
}

export interface LoadedElementsResp {
  elements: LoadedElementsQuery[];
  val: boolean;
}

export interface BundleEndpoints {
  buildServiceBase: string;
  bundleBase: string;
}

export enum Status {
  loading = "loading",
  loaded = "loaded",
}

export enum BundleType {
  player = "player.js",
  clientPlayer = "client-player.js",
  editor = "editor.js",
}

export type LoadOpts = {
  bundle?: BundleType;
  useCdn: boolean;
};

export interface PieLoader {
  load(content: PieContent, opts: LoadOpts): Promise<void>;

  /**
   * @deprecated can we remove this?
   */
  getController(name: string): PieController;

  /**
   * @deprecated can we remove this?
   */
  elementsHaveLoaded(
    elements: LoadedElementsQuery[]
  ): Promise<LoadedElementsResp>;
}
