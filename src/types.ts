export type CatchableFunction = (err: Error) => void;

export type Configuration = {
  arch?: string;
  bin?: string;
  categories?: string[];
  description?: string;
  execArguments?: string[];
  genericName?: string;
  homepage?: string;
  mimeType?: string[];
  name?: string;
  productDescription?: string;
  productName?: string;
  revision?: string;
};

export type DependencyType =
  | 'atspi'
  | 'drm'
  | 'gbm'
  | 'gconf'
  | 'glib2'
  | 'gtk2'
  | 'gtk3'
  | 'gvfs'
  | 'kdeCliTools'
  | 'kdeRuntime'
  | 'notify'
  | 'nss'
  | 'trashCli'
  | 'uuid'
  | 'xcbDri3'
  | 'xss'
  | 'xtst'
  | 'xdgUtils';

export type DependencyMap = Record<DependencyType, string>;

export type PackageJSON = {
  author?: string | { name?: string; email?: string; url?: string };
  description?: string;
  genericName?: string;
  homepage?: string;
  name?: string;
  productDescription?: string;
  productName?: string;
  revision?: string;
} & Record<string, unknown>;

export type ReadMetadataOptions = {
  logger: (msg: string) => void;
  src: string;
};

export type UserSuppliedOptions = {
  src?: string;
  options?: Record<string, unknown>;
} & Record<string, unknown>;
